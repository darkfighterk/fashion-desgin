# routes/categories.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from config.database import get_db

categories_bp = Blueprint("categories", __name__)

def admin_required():
    claims = get_jwt()
    return claims.get("role") == "admin"

# =========================
# GET all categories
# =========================

@categories_bp.route("/categories", methods=["GET"])
def get_categories():

    db     = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM categories ORDER BY name")
    categories = cursor.fetchall()

    return jsonify({"status": True, "categories": categories})

# =========================
# POST create category (admin)
# =========================

@categories_bp.route("/categories", methods=["POST"])
@jwt_required()
def create_category():

    if not admin_required():
        return jsonify({"status": False, "message": "Admin access required"}), 403

    data        = request.json or {}
    name        = data.get("name", "").strip()
    slug        = data.get("slug", "").strip().lower().replace(" ", "-")
    description = data.get("description", "")
    image_url   = data.get("image_url", "")

    if not name or not slug:
        return jsonify({"status": False, "message": "Name and slug required"}), 400

    db     = get_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO categories (name, slug, description, image_url) VALUES (%s,%s,%s,%s)",
        (name, slug, description, image_url)
    )
    db.commit()

    return jsonify({"status": True, "message": "Category created", "id": cursor.lastrowid}), 201
