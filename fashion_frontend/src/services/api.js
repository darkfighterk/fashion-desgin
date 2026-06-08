import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (d) => api.post('/register', d).then(r => r.data);
export const login    = (d) => api.post('/login', d).then(r => r.data);
export const profile  = ()  => api.get('/profile').then(r => r.data);

// Products
export const getProducts = (params = {}) => api.get('/products', { params }).then(r => r.data);
export const getProduct  = (id) => api.get(`/products/${id}`).then(r => r.data);

// Categories
export const getCategories = () => api.get('/categories').then(r => r.data);

// Cart
export const getCart    = ()      => api.get('/cart').then(r => r.data);
export const addToCart  = (d)     => api.post('/cart', d).then(r => r.data);
export const updateCart = (id, d) => api.put(`/cart/${id}`, d).then(r => r.data);
export const removeCart = (id)    => api.delete(`/cart/${id}`).then(r => r.data);
export const clearCart  = ()      => api.delete('/cart/clear').then(r => r.data);

// Orders
export const placeOrder  = (d)  => api.post('/orders', d).then(r => r.data);
export const myOrders    = ()   => api.get('/orders/my').then(r => r.data);
export const orderDetail = (id) => api.get(`/orders/${id}`).then(r => r.data);

export default api;