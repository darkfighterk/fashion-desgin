// src/Admin/pages/AdminOrders.js
// Shows orders list + a Report tab with revenue stats
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const STATUS_COLORS = {
  pending:    'yellow',
  processing: 'blue',
  shipped:    'blue',
  completed:  'green',
  cancelled:  'red',
};

const PERIODS = [
  { label: 'Today',   value: 'today' },
  { label: '7 Days',  value: '7d'    },
  { label: '30 Days', value: '30d'   },
  { label: '90 Days', value: '90d'   },
];

export default function AdminOrders() {
  const [tab, setTab]         = useState('orders'); // 'orders' | 'report'
  const [orders, setOrders]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Report
  const [period, setPeriod]     = useState('30d');
  const [report, setReport]     = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  // ── Load orders ──────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);

  // ── Load report ──────────────────────────────────────────────
  const loadReport = useCallback(async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const res = await api.get(`/orders/report?period=${period}`);
      setReport(res.data);
    } catch (e) {
      setReportError('Could not load report. Make sure the /orders/report endpoint is running.');
    } finally {
      setReportLoading(false);
    }
  }, [period]);

  useEffect(() => { if (tab === 'report') loadReport(); }, [tab, loadReport]);

  // ── Update status ────────────────────────────────────────────
  const updateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selected?.id === orderId) setSelected(s => ({ ...s, status }));
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // ── Format helpers ───────────────────────────────────────────
  const fmt  = n => `$${Number(n).toFixed(2)}`;
  const fmtN = n => Number(n).toLocaleString();
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Orders</h1>
          <p style={{ color: 'var(--a-muted)', fontSize: 13, marginTop: 4 }}>
            {fmtN(total)} total orders
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: 24 }}>
        <button
          className={`admin-tab ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >📋 Orders</button>
        <button
          className={`admin-tab ${tab === 'report' ? 'active' : ''}`}
          onClick={() => setTab('report')}
        >📊 Report</button>
      </div>

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <>
          {/* Status filter */}
          <div className="admin-tabs" style={{ marginBottom: 20 }}>
            {['', 'pending', 'processing', 'shipped', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                className={`admin-tab ${statusFilter === s ? 'active' : ''}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          <div className="admin-card">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div className="admin-spinner" />
              </div>
            ) : orders.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">📦</div>
                <p>No orders found</p>
              </div>
            ) : (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 600 }}>#{order.id}</td>
                          <td>{order.shipping_name}</td>
                          <td style={{ color: 'var(--a-muted)' }}>{fmtDate(order.created_at)}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(order.total)}</td>
                          <td>
                            <span className="admin-badge admin-badge-gray" style={{ textTransform: 'capitalize' }}>
                              {order.payment_method?.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-badge admin-badge-${STATUS_COLORS[order.status] || 'gray'}`}
                              style={{ textTransform: 'capitalize' }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select
                              className="admin-status-select"
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              disabled={updating}
                            >
                              {['pending','processing','shipped','completed','cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => setSelected(order)}
                            >View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="admin-pagination">
                  <button className="admin-page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} className={`admin-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                  <button className="admin-page-btn" onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}>›</button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── REPORT TAB ── */}
      {tab === 'report' && (
        <>
          {/* Period selector */}
          <div className="admin-tabs" style={{ marginBottom: 24 }}>
            {PERIODS.map(p => (
              <button
                key={p.value}
                className={`admin-tab ${period === p.value ? 'active' : ''}`}
                onClick={() => setPeriod(p.value)}
              >{p.label}</button>
            ))}
          </div>

          {reportLoading && (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="admin-spinner" />
            </div>
          )}

          {reportError && (
            <div style={{
              background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.2)',
              borderRadius: 8, padding: '16px 20px', color: 'var(--a-red)', fontSize: 13, marginBottom: 24
            }}>
              ⚠ {reportError}
            </div>
          )}

          {report && !reportLoading && (
            <>
              {/* Summary stats */}
              <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Total Orders',   value: fmtN(report.summary.total_orders), icon: '📦', color: '#5b8df5' },
                  { label: 'Total Revenue',  value: fmt(report.summary.total_revenue),  icon: '💰', color: '#52c07a' },
                  { label: 'Avg Order',      value: fmt(report.summary.avg_order_value), icon: '📈', color: '#c9a96e' },
                  { label: 'Completed',      value: fmtN(report.summary.completed),     icon: '✅', color: '#52c07a' },
                ].map(stat => (
                  <div key={stat.label} className="admin-card admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: `${stat.color}1a` }}>
                      <span style={{ fontSize: 20 }}>{stat.icon}</span>
                    </div>
                    <div className="admin-stat-value">{stat.value}</div>
                    <div className="admin-stat-label">{stat.label}</div>
                    <div className="admin-stat-bar" style={{ background: stat.color }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Status breakdown */}
                <div className="admin-card">
                  <h2 className="admin-h2" style={{ marginBottom: 16 }}>Orders by Status</h2>
                  {['pending','processing','shipped','completed','cancelled'].map(s => {
                    const count = Number(report.summary[s] || 0);
                    const pct   = report.summary.total_orders > 0
                      ? Math.round((count / report.summary.total_orders) * 100)
                      : 0;
                    return (
                      <div key={s} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ textTransform: 'capitalize', color: 'var(--a-muted)' }}>{s}</span>
                          <span style={{ color: '#f0eff5' }}>{fmtN(count)} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`, borderRadius: 99,
                            background: STATUS_COLORS[s] === 'green' ? 'var(--a-green)'
                              : STATUS_COLORS[s] === 'red' ? 'var(--a-red)'
                              : STATUS_COLORS[s] === 'blue' ? 'var(--a-blue)'
                              : 'var(--a-accent)',
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment method breakdown */}
                <div className="admin-card">
                  <h2 className="admin-h2" style={{ marginBottom: 16 }}>Payment Methods</h2>
                  {report.by_payment.length === 0 ? (
                    <p style={{ color: 'var(--a-muted)', fontSize: 13 }}>No data for this period.</p>
                  ) : report.by_payment.map(p => (
                    <div key={p.payment_method} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid var(--a-border)', fontSize: 13
                    }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--a-muted)' }}>
                        {p.payment_method?.replace('_', ' ')}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{fmt(p.revenue)}</div>
                        <div style={{ color: 'var(--a-muted)', fontSize: 11 }}>{fmtN(p.count)} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily revenue mini-chart (CSS bars) */}
              <div className="admin-card" style={{ marginBottom: 24 }}>
                <h2 className="admin-h2" style={{ marginBottom: 20 }}>Daily Revenue (30 Days)</h2>
                {report.daily.length === 0 ? (
                  <p style={{ color: 'var(--a-muted)', fontSize: 13 }}>No revenue data yet.</p>
                ) : (() => {
                  const maxRev = Math.max(...report.daily.map(d => d.revenue), 1);
                  return (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120 }}>
                      {report.daily.map(d => (
                        <div key={d.date} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div
                            title={`${d.date}: ${fmt(d.revenue)}`}
                            style={{
                              width: '100%', minHeight: 4,
                              height: `${Math.max(4, (d.revenue / maxRev) * 100)}px`,
                              background: 'var(--a-accent)',
                              borderRadius: '3px 3px 0 0',
                              opacity: 0.8,
                              transition: 'height 0.4s ease',
                              cursor: 'default',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Top products */}
              <div className="admin-card">
                <h2 className="admin-h2" style={{ marginBottom: 16 }}>Top Products</h2>
                {report.top_products.length === 0 ? (
                  <p style={{ color: 'var(--a-muted)', fontSize: 13 }}>No product data for this period.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Units Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.top_products.map((p, i) => (
                          <tr key={p.product_name}>
                            <td style={{ color: 'var(--a-muted)' }}>{i + 1}</td>
                            <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                            <td>{fmtN(p.total_qty)}</td>
                            <td style={{ fontWeight: 600, color: 'var(--a-accent)' }}>{fmt(p.total_revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Order detail modal ── */}
      {selected && (
        <div className="admin-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Order #{selected.id}</h3>
            <div className="admin-info-grid" style={{ marginBottom: 20 }}>
              {[
                ['Customer',   selected.shipping_name],
                ['Date',       fmtDate(selected.created_at)],
                ['Payment',    selected.payment_method?.replace('_', ' ')],
                ['Pay Status', selected.payment_status],
                ['Address',    selected.shipping_address],
                ['City',       `${selected.shipping_city} ${selected.shipping_zip}`],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="admin-info-label">{label}</div>
                  <div className="admin-info-value" style={{ textTransform: 'capitalize' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Items */}
            <h4 style={{ fontSize: 13, color: 'var(--a-muted)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Items</h4>
            <div style={{ marginBottom: 20 }}>
              {(Array.isArray(selected.items) ? selected.items : []).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: '1px solid var(--a-border)', fontSize: 13
                }}>
                  <span>{item.name} <span style={{ color: 'var(--a-muted)' }}>× {item.quantity}</span></span>
                  <span style={{ fontWeight: 600 }}>{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700 }}>
                <span>Total</span><span style={{ color: 'var(--a-accent)' }}>{fmt(selected.total)}</span>
              </div>
            </div>

            {/* Status update */}
            <div style={{ marginBottom: 20 }}>
              <label className="admin-label">Update Status</label>
              <select
                className="admin-input"
                value={selected.status}
                onChange={e => updateStatus(selected.id, e.target.value)}
                disabled={updating}
              >
                {['pending','processing','shipped','completed','cancelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="admin-flex-end">
              <button className="admin-btn admin-btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
