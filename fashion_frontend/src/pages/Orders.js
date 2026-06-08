import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { myOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const STATUS_COLORS = {
  pending:   '#ba7517', confirmed: '#185fa5',
  shipped:   '#2c6ecb', delivered: '#3b6d11', cancelled: '#a32d2d'
};

export default function Orders() {
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    myOrders().then(r => { if (r.status) setOrders(r.orders); }).finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="orders-page container">Loading...</div>;

  return (
    <div className="orders-page container fade-up">
      <h1 className="page-title" style={{marginBottom:36}}>My Orders</h1>
      {orders.length === 0
        ? <div className="orders-empty">
            <p>No orders yet.</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        : <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <p className="order-id">Order #{order.id}</p>
                    <p className="order-date">{new Date(order.created_at).toLocaleDateString('en-US',{dateStyle:'medium'})}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span className="order-status" style={{color: STATUS_COLORS[order.status] || '#888'}}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                    <p className="order-total">${order.total_amount}</p>
                  </div>
                </div>
                <div className="order-items">
                  {order.items?.slice(0,3).map(item => (
                    <div key={item.id} className="order-item">
                      <p className="oi-name">{item.name}</p>
                      <p className="oi-meta">
                        {item.size && `${item.size} `}{item.color && `· ${item.color} `}× {item.quantity}
                      </p>
                      <p className="oi-price">${(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p style={{fontSize:12,color:'var(--gray)'}}>+{order.items.length - 3} more items</p>
                  )}
                </div>
                <div className="order-footer">
                  <span className="order-payment">Payment: {order.payment_method?.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
