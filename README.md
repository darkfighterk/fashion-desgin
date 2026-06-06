# Admin Panel & Role-Based Access Control

A complete RBAC architecture separating customer and administrative operations, with full dashboard management, secure authentication, and a 3D/AR-ready storefront.

---

## Table of Contents

- [Roles & Permissions](#roles--permissions)
- [Admin Dashboard Features](#admin-dashboard-features)
- [Authentication & Security](#authentication--security)
- [Future Enhancements](#future-enhancements)

---

## Roles & Permissions

### 👤 Customer

Basic storefront access for end users.

| Permission | Description |
|---|---|
| Browse products | View and search the product catalog |
| Filter & search | Apply filters and keyword search |
| Product details | View full product information |
| 3D / AR preview | View 3D `.glb` models and AR previews |
| Cart | Add products and manage cart |
| Orders | Place orders and view order history |
| Profile | Manage personal account details |

---

### 🛍️ Store Manager

Operational access for day-to-day store management.

| Permission | Description |
|---|---|
| Product management | Create, update, and manage products |
| Image upload | Upload and manage product images |
| 3D model upload | Upload `.glb` models for AR previews |
| Inventory | Track stock levels and manage inventory |
| Order processing | View and process customer orders |
| Sales monitoring | Monitor sales activity |

---

### 👨‍💼 Administrator

Full system access with complete control over all resources.

| Permission | Description |
|---|---|
| User management | View, edit, and manage user accounts |
| Role management | Assign and configure user roles |
| Product management | Full product and category control |
| Order management | View, update, refund, and invoice orders |
| Inventory control | Full inventory oversight |
| Analytics | Access revenue, sales, and customer reports |
| System settings | Configure platform-wide settings |

---

## Admin Dashboard Features

### 📦 Product Management

- Create, update, and delete products
- Manage product categories
- Upload product images
- Upload 3D `.glb` models

### 🗃️ Inventory Management

- Real-time stock tracking
- Low stock alerts
- Manual inventory updates

### 🧾 Order Management

- View all customer orders
- Update order status
- Process refunds
- Generate invoices

### 👥 User Management

- View and search users
- Edit user accounts
- Assign roles and manage permissions

### 📊 Analytics

- Revenue reports
- Product performance metrics
- Customer insights
- Sales trend analysis

---

## Authentication & Security

| Feature | Details |
|---|---|
| **JWT Authentication** | Stateless token-based auth for all API requests |
| **Protected Routes** | Frontend and backend route guards by role |
| **Role-Based Authorization** | Middleware enforces permissions per endpoint |
| **Secure API Endpoints** | All sensitive endpoints require valid tokens |
| **Password Hashing** | Passwords stored with strong hashing (e.g. bcrypt) |
| **Session Management** | Token expiry and refresh flow |

---

## Future Enhancements

| Feature | Description |
|---|---|
| Multi-Vendor Marketplace | Support for multiple independent sellers |
| Staff Management | Manage store staff accounts and shifts |
| Supplier Management | Supplier onboarding and order tracking |
| Multi-Store Support | Run and manage multiple storefronts |
| Advanced Permissions | Granular, resource-level permission system |
| AI Product Recommendations | Personalized recommendations using ML |
| Customer Loyalty Program | Points, rewards, and tier-based incentives |

---

## Tech Stack Notes

- **Auth:** JWT with role claims
- **3D Support:** `.glb` model upload and AR preview
- **API:** Role-protected REST endpoints
- **Frontend:** Protected route components per role level

---

> For setup and installation instructions, see the main project documentation.
