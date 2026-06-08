import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured]     = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts({ limit: 8 }).then(r => { if (r.status) setFeatured(r.products); });
    getCategories().then(r => { if (r.status) setCategories(r.categories); });
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content container">
          <p className="hero-sub fade-up">New Collection 2025</p>
          <h1 className="hero-title fade-up" style={{animationDelay:'0.1s'}}>
            Fashion<br /><em>Redefined</em>
          </h1>
          <p className="hero-desc fade-up" style={{animationDelay:'0.2s'}}>
            Explore timeless pieces with immersive 3D & AR previews.
          </p>
          <div className="hero-actions fade-up" style={{animationDelay:'0.3s'}}>
            <button className="btn-primary" onClick={() => navigate('/shop')}>Shop Now</button>
            <Link to="/shop" className="btn-outline">View Lookbook</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="cat-card">
              <div className="cat-img">
                {cat.image_url
                  ? <img src={`http://localhost:5000${cat.image_url}`} alt={cat.name}/>
                  : <div className="cat-placeholder"/>}
              </div>
              <span className="cat-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/shop" className="view-all">View All →</Link>
        </div>
        <div className="products-grid">
          {featured.map(p => <ProductCard key={p.id} product={p}/>)}
        </div>
      </section>

      {/* 3D/AR Banner */}
      <section className="ar-banner container">
        <div className="ar-banner-inner">
          <div>
            <span className="badge">New Feature</span>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,40px)',fontWeight:300,marginTop:12,lineHeight:1.2}}>
              Try Before You Buy
            </h2>
            <p style={{color:'var(--gray)',marginTop:10,maxWidth:380,lineHeight:1.7}}>
              View any garment in full 3D, rotate it 360°, and place it in your room with Augmented Reality.
            </p>
            <Link to="/shop" className="btn-primary" style={{display:'inline-block',marginTop:24}}>
              Explore 3D Products
            </Link>
          </div>
          <div className="ar-icons">
            <div className="ar-icon-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              <p>3D View</p>
            </div>
            <div className="ar-icon-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
              </svg>
              <p>AR Try-On</p>
            </div>
            <div className="ar-icon-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              <p>360° Rotate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
