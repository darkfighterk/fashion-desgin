// src/Admin/AdminLayout.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminToastProvider } from './AdminToast';
import './admin.css';

import AdminDashboard  from './Dashboard';
import AdminProducts   from './Products';
import AdminCategories from './Categories';
import AdminOrders     from './Orders';

const NAV = [
  { key: 'dashboard',  label: 'Dashboard',  icon: <GridIcon /> },
  { key: 'products',   label: 'Products',   icon: <BoxIcon /> },
  { key: 'categories', label: 'Categories', icon: <TagIcon /> },
  { key: 'orders',     label: 'Orders',     icon: <ShopIcon /> },
];

const PAGES = {
  dashboard:  <AdminDashboard />,
  products:   <AdminProducts />,
  categories: <AdminCategories />,
  orders:     <AdminOrders />,
};

export default function AdminLayout() {
  const [page, setPage] = useState('dashboard');
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  return (
    <AdminToastProvider>
      <div className="admin-panel">

        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="admin-logo-text">Admin Panel</span>
          </div>

          <nav className="admin-nav">
            <div className="admin-nav-section">MENU</div>
            {NAV.map(item => (
              <button
                key={item.key}
                className={`admin-nav-btn${page === item.key ? ' active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <span style={{ opacity: page === item.key ? 1 : 0.5 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-bottom">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="admin-avatar">
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f0eff5' }}>
                  {user?.name || 'Admin'}
                </div>
                <div style={{ fontSize: 11, color: '#7c7b8a', marginTop: 1 }}>Administrator</div>
              </div>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="admin-main">
          {PAGES[page]}
        </main>

      </div>
    </AdminToastProvider>
  );
}

function GridIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function BoxIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function TagIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function ShopIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
function LogoutIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
