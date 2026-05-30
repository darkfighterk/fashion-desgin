# routes/products.py

import os
import json
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from config.database import get_db
from config.config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS

products_bp = Blueprint("products", __name__)

# =========================
# Helpers
# =========================

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def admin_required():
    """Returns True if current JWT has admin role."""
    claims = get_jwt()
    return claims.get("role") == "admin"

def slugify(text):
    import re
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text

# =========================
# GET all products
# (with optional filters)
# =========================

@products_bp.route("/products", methods=["GET"])
def get_products():

    db     = get_db()
    cursor = db.cursor()

    category_slug = request.args.get("category")
    search        = request.args.get("search")
    page          = int(request.args.get("page",  1))
    per_page      = int(request.args.get("limit", 12))
    offset        = (page - 1) * per_page

    where_clauses = ["p.is_active = 1"]
    params        = []

    if category_slug:
        where_clauses.append("c.slug = %s")
        params.append(category_slug)

    if search:
        where_clauses.append("(p.name LIKE %s OR p.description LIKE %s)")
        params += [f"%{search}%", f"%{search}%"]

    where_sql = " AND ".join(where_clauses)

    # Count total
    cursor.execute(
        f"SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE {where_sql}",
        params
    )
    total = cursor.fetchone()["total"]

    # Fetch page
    cursor.execute(
        f"""
        SELECT p.id, p.name, p.slug, p.price, p.sale_price,
               p.stock, p.images, p.sizes, p.colors,
               p.model_3d_url, p.ar_enabled,
               c.name AS category_name, c.slug AS category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE {where_sql}
        ORDER BY p.id DESC
        LIMIT %s OFFSET %s
        """,
        params + [per_page, offset]
    )
    products = cursor.fetchall()

    # Parse JSON fields
    for p in products:
        for field in ("images", "sizes", "colors"):
            if p[field] and isinstance(p[field], str):
                p[field] = json.loads(p[field])
            if p.get("model_3d_url") is None:
                p["model_3d_url"] = ""

    return jsonify({
        "status":   True,
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "products": products
    })

# =========================
# GET single product
# =========================

@products_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):

    db     = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT p.*, c.name AS category_name, c.slug AS category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = %s AND p.is_active = 1
        """,
        (product_id,)
    )
    product = cursor.fetchone()

    if not product:
        return jsonify({"status": False, "message": "Product not found"}), 404

    for field in ("images", "sizes", "colors"):
        if product[field] and isinstance(product[field], str):
            product[field] = json.loads(product[field])
        if product.get("model_3d_url") is None:
            product["model_3d_url"] = ""

    return jsonify({"status": True, "product": product})

# =========================
# POST create product (admin)
# =========================

@products_bp.route("/products", methods=["POST"])
@jwt_required()
def create_product():

    if not admin_required():
        return jsonify({"status": False, "message": "Admin access required"}), 403

    data        = request.json or {}
    name        = data.get("name", "").strip()
    description = data.get("description", "")
    price       = data.get("price", 0)
    sale_price  = data.get("sale_price")
    stock       = data.get("stock", 0)
    category_id = data.get("category_id")
    sizes       = data.get("sizes", [])
    colors      = data.get("colors", [])
    images      = data.get("images", [])
    ar_enabled  = data.get("ar_enabled", False)

    if not name or not price:
        return jsonify({"status": False, "message": "Name and price are required"}), 400

    slug = slugify(name)

    db     = get_db()
    cursor = db.cursor()

    # Ensure unique slug
    cursor.execute("SELECT id FROM products WHERE slug = %s", (slug,))
    if cursor.fetchone():
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    cursor.execute(
        """
        INSERT INTO products
            (category_id, name, slug, description, price, sale_price,
             stock, sizes, colors, images, ar_enabled)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            category_id, name, slug, description, price, sale_price,
            stock,
            json.dumps(sizes),
            json.dumps(colors),
            json.dumps(images),
            1 if ar_enabled else 0
        )
    )
    db.commit()
    product_id = cursor.lastrowid

    return jsonify({"status": True, "message": "Product created", "product_id": product_id}), 201

# =========================
# PUT update product (admin)
# =========================

@products_bp.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):

    if not admin_required():
        return jsonify({"status": False, "message": "Admin access required"}), 403

    data   = request.json or {}
    db     = get_db()
    cursor = db.cursor()

    allowed_fields = ["name", "description", "price", "sale_price",
                      "stock", "category_id", "sizes", "colors",
                      "images", "ar_enabled", "model_3d_url", "is_active"]

    updates = []
    values  = []
    for field in allowed_fields:
        if field in data:
            updates.append(f"{field} = %s")
            val = data[field]
            if field in ("sizes", "colors", "images") and isinstance(val, list):
                val = json.dumps(val)
            values.append(val)

    if not updates:
        return jsonify({"status": False, "message": "No fields to update"}), 400

    values.append(product_id)
    cursor.execute(
        f"UPDATE products SET {', '.join(updates)} WHERE id = %s",
        values
    )
    db.commit()

    return jsonify({"status": True, "message": "Product updated"})

# =========================
# DELETE product (admin)
# =========================

@products_bp.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):

    if not admin_required():
        return jsonify({"status": False, "message": "Admin access required"}), 403

    db     = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE products SET is_active = 0 WHERE id = %s", (product_id,))
    db.commit()

    return jsonify({"status": True, "message": "Product removed"})

# =========================
# POST upload product image / 3D model (admin)
# =========================

@products_bp.route("/products/<int:product_id>/upload", methods=["POST"])
@jwt_required()
def upload_product_file(product_id):

    if not admin_required():
        return jsonify({"status": False, "message": "Admin access required"}), 403

    if "file" not in request.files:
        return jsonify({"status": False, "message": "No file provided"}), 400

    file = request.files["file"]

    if not allowed_file(file.filename):
        return jsonify({"status": False, "message": "File type not allowed"}), 400

    ext      = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{product_id}_{uuid.uuid4().hex[:8]}.{ext}"

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    file_url = f"/uploads/products/{filename}"

    db     = get_db()
    cursor = db.cursor()

    # If it's a 3D model, update model_3d_url
    if ext in ("glb", "gltf"):
        cursor.execute(
            "UPDATE products SET model_3d_url = %s, ar_enabled = 1 WHERE id = %s",
            (file_url, product_id)
        )
        db.commit()
        return jsonify({"status": True, "model_3d_url": file_url})

    # Otherwise append to images JSON array
    cursor.execute("SELECT images FROM products WHERE id = %s", (product_id,))
    row    = cursor.fetchone()
    images = json.loads(row["images"]) if row and row["images"] else []
    images.append(file_url)

    cursor.execute(
        "UPDATE products SET images = %s WHERE id = %s",
        (json.dumps(images), product_id)
    )
    db.commit()

    return jsonify({"status": True, "image_url": file_url, "all_images": images})
