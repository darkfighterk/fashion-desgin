import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const img = product.images?.[0] || null;
  const price = product.sale_price || product.price;
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-img">
        {img ? (
          <img src={`http://localhost:5000${img}`} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
        {product.sale_price && <span className="product-card-sale">Sale</span>}
        {product.ar_enabled ? <span className="product-card-ar">3D·AR</span> : null}
      </div>
      <div className="product-card-info">
        <p className="product-card-category">{product.category_name}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price">
          <span className="price-current">LKR {Number(price).toLocaleString()}</span>
          {product.sale_price && <span className="price-original">LKR {Number(product.price).toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
}
