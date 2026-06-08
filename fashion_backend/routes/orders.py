# routes/orders.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from config.database import get_db

orders_bp = Blueprint("orders", __name__)

def admin_required():
    claims = get_jwt()
    return claims.get("role") == "admin"

# =========================
# POST place order
# (from cart or direct buy)
# =========================

@orders_bp.route("/orders", methods=["POST"])
@jwt_required()
def place_order():

    user_id = get_jwt_identity()
    data    = request.json or {}

    shipping_name    = data.get("shipping_name", "")
    shipping_address = data.get("shipping_address", "")
    shipping_city    = data.get("shipping_city", "")
    shipping_zip     = data.get("shipping_zip", "")
    payment_method   = data.get("payment_method", "cod")

    # ── Status logic ──────────────────────────────────────
    # bank transfer → pending (admin must verify payment)
    # card / cod    → confirmed (payment done or pay on delivery)
    initial_status = "pending" if payment_method == "bank" else "confirmed"
    # ──────────────────────────────────────────────────────

    db     = get_db()
    cursor = db.cursor()

    # Fetch cart
    cursor.execute(
        """
        SELECT c.id AS cart_id, c.product_id, c.quantity, c.size, c.color,
               p.price, p.sale_price, p.stock, p.name
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = %s
        """,
        (user_id,)
    )
    cart_items = cursor.fetchall()

    if not cart_items:
        return jsonify({"status": False, "message": "Cart is empty"}), 400

    # Validate stock and compute total
    total = 0
    for item in cart_items:
        if item["stock"] < item["quantity"]:
            return jsonify({
                "status":  False,
                "message": f"Not enough stock for {item['name']}"
            }), 400
        price  = item["sale_price"] or item["price"]
        total += float(price) * item["quantity"]

    total = round(total, 2)

    # Create order — with correct initial status
    cursor.execute(
        """
        INSERT INTO orders
            (user_id, total_amount, shipping_name, shipping_address,
             shipping_city, shipping_zip, payment_method, status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (user_id, total, shipping_name, shipping_address,
         shipping_city, shipping_zip, payment_method, initial_status)
    )
    order_id = cursor.lastrowid

    # Create order items and decrement stock
    for item in cart_items:
        price = item["sale_price"] or item["price"]
        cursor.execute(
            """
            INSERT INTO order_items (order_id, product_id, size, color, quantity, unit_price)
            VALUES (%s,%s,%s,%s,%s,%s)
            """,
            (order_id, item["product_id"], item["size"], item["color"],
             item["quantity"], float(price))
        )
        cursor.execute(
            "UPDATE products SET stock = stock - %s WHERE id = %s",
            (item["quantity"], item["product_id"])
        )

    # Clear cart
    cursor.execute("DELETE FROM cart WHERE user_id = %s", (user_id,))

    db.commit()

    return jsonify({
        "status":         True,
        "message":        "Order placed successfully",
        "order_id":       order_id,
        "total":          total,
        "order_status":   initial_status       # frontend can read this
    }), 201

# =========================
# GET my orders
# =========================

@orders_bp.route("/orders/my", methods=["GET"])
@jwt_required()
def my_orders():

    user_id = get_jwt_identity()
    db      = get_db()
    cursor  = db.cursor()

    cursor.execute(
        "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,)
    )
    orders = cursor.fetchall()

    for order in orders:
        cursor.execute(
            """
            SELECT oi.*, p.name, p.images
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = %s
            """,
            (order["id"],)
        )
        order["items"] = cursor.fetchall()

    return jsonify({"status": True, "orders": orders})

# =========================
# GET single order detail
# =========================

@orders_bp.route("/orders/<int:order_id>", methods=["GET"])
@jwt_required()
def order_detail(order_id):

    user_id = get_jwt_identity()
    db      = get_db()
    cursor  = db.cursor()

    cursor.execute(
        "SELECT * FROM orders WHERE id = %s AND user_id = %s",
        (order_id, user_id)
    )
    order = cursor.fetchone()

    if not order:
        return jsonify({"status": False, "message": "Order not found"}), 404

    cursor.execute(
        """
        SELECT oi.*, p.name, p.images, p.model_3d_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = %s
        """,
        (order_id,)
    )
    order["items"] = cursor.fetchall()

    return jsonify({"status": True, "order": order})

# =========================
# PUT update order status (admin)
# =========================

@orders_bp.route("/orders/<int:order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):

    if not admin_required():
        return jsonify({"status": False, "message": "Admin access required"}), 403

    data   = request.json or {}
    status = data.get("status")

    valid = ("pending", "confirmed", "shipped", "delivered", "cancelled")
    if status not in valid:
        return jsonify({"status": False, "message": f"Status must be one of: {valid}"}), 400

    db     = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE orders SET status = %s WHERE id = %s", (status, order_id))
    db.commit()

    return jsonify({"status": True, "message": f"Order status updated to {status}"})

# =========================
# GET all orders (admin)
# =========================

@orders_bp.route("/orders", methods=["GET"])
@jwt_required()
def all_orders():

    if not admin_required():
        return jsonify({"status": False, "message": "Admin access required"}), 403

    db     = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT o.*, u.name AS user_name, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        """
    )
    orders = cursor.fetchall()

    return jsonify({"status": True, "orders": orders})