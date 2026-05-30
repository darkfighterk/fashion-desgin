# config/config.py
import os

MYSQL_HOST     = "localhost"
MYSQL_USER     = "root"
MYSQL_PASSWORD = ""
MYSQL_DB       = "fashion_db"

JWT_SECRET_KEY = "fashion_secret_key"

UPLOAD_FOLDER      = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "products")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "glb", "gltf"}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024