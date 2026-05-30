// src/Admin/Categories.js
import React, { useEffect, useState } from 'react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from './adminApi';
import { useAdminToast } from './AdminToast';

const EMPTY = { name: '', description: '' };

export default function AdminCategories() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [delId,   setDelId]   = useState(null);
  const toast = useAdminToast();

  const load = async () => {
    setLoading(true);
    try { const r = await adminGetCategories(); setCats(r.categories || []); }
    catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  function openCreate() { setForm(EMPTY); setModal('create'); }
  function openEdit(c)  { setForm({ name: c.name, description: c.description || '' }); setModal(c); }

  async function save() {
    if (!form.name.trim()) return toast('Name is required', 'error');
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminCreateCategory(form);
        toast('Category created', 'success');
      } else {
        await adminUpdateCategory(modal.id, form);
        toast('Category updated', 'success');
      }
      setModal(null); load();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function remove(id) {
    try {
      await adminDeleteCategory(id);
      toast('Category deleted', 'success');
      setDelId(null); load();
    } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Categories</h1>
          <p style={{ color: '#7c7b8a', fontSize: 13 }}>{cats.length} categories</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <PlusIcon /> Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <span className="admin-spinner" />
        </div>
      ) : cats.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty"><div className="admin-empty-icon">🏷️</div><p>No categories yet</p></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cats.map(c => (
            <div key={c.id} className="admin-card admin-cat-card">
              <div className="admin-cat-thumb">
                {c.image_url
                  ? <img src={`http://localhost:5000${c.image_url}`} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <TagIcon />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#7c7b8a', marginTop: 3 }}>/{c.slug}</div>
                {c.description && (
                  <div style={{ fontSize: 12, color: '#7c7b8a', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.description}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDelId(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <div className="admin-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }}>
            <h3>{modal === 'create' ? 'New Category' : 'Edit Category'}</h3>
            <div className="admin-form-row">
              <label className="admin-label">Category Name *</label>
              <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dresses" autoFocus />
            </div>
            <div className="admin-form-row" style={{ marginBottom: 22 }}>
              <label className="admin-label">Description</label>
              <textarea className="admin-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description…" style={{ resize: 'vertical' }} />
            </div>
            <div className="admin-flex-end">
              <button className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                {saving && <span className="admin-spinner" style={{ width: 14, height: 14 }} />}
                {modal === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="admin-overlay" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="admin-modal" style={{ maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ marginBottom: 8 }}>Delete Category?</h3>
            <p style={{ color: '#7c7b8a', fontSize: 13, marginBottom: 24 }}>Products in this category will lose their category assignment.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setDelId(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => remove(delId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function TagIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
