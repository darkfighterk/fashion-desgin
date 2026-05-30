// src/Admin/Orders.js
import React, { useEffect, useState, useCallback } from 'react';
import { adminGetOrders, adminUpdateOrderStatus } from './adminApi';
import { useAdminToast } from './AdminToast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR   = { pending: 'yellow', confirmed: 'blue', shipped: 'blue', delivered: 'green', cancelled: 'red' };

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [detail,   setDetail]   = useState(null);
  const [updating, setUpdating] = useState(null);
  const toast = useAdminToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await adminGetOrders(); setOrders(r.orders || []); }
    catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  async function changeStatus(id, status) {
    setUpdating(id);
    try {
      await adminUpdateOrderStatus(id, status);
      toast(`Order #${id} → ${status}`, 'success');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (detail?.id === id) setDetail(d => ({ ...d, status }));
    } catch (e) { toast(e.message, 'error'); }
    finally { setUpdating(null); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Orders</h1>
          <p style={{ color: '#7c7b8a', fontSize: 13 }}>{orders.length} total orders</p>
        </div>
      </div>

      <div className="admin-tabs">
        {['all', ...STATUS_OPTIONS].map(f => (
          <button key={f} className={`admin-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="admin-tab-count">{orders.filter(o => o.status === f).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0, marginTop: 16 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Total</th>
                <th>Payment</th><th>City</th><th>Status</th>
                <th>Date</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0' }}><span className="admin-spinner" /></td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="admin-empty"><div className="admin-empty-icon">🛒</div><p>No orders found</p></div>
                </td></tr>
              ) : displayed.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: '#c9a96e' }}>#{o.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.user_name || '—'}</div>
                    {o.email && <div style={{ fontSize: 11, color: '#7c7b8a', marginTop: 2 }}>{o.email}</div>}
                  </td>
                  <td style={{ fontWeight: 600 }}>${Number(o.total_amount).toFixed(2)}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: 11, color: '#7c7b8a' }}>{o.payment_method}</td>
                  <td style={{ color: '#7c7b8a' }}>{o.shipping_city || '—'}</td>
                  <td><span className={`admin-badge admin-badge-${STATUS_COLOR[o.status] || 'gray'}`}>{o.status}</span></td>
                  <td style={{ color: '#7c7b8a', fontSize: 12 }}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDetail(o)}>View</button>
                      <select
                        className="admin-status-select"
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={e => changeStatus(o.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {detail && (
        <div className="admin-overlay" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="admin-modal" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Order #{detail.id}</h3>
              <span className={`admin-badge admin-badge-${STATUS_COLOR[detail.status] || 'gray'}`}>{detail.status}</span>
            </div>

            <div style={{ background: '#18181f', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="admin-info-grid">
                {[
                  ['Customer', detail.user_name || '—'],
                  ['Email',    detail.email || '—'],
                  ['Ship To',  detail.shipping_name || '—'],
                  ['City',     `${detail.shipping_city || '—'} ${detail.shipping_zip || ''}`],
                  ['Address',  detail.shipping_address || '—'],
                  ['Payment',  (detail.payment_method || '').toUpperCase()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="admin-info-label">{label}</div>
                    <div className="admin-info-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(201,169,110,0.08)', borderRadius: 10, border: '1px solid rgba(201,169,110,0.15)', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#7c7b8a' }}>Total Amount</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c9a96e' }}>
                ${Number(detail.total_amount).toFixed(2)}
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Update Status</label>
              <select
                className="admin-input"
                value={detail.status}
                disabled={updating === detail.id}
                onChange={e => changeStatus(detail.id, e.target.value)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <button className="admin-btn admin-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setDetail(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
