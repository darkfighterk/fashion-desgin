import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">LUXE</span>
          <p>Contemporary fashion for the modern wardrobe.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <Link to="/shop?category=women">Women</Link>
            <Link to="/shop?category=men">Men</Link>
            <Link to="/shop?category=kids">Kids</Link>
            <Link to="/shop?category=accessories">Accessories</Link>
          </div>
          <div>
            <h4>Help</h4>
            <Link to="/orders">My Orders</Link>
            <a href="#shipping">Shipping</a>
            <a href="#returns">Returns</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© 2025 LUXE Fashion. All rights reserved.</p>
      </div>
    </footer>
  );
}
