// src/context/AppContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]         = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast]       = useState(null);

  const showToast = (message, type = 'default') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0);
  };

  const fetchCartCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/cart');
      setCartCount(res.data.items?.length || 0);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchCartCount(); }, [fetchCartCount]);

  return (
    <AppContext.Provider value={{ user, login, logout, cartCount, fetchCartCount, showToast }}>
      {children}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
