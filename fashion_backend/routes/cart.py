# routes/cart.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config.database import get_db

cart_bp = Blueprint("cart", __name__)

# =========================
# GET cart for current user
# =========================

@cart_bp.route("/cart", methods=["GET"])
@jwt_required()
def get_cart():

    user_id = get_jwt_identity()
    db      = get_db()
    cursor  = db.cursor()

    cursor.execute(
        """
        SELECT c.id, c.quantity, c.size, c.color,
               p.id AS product_id, p.name, p.price, p.sale_price,
               p.images, p.model_3d_url, p.ar_enabled
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = %s
        ORDER BY c.added_at DESC
        """,
        (user_id,)
    )
    items = cursor.fetchall()

    import json
    total = 0
    for item in items:
        if item["images"] and isinstance(item["images"], str):
            item["images"] = json.loads(item["images"])
        effective_price    = item["sale_price"] or item["price"]
        item["subtotal"]   = float(effective_price) * item["quantity"]
        total             += item["subtotal"]

    return jsonify({"status": True, "items": items, "total": round(total, 2)})

# =========================
# POST add to cart
# =========================

@cart_bp.route("/cart", methods=["POST"])
@jwt_required()
def add_to_cart():

    user_id    = get_jwt_identity()
    data       = request.json or {}
    product_id = data.get("product_id")
    size       = data.get("size", "")
    color      = data.get("color", "")
    quantity   = int(data.get("quantity", 1))

    if not product_id:
        return jsonify({"status": False, "message": "product_id required"}), 400

    db     = get_db()
    cursor = db.cursor()

    # Check stock
    cursor.execute("SELECT stock FROM products WHERE id = %s AND is_active = 1", (product_id,))
    product = cursor.fetchone()
    if not product:
        return jsonify({"status": False, "message": "Product not found"}), 404
    if product["stock"] < quantity:
        return jsonify({"status": False, "message": "Not enough stock"}), 400

    # If same product+size+color already in cart, update quantity
    cursor.execute(
        "SELECT id, quantity FROM cart WHERE user_id=%s AND product_id=%s AND size=%s AND color=%s",
        (user_id, product_id, size, color)
    )
    existing = cursor.fetchone()

    if existing:
        cursor.execute(
            "UPDATE cart SET quantity = quantity + %s WHERE id = %s",
            (quantity, existing["id"])
        )
    else:
        cursor.execute(
            "INSERT INTO cart (user_id, product_id, size, color, quantity) VALUES (%s,%s,%s,%s,%s)",
            (user_id, product_id, size, color, quantity)
        )

    db.commit()
    return jsonify({"status": True, "message": "Added to cart"}), 201

# =========================
# PUT update cart item quantity
# =========================

@cart_bp.route("/cart/<int:cart_id>", methods=["PUT"])
@jwt_required()
def update_cart(cart_id):

    user_id  = get_jwt_identity()
    data     = request.json or {}
    quantity = int(data.get("quantity", 1))

    if quantity < 1:
        return jsonify({"status": False, "message": "Quantity must be at least 1"}), 400

    db     = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE cart SET quantity = %s WHERE id = %s AND user_id = %s",
        (quantity, cart_id, user_id)
    )
    db.commit()

    return jsonify({"status": True, "message": "Cart updated"})

# =========================
# DELETE remove cart item
# =========================

@cart_bp.route("/cart/<int:cart_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(cart_id):

    user_id = get_jwt_identity()
    db      = get_db()
    cursor  = db.cursor()

    cursor.execute("DELETE FROM cart WHERE id = %s AND user_id = %s", (cart_id, user_id))
    db.commit()

    return jsonify({"status": True, "message": "Item removed"})

# =========================
# DELETE clear entire cart
# =========================

@cart_bp.route("/cart/clear", methods=["DELETE"])
@jwt_required()
def clear_cart():

    user_id = get_jwt_identity()
    db      = get_db()
    cursor  = db.cursor()

    cursor.execute("DELETE FROM cart WHERE user_id = %s", (user_id,))
    db.commit()

    return jsonify({"status": True, "message": "Cart cleared"})
