import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser }       = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const r = await login(form);
    setLoading(false);

    // ✅ LOGIN SUCCESS
    if (r.status) {
  localStorage.setItem('user', JSON.stringify(r.user)); // ← add this line
  loginUser(r.token, r.user);

      // 🔥 NEW: role-based redirect
      const role = r.user.role;

      if (role === 'admin') {
        navigate('/admin'); // admin goes to admin panel
      } else {
        navigate('/'); // normal user goes home
      }
    } 
    else {
      setError(r.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <h1 className="auth-logo">LUXE</h1>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to continue shopping</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={form.email}
              onChange={e =>
                setForm(f => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={e =>
                setForm(f => ({ ...f, password: e.target.value }))
              }
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}