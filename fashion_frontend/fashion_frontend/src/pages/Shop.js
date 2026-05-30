import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import './Shop.css';

export default function Shop() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const page     = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    getCategories().then(r => { if (r.status) setCategories(r.categories); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (category) params.category = category;
    if (search)   params.search   = search;
    getProducts(params)
      .then(r => { if (r.status) { setProducts(r.products); setTotal(r.total); } })
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const setFilter = (key, val) => {
    const p = Object.fromEntries(searchParams);
    if (val) p[key] = val; else delete p[key];
    delete p.page;
    setSearchParams(p);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="shop-page container" style={{paddingTop:40,paddingBottom:80}}>
      <h1 className="page-title" style={{marginBottom:32}}>
        {category ? categories.find(c => c.slug === category)?.name || 'Shop' : 'All Products'}
      </h1>

      <div className="shop-layout">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <div className="filter-group">
            <h4>Categories</h4>
            <button className={`filter-btn ${!category ? 'active' : ''}`} onClick={() => setFilter('category','')}>All</button>
            {categories.map(c => (
              <button key={c.id} className={`filter-btn ${category === c.slug ? 'active' : ''}`}
                onClick={() => setFilter('category', c.slug)}>
                {c.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className="shop-main">
          {/* Search bar */}
          <div className="shop-toolbar">
            <input
              className="search-input" placeholder="Search products..."
              defaultValue={search}
              onKeyDown={e => { if (e.key === 'Enter') setFilter('search', e.target.value); }}
            />
            <span className="results-count">{total} product{total !== 1 ? 's' : ''}</span>
          </div>

          {loading
            ? <div className="loading-grid">
                {Array(8).fill(0).map((_,i) => <div key={i} className="skeleton-card"/>)}
              </div>
            : products.length === 0
              ? <div className="empty-state">
                  <p>No products found.</p>
                  <button className="btn-outline" onClick={() => setSearchParams({})}>Clear filters</button>
                </div>
              : <div className="products-grid">
                  {products.map(p => <ProductCard key={p.id} product={p}/>)}
                </div>
          }

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({length: totalPages}, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${page === n ? 'active' : ''}`}
                  onClick={() => setFilter('page', n)}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
