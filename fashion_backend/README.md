# Fashion Store — Backend API

Flask + MySQL REST API for the Fashion Textile E-Commerce store.  
Built with JWT auth, cart, orders, product management, and 3D/AR model upload support.

---

## Project Structure

```
fashion_backend/
├── app.py                  ← Entry point
├── requirements.txt
├── schema.sql              ← Run this first in MySQL
├── config/
│   ├── config.py           ← DB credentials, JWT secret
│   └── database.py         ← MySQL connection (auto-reconnect)
├── routes/
│   ├── auth.py             ← /register  /login  /profile
│   ├── products.py         ← /products  + file upload
│   ├── categories.py       ← /categories
│   ├── cart.py             ← /cart
│   └── orders.py           ← /orders
└── uploads/
    └── products/           ← Product images + .glb 3D models stored here
```

---

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create database
mysql -u root -p < schema.sql

# 3. Run server
python app.py
```

Server starts at: `http://localhost:5000`

---

## API Reference

### Auth

| Method | Endpoint    | Auth | Description          |
|--------|-------------|------|----------------------|
| POST   | /register   | No   | Create account       |
| POST   | /login      | No   | Login → returns JWT  |
| GET    | /profile    | JWT  | Current user profile |

**Register body:**
```json
{ "name": "Aisha", "email": "a@test.com", "password": "abc123" }
```

**Login body:**
```json
{ "email": "a@test.com", "password": "abc123" }
```

**Login response:**
```json
{
  "status": true,
  "token": "eyJ...",
  "user": { "id": 1, "name": "Aisha", "email": "...", "role": "user" }
}
```

Use the token in all protected requests:
```
Authorization: Bearer <token>
```

---

### Products

| Method | Endpoint                          | Auth       | Description           |
|--------|-----------------------------------|------------|-----------------------|
| GET    | /products                         | No         | List products         |
| GET    | /products?category=women          | No         | Filter by category    |
| GET    | /products?search=shirt            | No         | Search products       |
| GET    | /products?page=1&limit=12         | No         | Pagination            |
| GET    | /products/:id                     | No         | Single product        |
| POST   | /products                         | JWT Admin  | Create product        |
| PUT    | /products/:id                     | JWT Admin  | Update product        |
| DELETE | /products/:id                     | JWT Admin  | Soft delete           |
| POST   | /products/:id/upload              | JWT Admin  | Upload image or .glb  |

**Create product body:**
```json
{
  "name": "Silk Blouse",
  "description": "100% pure silk",
  "price": 89.99,
  "sale_price": 69.99,
  "stock": 50,
  "category_id": 2,
  "sizes": ["XS", "S", "M", "L", "XL"],
  "colors": ["White", "Black", "Navy"],
  "images": [],
  "ar_enabled": false
}
```

**Product with 3D model:**
- Upload a `.glb` or `.gltf` file to `POST /products/:id/upload`
- `model_3d_url` will be set automatically
- `ar_enabled` will be set to `true`
- React frontend reads `model_3d_url` to render with `@react-three/fiber` or `<model-viewer>`

---

### Categories

| Method | Endpoint      | Auth      | Description       |
|--------|---------------|-----------|-------------------|
| GET    | /categories   | No        | List categories   |
| POST   | /categories   | JWT Admin | Create category   |

---

### Cart

| Method | Endpoint          | Auth | Description          |
|--------|-------------------|------|----------------------|
| GET    | /cart             | JWT  | Get cart             |
| POST   | /cart             | JWT  | Add item to cart     |
| PUT    | /cart/:id         | JWT  | Update quantity      |
| DELETE | /cart/:id         | JWT  | Remove item          |
| DELETE | /cart/clear       | JWT  | Clear entire cart    |

**Add to cart body:**
```json
{
  "product_id": 3,
  "size": "M",
  "color": "Black",
  "quantity": 2
}
```

---

### Orders

| Method | Endpoint                   | Auth      | Description          |
|--------|----------------------------|-----------|----------------------|
| POST   | /orders                    | JWT       | Place order (from cart) |
| GET    | /orders/my                 | JWT       | My order history     |
| GET    | /orders/:id                | JWT       | Order detail         |
| GET    | /orders                    | JWT Admin | All orders           |
| PUT    | /orders/:id/status         | JWT Admin | Update order status  |

**Place order body:**
```json
{
  "shipping_name": "Aisha Fernando",
  "shipping_address": "123 Galle Road",
  "shipping_city": "Colombo",
  "shipping_zip": "00300",
  "payment_method": "cod"
}
```

---

## Admin User

To make a user admin, update the database directly:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@yourstore.com';
```

---

## Next Steps (3D / AR)

The backend is ready. When you build the React frontend:

- Use `@google/model-viewer` web component for AR on mobile
- Use `@react-three/fiber` + `@react-three/drei` for 3D viewer
- Upload `.glb` files via `POST /products/:id/upload`
- The API returns `model_3d_url` and `ar_enabled` on every product
