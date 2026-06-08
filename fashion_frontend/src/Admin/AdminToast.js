// src/Admin/AdminToast.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext();
let _id = 0;

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'info') => {
    const id = ++_id;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={styles.wrap}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
            <span style={{ fontWeight: 700 }}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useAdminToast = () => useContext(ToastCtx);

const styles = {
  wrap: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  toast: {
    padding: '11px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 10,
    minWidth: 240, maxWidth: 340,
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    animation: 'adminToastIn 0.25s ease',
  },
  success: { background: '#1a2e24', color: '#52c07a', border: '1px solid rgba(82,192,122,0.25)' },
  error:   { background: '#2e1a1a', color: '#e05252', border: '1px solid rgba(224,82,82,0.25)' },
  info:    { background: '#1a1e2e', color: '#5b8df5', border: '1px solid rgba(91,141,245,0.25)' },
};
