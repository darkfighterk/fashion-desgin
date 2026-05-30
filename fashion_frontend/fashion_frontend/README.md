# Fashion Store — React Frontend

Clean, elegant React frontend for the LUXE fashion e-commerce store.  
Supports 3D model viewing and AR via Google's `<model-viewer>` web component.

---

## Project Structure

```
src/
├── App.js
├── index.js / index.css          ← Global styles & fonts
├── services/api.js               ← All API calls to Flask backend
├── context/
│   ├── AuthContext.js            ← Login state
│   └── CartContext.js            ← Cart state
├── components/
│   ├── layout/Navbar.js + .css
│   ├── layout/Footer.js + .css
│   └── ui/ProductCard.js + .css
└── pages/
    ├── Home.js / .css            ← Hero, categories, featured products
    ├── Shop.js / .css            ← Product listing with filters + search
    ├── ProductDetail.js / .css   ← Product page with 3D/AR viewer
    ├── Cart.js / .css            ← Shopping cart
    ├── Checkout.js / .css        ← Place order
    ├── Login.js                  ← Auth
    ├── Register.js               ← Auth
    ├── Auth.css                  ← Shared auth styles
    └── Orders.js / .css          ← Order history
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. (Optional) set backend URL in .env
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# 3. Start development server
npm start
```

Open: http://localhost:3000  
Make sure Flask backend is running on port 5000.

---

## Pages

| Route           | Page         | Description                        |
|-----------------|--------------|------------------------------------|
| /               | Home         | Hero, categories, featured grid    |
| /shop           | Shop         | All products with filter + search  |
| /shop/:id       | Product      | Detail, size/color picker, 3D/AR   |
| /cart           | Cart         | Cart items, update qty, totals     |
| /checkout       | Checkout     | Shipping form, place order         |
| /orders         | Orders       | Order history                      |
| /login          | Login        | JWT authentication                 |
| /register       | Register     | New account                        |

---

## 3D / AR Feature

On the Product Detail page:
- If a product has `ar_enabled: true` and a `model_3d_url`, a **"3D View"** button appears
- Clicking it shows Google's `<model-viewer>` with full 360° rotation
- On mobile, an **"AR"** button appears automatically to place the item in your room

To enable for a product:
1. Upload a `.glb` file via `POST /products/:id/upload` in the backend
2. The backend sets `model_3d_url` and `ar_enabled` automatically

---

## Design

- **Fonts**: Cormorant Garamond (display) + DM Sans (body)
- **Palette**: Warm cream `#f5f0e8`, black `#111`, gold accent `#c4975a`
- **Style**: Editorial luxury — clean, minimal, fashion-forward
