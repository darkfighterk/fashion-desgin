import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add }  = useCart();
  const { user } = useAuth();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selSize, setSelSize]   = useState('');
  const [selColor, setSelColor] = useState('');
  const [qty, setQty]           = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [view3d, setView3d]     = useState(false);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    getProduct(id)
      .then(r => { if (r.status) setProduct(r.product); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (product.sizes?.length && !selSize) { setMsg('Please select a size'); return; }
    const r = await add(product.id, selSize, selColor, qty);
    if (r.status) { setMsg('Added to cart!'); setTimeout(() => setMsg(''), 2500); }
    else setMsg(r.message || 'Error');
  };

  if (loading) return <div className="pd-loading container">Loading...</div>;
  if (!product) return <div className="pd-loading container">Product not found.</div>;

  const images  = product.images || [];
  const price   = product.sale_price || product.price;
  const onSale  = product.sale_price && product.sale_price < product.price;

  return (
    <div className="pd-page container fade-up">
      <div className="pd-layout">
        {/* Images */}
        <div className="pd-images">
          <div className="pd-main-img">
            {images.length > 0
              ? <img src={`http://localhost:5000${images[activeImg]}`} alt={product.name}/>
              : <div className="pd-img-placeholder">No image</div>
            }
            {product.ar_enabled && (
              <button className="ar-toggle-btn" onClick={() => setView3d(!view3d)}>
                {view3d ? '← Photo' : '3D View'}
              </button>
            )}
          </div>

          {/* 3D model viewer */}
          {view3d && product.model_3d_url && (
            <div className="model-viewer-wrap">
              {/* eslint-disable-next-line */}
              <model-viewer
                src={`http://localhost:5000${product.model_3d_url}`}
                ar ar-modes="webxr scene-viewer quick-look"
                camera-controls auto-rotate
                style={{width:'100%',height:'400px',borderRadius:'4px'}}
              />
            </div>
          )}

          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}>
                  <img src={`http://localhost:5000${img}`} alt={`view ${i+1}`}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="pd-category">{product.category_name}</p>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-price">
            {onSale && <span className="price-original">${product.price}</span>}
            <span className="price-main">${price}</span>
            {onSale && <span className="badge">Sale</span>}
          </div>

          {product.ar_enabled && (
            <div className="pd-ar-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              3D & AR preview available
            </div>
          )}

          <p className="pd-desc">{product.description}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="pd-options">
              <p className="option-label">Color: <strong>{selColor || 'Select'}</strong></p>
              <div className="color-options">
                {product.colors.map(c => (
                  <button key={c} className={`color-btn ${selColor === c ? 'active' : ''}`}
                    onClick={() => setSelColor(c)} title={c}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="pd-options">
              <p className="option-label">Size: <strong>{selSize || 'Select'}</strong></p>
              <div className="size-options">
                {product.sizes.map(s => (
                  <button key={s} className={`size-btn ${selSize === s ? 'active' : ''}`}
                    onClick={() => setSelSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div className="pd-options">
            <p className="option-label">Quantity</p>
            <div className="qty-control">
              <button onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q+1))}>+</button>
            </div>
            <p className="stock-info">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
          </div>

          {msg && <p className={`pd-msg ${msg.includes('Added') ? 'success' : 'error'}`}>{msg}</p>}

          <div className="pd-actions">
            <button className="btn-primary" style={{flex:1}}
              onClick={handleAddToCart} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
