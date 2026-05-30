# app.py  — Fashion Store Backend

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config.config import JWT_SECRET_KEY, UPLOAD_FOLDER, MAX_CONTENT_LENGTH
from routes.auth       import auth_bp
from routes.products   import products_bp
from routes.categories import categories_bp
from routes.cart       import cart_bp
from routes.orders     import orders_bp

# =========================
# App Init
# =========================

app = Flask(__name__)

from flask_cors import CORS

CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

app.config["JWT_SECRET_KEY"]      = JWT_SECRET_KEY
app.config["UPLOAD_FOLDER"]       = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"]  = MAX_CONTENT_LENGTH

jwt = JWTManager(app)

# =========================
# Register Blueprints
# =========================

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(orders_bp)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(
        os.path.join(BASE_DIR, "uploads"),
        filename
    )
# =========================
# Serve Uploaded Files
# =========================

@app.route("/uploads/products/<filename>")
def serve_product_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# =========================
# Health Check
# =========================

@app.route("/health")
def health():
    return {"status": True, "message": "Fashion API running"}

# =========================
# Run
# =========================

if __name__ == "__main__":
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=5000)
