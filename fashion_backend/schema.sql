-- ============================================================
-- Fashion Store Database Schema
-- fashion_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS fashion_db;
USE fashion_db;

-- ============================================================
-- Users Table
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)         NOT NULL,
    email       VARCHAR(150)         NOT NULL UNIQUE,
    password    VARCHAR(255)         NOT NULL,
    role        ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at  TIMESTAMP            DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Categories Table
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url   VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Products Table
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT,
    name            VARCHAR(200)   NOT NULL,
    slug            VARCHAR(200)   NOT NULL UNIQUE,
    description     TEXT,
    price           DECIMAL(10,2)  NOT NULL,
    sale_price      DECIMAL(10,2)  DEFAULT NULL,
    stock           INT            NOT NULL DEFAULT 0,
    sizes           JSON,          -- e.g. ["XS","S","M","L","XL"]
    colors          JSON,          -- e.g. ["Red","Blue","Black"]
    images          JSON,          -- array of image URLs
    model_3d_url    VARCHAR(255)   DEFAULT NULL,   -- .glb / .gltf file
    ar_enabled      TINYINT(1)     DEFAULT 0,
    is_active       TINYINT(1)     DEFAULT 1,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- Cart Table
-- ============================================================

CREATE TABLE IF NOT EXISTS cart (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT            NOT NULL,
    product_id  INT            NOT NULL,
    size        VARCHAR(20),
    color       VARCHAR(50),
    quantity    INT            NOT NULL DEFAULT 1,
    added_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- Orders Table
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    total_amount    DECIMAL(10,2)   NOT NULL,
    status          ENUM('pending','confirmed','shipped','delivered','cancelled')
                                    NOT NULL DEFAULT 'pending',
    shipping_name   VARCHAR(150),
    shipping_address TEXT,
    shipping_city   VARCHAR(100),
    shipping_zip    VARCHAR(20),
    payment_method  VARCHAR(50)     DEFAULT 'cod',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Order Items Table
-- ============================================================

CREATE TABLE IF NOT EXISTS order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT             NOT NULL,
    product_id  INT             NOT NULL,
    size        VARCHAR(20),
    color       VARCHAR(50),
    quantity    INT             NOT NULL,
    unit_price  DECIMAL(10,2)  NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- Sample Categories
-- ============================================================

INSERT INTO categories (name, slug, description) VALUES
('Men', 'men', "Men's fashion collection"),
('Women', 'women', "Women's fashion collection"),
('Kids', 'kids', "Kids fashion collection"),
('Accessories', 'accessories', 'Bags, belts, and accessories');
