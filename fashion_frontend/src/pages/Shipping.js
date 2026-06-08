// src/pages/Shipping.js
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './InfoPage.css';
import './Shipping.css';

const API = 'http://localhost:5000';

// Status steps — delivered is the final step that removes the card
const STEPS = ['confirmed', 'shipped', 'delivered'];

const STEP_LABELS = {
  confirmed: 'Order Confirmed',
  shipped:   'Shipped',
  delivered: 'Delivered',
};

const STEP_ICONS = {
  confirmed: '✅',
  shipped:   '🚚',
  delivered: '📦',
};

function StatusTracker({ status }) {
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="status-tracker">
      {STEPS.map((s, i) => (
        <div key={s} className="tracker-step-wrap">
          <div className={`tracker-step ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}`}>
            <span className="tracker-icon">{STEP_ICONS[s]}</span>
            <span className="tracker-label">{STEP_LABELS[s]}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`tracker-line ${i < currentIdx ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderShippingCard({ order }) {
  const date = new Date(order.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="shipping-order-card">
      <div className="shipping-order-header">
        <div>
          <span className="shipping-order-id">Order #{order.id}</span>
          <span className="shipping-order-date">{date}</span>
        </div>
        <div className="shipping-order-meta">
          <span className="shipping-order-total">${Number(order.total_amount).toFixed(2)}</span>
          <span className={`shipping-status-badge status-${order.status}`}>
            {STEP_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Items preview */}
      <div className="shipping-items-preview">
        {(order.items || []).slice(0, 3).map(item => (
          <div key={item.id} className="shipping-item-chip">
            <div className="shipping-item-thumb">
              {item.images?.[0]
                ? <img src={`${API}${item.images[0]}`} alt={item.name} />
                : <div className="thumb-placeholder" />}
            </div>
            <span>{item.name}</span>
            {item.size  && <span className="chip-meta">· {item.size}</span>}
            {item.color && <span className="chip-meta">· {item.color}</span>}
            <span className="chip-meta">× {item.quantity}</span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <span className="shipping-more">+{order.items.length - 3} more</span>
        )}
      </div>

      {/* Live tracker */}
      <StatusTracker status={order.status} />

      {/* Shipping address */}
      <div className="shipping-address">
        <span className="shipping-address-label">📍 Delivering to</span>
        <span>{order.shipping_name} — {order.shipping_address}, {order.shipping_city} {order.shipping_zip}</span>
      </div>
    </div>
  );
}

export default function Shipping() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API}/orders/my`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.status) {
          // Show only confirmed + shipped — hide pending (bank) and delivered
          const active = (data.orders || []).filter(
            o => o.status === 'confirmed' || o.status === 'shipped'
          );
          setOrders(active);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ── Not logged in: show default static info page ──
  if (!user) {
    return (
      <div className="info-page">
        <div className="container">
          <div className="info-hero">
            <span className="badge">Delivery</span>
            <h1 className="page-title">Shipping Policy</h1>
            <p className="info-lead">Free delivery on orders over $100. Fast, tracked, reliable.</p>
          </div>

          <div className="info-grid">
            <section className="info-card">
              <div className="info-card-icon"><img src="images/11.png" alt="Standard" /></div>
              <h2>Standard Shipping</h2>
              <p>Delivered within <strong>5–7 business days</strong>. Available islandwide.</p>
              <div className="info-rate">
                <span>Orders under $100</span><strong>$4.99</strong>
              </div>
              <div className="info-rate free">
                <span>Orders $100 and above</span><strong>FREE</strong>
              </div>
            </section>

            <section className="info-card">
              <div className="info-card-icon"><img src="images/14.png" alt="Express" /></div>
              <h2>Express Shipping</h2>
              <p>Need it fast? Express delivery reaches you within <strong>1–2 business days</strong>.</p>
              <div className="info-rate">
                <span>All orders</span><strong>$9.99</strong>
              </div>
            </section>

            <section className="info-card">
              <div className="info-card-icon"><img src="images/12.png" alt="International" /></div>
              <h2>International</h2>
              <p>We ship to select countries. Delivery takes <strong>10–18 business days</strong> depending on destination.</p>
              <div className="info-rate">
                <span>Starting from</span><strong>$19.99</strong>
              </div>
            </section>

            <section className="info-card">
              <div className="info-card-icon"><img src="images/13.png" alt="Processing" /></div>
              <h2>Order Processing</h2>
              <p>Orders placed before <strong>2 PM</strong> on business days are processed same day. Weekend orders ship Monday.</p>
            </section>
          </div>

          <div className="info-note">
            <h3>Tracking Your Order</h3>
            <p>Once your order ships, you'll receive a confirmation email with a tracking number. You can also view order status from your <Link to="/orders">order history</Link>.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged in: show live order tracking ──
  return (
    <div className="info-page">
      <div className="container">
        <div className="info-hero">
          <span className="badge">Tracking</span>
          <h1 className="page-title">My Shipments</h1>
          <p className="info-lead">Live status of your active orders.</p>
        </div>

        {loading && <p className="shipping-loading">Loading your orders…</p>}

        {!loading && orders.length === 0 && (
          <div className="shipping-empty">
            <p>🎉 No active shipments right now.</p>
            <p>Delivered orders are automatically removed from this view.</p>
            <Link to="/orders" className="btn-secondary" style={{ marginTop: 16, display: 'inline-block' }}>
              View Order History
            </Link>
          </div>
        )}

        <div className="shipping-orders-list">
          {orders.map(order => (
            <OrderShippingCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}