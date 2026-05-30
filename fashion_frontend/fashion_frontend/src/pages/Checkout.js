import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    shipping_name: user?.name || '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
    payment_method: 'cod'
  });

  const handleChange = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await placeOrder(form);
      if (r.status) { clear(); navigate('/orders'); }
      else setError(r.message || 'Failed to place order');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  if (!user) { navigate('/login'); return null; }
  if (!items.length) { navigate('/cart'); return null; }

  return (
    <div className="checkout-page container fade-up">
      <h1 className="page-title" style={{marginBottom:36}}>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping Details</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input name="shipping_name" value={form.shipping_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="shipping_address" value={form.shipping_address} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input name="shipping_city" value={form.shipping_city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ZIP / Postal Code</label>
              <input name="shipping_zip" value={form.shipping_zip} onChange={handleChange} required />
            </div>
          </div>

          <h2 style={{marginTop:28}}>Payment</h2>
          <div className="payment-options">
            {['cod','card','bank'].map(m => (
              <label key={m} className={`payment-opt ${form.payment_method === m ? 'selected' : ''}`}>
                <input type="radio" name="payment_method" value={m}
                  checked={form.payment_method === m} onChange={handleChange}/>
                <span>{m === 'cod' ? '💵 Cash on Delivery' : m === 'card' ? '💳 Card' : '🏦 Bank Transfer'}</span>
              </label>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" style={{width:'100%',marginTop:28,padding:'14px'}}
            disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.id} className="co-item">
              <div className="co-item-img">
                {item.images?.[0]
                  ? <img src={`http://localhost:5000${item.images[0]}`} alt={item.name}/>
                  : <div className="img-placeholder"/>}
              </div>
              <div>
                <p className="co-item-name">{item.name}</p>
                <p className="co-item-meta">
                  {item.size && `${item.size} `}{item.color && `· ${item.color} `}× {item.quantity}
                </p>
              </div>
              <p className="co-item-price">${item.subtotal?.toFixed(2)}</p>
            </div>
          ))}
          <div className="co-total">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
