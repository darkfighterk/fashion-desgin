import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './Admin/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* ===== ADMIN — no Navbar/Footer ===== */}
            <Route path="/admin/*" element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            } />

            {/* ===== USER — with Navbar/Footer ===== */}
            <Route path="*" element={
              <>
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                  <Routes>
                    <Route path="/"         element={<Home />} />
                    <Route path="/shop"     element={<Shop />} />
                    <Route path="/shop/:id" element={<ProductDetail />} />
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}