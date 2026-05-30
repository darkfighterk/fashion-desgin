// src/Admin/Dashboard.js
import React, { useEffect, useState } from 'react';
import { adminGetOrders, adminGetProducts } from './adminApi';

const STATUS_COLOR = {
  pending: 'yellow', confirmed: 'blue', shipped: 'blue',
  delivered: 'green', cancelled: 'red',
};

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [oRes, pRes] = await Promise.all([
          adminGetOrders(),
          adminGetProducts({ limit: 999 }),
        ]);
        const orders   = oRes.orders   || [];
        const products = pRes.products || [];
        const revenue  = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
        setStats({
          revenue,
          orders:   orders.length,
          products: products.length,
          pending:  orders.filter(o => o.status === 'pending').length,
        });
        setRecent(orders.slice(0, 8));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Total Revenue',  value: `$${stats.revenue.toLocaleString('en', { minimumFractionDigits: 2 })}`, color: '#c9a96e', icon: <RevenueIcon /> },
    { label: 'Total Orders',   value: stats.orders,   color: '#5b8df5', icon: <OrderIcon /> },
    { label: 'Products',       value: stats.products, color: '#52c07a', icon: <BoxIcon /> },
    { label: 'Pending Orders', value: stats.pending,  color: '#e05252', icon: <ClockIcon /> },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Dashboard</h1>
          <p style={{ color: '#7c7b8a', fontSize: 13 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="admin-card admin-stat-card">
            <div className="admin-stat-icon" style={{ background: c.color + '18', color: c.color }}>
              {c.icon}
            </div>
            <div className="admin-stat-value">{c.value}</div>
            <div className="admin-stat-label">{c.label}</div>
            <div className="admin-stat-bar" style={{ background: c.color }} />
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ marginTop: 24, padding: 0 }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="admin-h2">Recent Orders</h2>
          <span style={{ fontSize: 12, color: '#7c7b8a' }}>{recent.length} latest</span>
        </div>
        <div className="admin-table-wrap" style={{ marginTop: 16 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Amount</th>
                <th>Payment</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: '#c9a96e' }}>#{o.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.user_name || '—'}</div>
                    {o.email && <div style={{ fontSize: 11, color: '#7c7b8a' }}>{o.email}</div>}
                  </td>
                  <td style={{ fontWeight: 600 }}>${Number(o.total_amount).toFixed(2)}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: 11, color: '#7c7b8a' }}>{o.payment_method}</td>
                  <td><span className={`admin-badge admin-badge-${STATUS_COLOR[o.status] || 'gray'}`}>{o.status}</span></td>
                  <td style={{ color: '#7c7b8a', fontSize: 12 }}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#7c7b8a', padding: '40px 0' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <span className="admin-spinner" />
    </div>
  );
}

function RevenueIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function OrderIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
function BoxIcon()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>; }
function ClockIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
