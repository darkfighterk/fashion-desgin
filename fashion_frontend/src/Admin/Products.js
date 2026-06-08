// src/Admin/Products.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  adminGetProducts, adminGetCategories, adminCreateProduct,
  adminUpdateProduct, adminDeleteProduct, adminUploadFile,
} from './adminApi';
import { useAdminToast } from './AdminToast';

const EMPTY = {
  name: '', description: '', price: '', sale_price: '',
  stock: '', category_id: '', sizes: [], colors: [], ar_enabled: false,
  image_url: '', model_3d_url: '',
};
const SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Gray', 'Navy', 'Beige'];
const PER    = 12;

// Helper: resolve image src — supports full https:// URLs and local /uploads/ paths
function imgSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `http://localhost:5000${path}`;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [cats,     setCats]     = useState([]);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // null | 'create' | product obj
  const [delId,    setDelId]    = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [file,     setFile]     = useState(null);
  const toast = useAdminToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminGetProducts({ page, limit: PER, search: search || undefined });
      setProducts(r.products || []);
      setTotal(r.total || 0);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { adminGetCategories().then(r => setCats(r.categories || [])); }, []);

  function openCreate() { setForm(EMPTY); setFile(null); setModal('create'); }

  function openEdit(p) {
    setForm({
      name:         p.name,
      description:  p.description || '',
      price:        p.price,
      sale_price:   p.sale_price || '',
      stock:        p.stock,
      category_id:  p.category_id || '',
      sizes:        p.sizes || [],
      colors:       p.colors || [],
      ar_enabled:   !!p.ar_enabled,
      image_url:    p.images?.[0] || '',
      model_3d_url: p.model_3d_url || '',
    });
    setFile(null);
    setModal(p);
  }

  async function save() {
    if (!form.name || !form.price) return toast('Name and price are required', 'error');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:        Number(form.price),
        sale_price:   form.sale_price ? Number(form.sale_price) : null,
        stock:        Number(form.stock),
        category_id:  form.category_id ? Number(form.category_id) : null,
        model_3d_url: form.model_3d_url || null,
        // Only include images from URL field if no file is being uploaded
        ...(form.image_url && !file ? { images: [form.image_url] } : {}),
      };

      if (modal === 'create') {
        const r = await adminCreateProduct(payload);
        if (file && r.product_id) await adminUploadFile(r.product_id, file);
        toast('Product created', 'success');
      } else {
        await adminUpdateProduct(modal.id, payload);
        if (file) await adminUploadFile(modal.id, file);
        toast('Product updated', 'success');
      }
      setModal(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function remove(id) {
    try {
      await adminDeleteProduct(id);
      toast('Product removed', 'success');
      setDelId(null); load();
    } catch (e) { toast(e.message, 'error'); }
  }

  const toggle = (field, val) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter(x => x !== val)
        : [...f[field], val],
    }));

  const pages = Math.ceil(total / PER);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Products</h1>
          <p style={{ color: '#7c7b8a', fontSize: 13 }}>{total} items total</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <PlusIcon /> Add Product
        </button>
      </div>

      <div style={{ marginBottom: 20, maxWidth: 340 }}>
        <input
          className="admin-input" placeholder="Search products…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th><th>Name</th><th>Category</th>
                <th>Price</th><th>Stock</th><th>AR</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <span className="admin-spinner" />
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="admin-empty"><div className="admin-empty-icon">📦</div><p>No products found</p></div>
                </td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-thumb">
                      {p.images?.[0]
                        ? <img
                            src={imgSrc(p.images[0])}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        : <ImgIcon />}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#7c7b8a', marginTop: 2 }}>/{p.slug}</div>
                  </td>
                  <td>
                    {p.category_name
                      ? <span className="admin-badge admin-badge-gray">{p.category_name}</span>
                      : <span style={{ color: '#7c7b8a' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>${Number(p.price).toFixed(2)}</div>
                    {p.sale_price && <div style={{ fontSize: 11, color: '#52c07a', marginTop: 2 }}>Sale: ${Number(p.sale_price).toFixed(2)}</div>}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge-${p.stock > 10 ? 'green' : p.stock > 0 ? 'yellow' : 'red'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    {p.ar_enabled
                      ? <span className="admin-badge admin-badge-blue">AR</span>
                      : <span style={{ color: '#7c7b8a', fontSize: 11 }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDelId(p.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="admin-pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`admin-page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modal !== null && (
        <div className="admin-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 580 }}>
            <h3>{modal === 'create' ? 'Add New Product' : 'Edit Product'}</h3>

            <div className="admin-grid2">
              <div>
                <label className="admin-label">Product Name *</label>
                <input
                  className="admin-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Silk Slip Dress"
                />
              </div>
              <div>
                <label className="admin-label">Category</label>
                <select
                  className="admin-input"
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">No Category</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Price *</label>
                <input
                  className="admin-input"
                  type="number" step="0.01"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="admin-label">Sale Price</label>
                <input
                  className="admin-input"
                  type="number" step="0.01"
                  value={form.sale_price}
                  onChange={e => setForm({ ...form, sale_price: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="admin-label">Stock</label>
                <input
                  className="admin-input"
                  type="number"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 18 }}>
                <input
                  type="checkbox" id="ar_en"
                  checked={form.ar_enabled}
                  onChange={e => setForm({ ...form, ar_enabled: e.target.checked })}
                  style={{ accentColor: '#c9a96e', width: 15, height: 15 }}
                />
                <label htmlFor="ar_en" style={{ fontSize: 13, color: '#f0eff5', cursor: 'pointer' }}>AR Enabled</label>
              </div>
            </div>

            <div className="admin-form-row" style={{ marginTop: 14 }}>
              <label className="admin-label">Description</label>
              <textarea
                className="admin-input" rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Product description…"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="admin-form-row">
              <label className="admin-label">Sizes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SIZES.map(s => (
                  <button key={s} type="button"
                    className={`admin-pill${form.sizes.includes(s) ? ' selected' : ''}`}
                    onClick={() => toggle('sizes', s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="admin-form-row">
              <label className="admin-label">Colors</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {COLORS.map(c => (
                  <button key={c} type="button"
                    className={`admin-pill${form.colors.includes(c) ? ' selected' : ''}`}
                    onClick={() => toggle('colors', c)}>{c}</button>
                ))}
              </div>
            </div>

            {/* ── Image URL ── */}
            <div className="admin-form-row">
              <label className="admin-label">Image URL</label>
              <input
                className="admin-input"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg  or  /uploads/products/img.jpg"
              />
              {/* Preview */}
              {form.image_url && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={imgSrc(form.image_url)}
                    alt="preview"
                    style={{ height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            {/* ── 3D Model URL ── */}
            <div className="admin-form-row">
              <label className="admin-label">3D Model URL (.glb)</label>
              <input
                className="admin-input"
                value={form.model_3d_url}
                onChange={e => setForm({ ...form, model_3d_url: e.target.value })}
                placeholder="https://raw.githubusercontent.com/.../model.glb  or  /uploads/models/model.glb"
              />
              {form.model_3d_url && (
                <p style={{ fontSize: 11, color: '#c9a96e', marginTop: 4 }}>
                  🧊 GLB URL set — make sure AR Enabled is checked above
                </p>
              )}
            </div>

            {/* ── File Upload ── */}
            <div className="admin-form-row">
              <label className="admin-label">Upload Image / 3D Model (.jpg .png .glb)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.glb,.gltf"
                className="admin-file-input"
                onChange={e => setFile(e.target.files[0] || null)}
              />
              {file && (
                <p style={{ fontSize: 11, color: '#52c07a', marginTop: 6 }}>
                  Selected: {file.name} {form.image_url ? '(file upload will override the Image URL above)' : ''}
                </p>
              )}
            </div>

            <div className="admin-flex-end">
              <button className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                {saving && <span className="admin-spinner" style={{ width: 14, height: 14 }} />}
                {saving ? 'Saving…' : modal === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {delId && (
        <div className="admin-overlay" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="admin-modal" style={{ maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ marginBottom: 8 }}>Remove Product?</h3>
            <p style={{ color: '#7c7b8a', fontSize: 13, marginBottom: 24 }}>
              This hides the product from your store. Reversible.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setDelId(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => remove(delId)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function ImgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}