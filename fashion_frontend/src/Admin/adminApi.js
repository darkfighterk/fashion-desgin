// src/Admin/adminApi.js
// Reuses the existing axios instance which already handles JWT token injection

import api from '../utils/api';

// ── Products ──────────────────────────────────────────────
export const adminGetProducts = (params = {}) =>
  api.get('/products', { params }).then(r => r.data);

export const adminCreateProduct = (data) =>
  api.post('/products', data).then(r => r.data);

export const adminUpdateProduct = (id, data) =>
  api.put(`/products/${id}`, data).then(r => r.data);

export const adminDeleteProduct = (id) =>
  api.delete(`/products/${id}`).then(r => r.data);

export const adminUploadFile = (productId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post(`/products/${productId}/upload`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

// ── Categories ────────────────────────────────────────────
export const adminGetCategories = () =>
  api.get('/categories').then(r => r.data);

export const adminCreateCategory = (data) =>
  api.post('/categories', data).then(r => r.data);

export const adminUpdateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then(r => r.data);

export const adminDeleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(r => r.data);

// ── Orders ────────────────────────────────────────────────
export const adminGetOrders = () =>
  api.get('/orders').then(r => r.data);

export const adminUpdateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status }).then(r => r.data);
