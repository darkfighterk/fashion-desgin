// src/components/ProtectedRoute.js
// Redirects to /login only for Cart, Checkout, Orders.
// Products, Home, Shop, etc. remain publicly accessible.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // wait for auth check

  if (!user) {
    // Save where they were going so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}