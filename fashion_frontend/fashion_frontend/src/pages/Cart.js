import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

export default function Cart() {
  const { items, total, remove, update, loading } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  if (!user) return (
    <div className="cart-empty container">
      <p>Please <Link to="/login">login</Link> to view your cart.</p>
    </div>
  );

  if (loading) return <div className="cart-empty container">Loading...</div>;

  if (items.length === 0) return (
    <div className="cart-empty container">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <h2>Your cart is empty</h2>
      <Link to="/shop" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="cart-page container fade-up">
      <h1 className="page-title" style={{marginBottom:36}}>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img">
                {item.images?.[0]
                  ? <img src={`http://localhost:5000${item.images[0]}`} alt={item.name}/>
                  : <div className="img-placeholder"/>}
              </div>
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-meta">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </p>
                <p className="cart-item-price">${item.sale_price || item.price}</p>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => update(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => update(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-sub">
                <p>${item.subtotal?.toFixed(2)}</p>
                <button className="remove-btn" onClick={() => remove(item.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn-primary" style={{width:'100%',marginTop:24}}
            onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link to="/shop" style={{display:'block',textAlign:'center',marginTop:16,fontSize:13,color:'var(--gray)'}}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
