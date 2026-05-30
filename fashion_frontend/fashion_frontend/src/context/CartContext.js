import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, removeCart, updateCart, clearCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user }              = useAuth();
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); setTotal(0); return; }
    setLoading(true);
    try {
      const r = await getCart();
      if (r.status) { setItems(r.items); setTotal(r.total); }
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const add = async (productId, size, color, quantity = 1) => {
    const r = await addToCart({ product_id: productId, size, color, quantity });
    if (r.status) fetchCart();
    return r;
  };

  const remove = async (cartId) => {
    await removeCart(cartId);
    fetchCart();
  };

  const update = async (cartId, quantity) => {
    await updateCart(cartId, { quantity });
    fetchCart();
  };

  const clear = async () => {
    await clearCart();
    setItems([]); setTotal(0);
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, loading, add, remove, update, clear, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
