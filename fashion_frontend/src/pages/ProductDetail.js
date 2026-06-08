import React, { useEffect, useState, useRef } from 'react';
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

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selSize, setSelSize]     = useState('');
  const [selColor, setSelColor]   = useState('');
  const [qty, setQty]             = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [view3d, setView3d]       = useState(false);
  const [msg, setMsg]             = useState('');
  const [arMsg, setArMsg]         = useState('');   // feedback if AR not supported
  const modelRef = useRef(null);                    // ref to <model-viewer> element

  // Trigger the model-viewer's native AR session
  const handleArView = () => {
    const mv = modelRef.current;
    if (!mv) {
      // 3D view not open yet — open it first, then AR
      setView3d(true);
      // Give the element time to mount, then activate AR
      setTimeout(() => {
        const el = document.querySelector('model-viewer');
        if (el && el.canActivateAR) {
          el.activateAR();
        } else {
          setArMsg('AR is not supported on this device/browser. Try on an Android or iOS device.');
          setTimeout(() => setArMsg(''), 4000);
        }
      }, 500);
      return;
    }
    if (mv.canActivateAR) {
      mv.activateAR();
    } else {
      setArMsg('AR is not supported on this device/browser. Try on an Android or iOS device.');
      setTimeout(() => setArMsg(''), 4000);
    }
  };

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
      {/* ── BACK BUTTON ── */}
      <button className="pd-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="pd-layout">
        {/* Images */}
        <div className="pd-images">

          {/* ── MAIN VIEWER: photo OR 3-D, same box ── */}
          <div className="pd-main-img">
            {view3d && product.model_3d_url ? (
              /* 3-D model renders right here, no new window */
              // eslint-disable-next-line
              <model-viewer
                ref={modelRef}
                src={product.model_3d_url.startsWith('http') ? product.model_3d_url : `http://localhost:5000${product.model_3d_url}`}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                style={{ width: '100%', height: '100%', borderRadius: '4px' }}
              />
            ) : (
              images.length > 0
                ? <img src={images[activeImg].startsWith('http') ? images[activeImg] : `http://localhost:5000${images[activeImg]}`} alt={product.name} />
                
                : <div className="pd-img-placeholder">No image</div>
            )}

          </div>
          {/* ── END MAIN VIEWER ── */}

          {/* Thumbnails — hidden while 3-D is active so they don't confuse */}
          {!view3d && images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={`http://localhost:5000${img}`} alt={`view ${i + 1}`} />
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

          {msg   && <p className={`pd-msg ${msg.includes('Added') ? 'success' : 'error'}`}>{msg}</p>}
          {arMsg && <p className="pd-msg error">{arMsg}</p>}

          <div className="pd-actions">
            {/* 3D View toggle */}
            {product.ar_enabled && product.model_3d_url && (
              <button
                className="btn-secondary"
                onClick={() => setView3d(v => !v)}
              >
                {view3d ? '← Photo' : '3D View'}
              </button>
            )}

            {/* AR View — opens phone camera in real world */}
            {product.ar_enabled && product.model_3d_url && (
              <button
                className="btn-secondary"
                onClick={handleArView}
              >
                 AR View
              </button>
            )}

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