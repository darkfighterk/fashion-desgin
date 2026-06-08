import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home          from './pages/Home';
import Shop          from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Orders        from './pages/Orders';

// Info pages (Fix 3)
import Shipping from './pages/Shipping';
import Returns  from './pages/Returns';
import Contact  from './pages/Contact';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout    from './Admin/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* ── ADMIN (role-protected) ── */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            />

            {/* ── USER LAYOUT ── */}
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                    <Routes>

                      {/* Public — no login needed */}
                      <Route path="/"           element={<Home />} />
                      <Route path="/login"      element={<Login />} />
                      <Route path="/register"   element={<Register />} />
                      <Route path="/shop"       element={<Shop />} />
                      <Route path="/shop/:id"   element={<ProductDetail />} />
                      <Route path="/product/:id" element={<ProductDetail />} />

                      {/* Info pages */}
                      <Route path="/shipping"   element={<Shipping />} />
                      <Route path="/returns"    element={<Returns />} />
                      <Route path="/contact"    element={<Contact />} />

                      {/* Protected — login required */}
                      <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route path="/orders/:id" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}