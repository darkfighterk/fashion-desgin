# routes/auth.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
import bcrypt
from config.database import get_db

auth_bp = Blueprint("auth", __name__)

# =========================
# Register
# =========================

@auth_bp.route("/register", methods=["POST"])
def register():

    data     = request.json or {}
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"status": False, "message": "All fields are required"}), 400

    db     = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({"status": False, "message": "Email already exists"}), 409

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed)
    )
    db.commit()

    return jsonify({"status": True, "message": "Register success"}), 201

# =========================
# Login
# =========================

@auth_bp.route("/login", methods=["POST"])
def login():

    data     = request.json or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    db     = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):

        token = create_access_token(
            identity=str(user["id"]),
            additional_claims={"role": user["role"], "name": user["name"]}
        )

        return jsonify({
            "status":  True,
            "message": "Login success",
            "token":   token,
            "user": {
                "id":    user["id"],
                "name":  user["name"],
                "email": user["email"],
                "role":  user["role"]
            }
        })

    return jsonify({"status": False, "message": "Invalid email or password"}), 401

# =========================
# Profile (protected)
# =========================

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()
    db      = get_db()
    cursor  = db.cursor()

    cursor.execute(
        "SELECT id, name, email, role, created_at FROM users WHERE id = %s",
        (user_id,)
    )
    user = cursor.fetchone()

    if not user:
        return jsonify({"status": False, "message": "User not found"}), 404

    return jsonify({"status": True, "user": user})
