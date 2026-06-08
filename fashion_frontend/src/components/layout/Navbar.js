import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { count } = useCart();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logoutUser(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="nav-inner container">
        <Link to="/" className="nav-logo">
        <img src="/logo.png" alt="logo" className="logo" style={{ width: "75px", height: "75px" }}/>MODERN MIX</Link>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          <li><Link to="/"     onClick={() => setOpen(false)}>Home</Link></li>
          <li><Link to="/shop" onClick={() => setOpen(false)}>Shop</Link></li>
          {user && <li><Link to="/orders" onClick={() => setOpen(false)}>Orders</Link></li>}
        </ul>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>

          {user ? (
            <div className="nav-user">
              <span className="nav-username">{user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="nav-logout">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn-outline" style={{padding:'7px 18px',fontSize:'12px'}}>Login</Link>
          )}

          <button className="nav-hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </nav>
  );
}
