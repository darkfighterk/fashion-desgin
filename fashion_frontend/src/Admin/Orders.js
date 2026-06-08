// src/Admin/Orders.js
import React, { useEffect, useState, useCallback } from 'react';
import { adminGetOrders, adminUpdateOrderStatus } from './adminApi';
import { useAdminToast } from './AdminToast';

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR   = { pending: 'yellow', confirmed: 'blue', shipped: 'blue', delivered: 'green', cancelled: 'red' };

/** Returns only statuses the admin is allowed to set from current status.
 *  Rule: can only move forward in STATUS_FLOW, plus always allow 'cancelled'. */
function getAllowedStatuses(current) {
  if (current === 'cancelled') return ['cancelled']; // already terminal
  const idx = STATUS_FLOW.indexOf(current);
  // next steps forward only (not current, not previous)
  const forward = STATUS_FLOW.slice(idx + 1);
  return [...forward, 'cancelled'];
}

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

  async function changeStatus(id, status, currentStatus) {
    const allowed = getAllowedStatuses(currentStatus);
    if (!allowed.includes(status)) {
      toast('Cannot go back to a previous status.', 'error');
      return;
    }
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
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <span className="admin-spinner" />
                </td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="admin-empty"><div className="admin-empty-icon">🛒</div><p>No orders found</p></div>
                </td></tr>
              ) : displayed.map(o => {
                const allowed = getAllowedStatuses(o.status);
                const isTerminal = o.status === 'cancelled' || o.status === 'delivered';
                return (
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

                        {/* Only show dropdown if order is not terminal */}
                        {!isTerminal ? (
                          <select
                            className="admin-status-select"
                            value=""
                            disabled={updating === o.id}
                            onChange={e => e.target.value && changeStatus(o.id, e.target.value, o.status)}
                          >
                            <option value="">Move to…</option>
                            {allowed.map(s => (
                              <option key={s} value={s}>
                                {s === 'cancelled' ? '✕ Cancel' : `→ ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: 11, color: '#7c7b8a', padding: '4px 8px' }}>
                            {o.status === 'delivered' ? '✓ Done' : '✕ Cancelled'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {detail && (() => {
        const allowed = getAllowedStatuses(detail.status);
        const isTerminal = detail.status === 'cancelled' || detail.status === 'delivered';
        return (
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

              {/* Status flow indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                {STATUS_FLOW.map((s, i) => {
                  const currentIdx = STATUS_FLOW.indexOf(detail.status);
                  const isDone    = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <React.Fragment key={s}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                        background: isDone ? (isCurrent ? '#c9a96e' : 'rgba(201,169,110,0.25)') : 'rgba(255,255,255,0.06)',
                        color: isDone ? (isCurrent ? '#18181f' : '#c9a96e') : '#7c7b8a',
                        border: isCurrent ? '1px solid #c9a96e' : '1px solid transparent',
                      }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                      {i < STATUS_FLOW.length - 1 && (
                        <span style={{ color: '#7c7b8a', fontSize: 10 }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}
                {detail.status === 'cancelled' && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                    Cancelled
                  </span>
                )}
              </div>

              {/* Update status — forward only */}
              {!isTerminal ? (
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Move to next status</label>
                  <select
                    className="admin-input"
                    value=""
                    disabled={updating === detail.id}
                    onChange={e => e.target.value && changeStatus(detail.id, e.target.value, detail.status)}
                  >
                    <option value="">Select next step…</option>
                    {allowed.map(s => (
                      <option key={s} value={s}>
                        {s === 'cancelled' ? '✕ Cancel this order' : `→ Mark as ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 13, color: '#7c7b8a' }}>
                  {detail.status === 'delivered' ? '✓ Order completed — no further actions.' : '✕ Order cancelled — no further actions.'}
                </div>
              )}

              <button className="admin-btn admin-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}