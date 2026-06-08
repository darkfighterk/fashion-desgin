import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

/* ─── tiny helpers ─────────────────────────────────────────── */
const CARD_KEY = 'saved_card';

function maskCard(num) {
  const clean = num.replace(/\s/g, '');
  return '**** **** **** ' + clean.slice(-4);
}

function fmtCardNum(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function fmtExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  return clean.length > 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
}

/* ─── Step indicator ───────────────────────────────────────── */
function Steps({ step }) {
  const labels = ['Shipping', 'Payment', 'Confirm'];
  return (
    <div className="co-steps">
      {labels.map((l, i) => (
        <React.Fragment key={l}>
          <div className={`co-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
            <span className="co-step-num">{step > i + 1 ? '✓' : i + 1}</span>
            <span className="co-step-label">{l}</span>
          </div>
          {i < 2 && <div className={`co-step-line ${step > i + 1 ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Icons ────────────────────────────────────────────────── */
const CashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M6 12H2M22 12h-4"/>
  </svg>
);

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20"/>
    <path d="M6 15h4"/>
    <path d="M14 15h2"/>
  </svg>
);

const BankIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
  </svg>
);

/* ─── Order Summary sidebar ────────────────────────────────── */
function OrderSummary({ items, total }) {
  return (
    <div className="checkout-summary">
      <h2>Order Summary</h2>
      {items.map(item => (
        <div key={item.id} className="co-item">
          <div className="co-item-img">
            {item.images?.[0]
              ? <img src={`http://localhost:5000${item.images[0]}`} alt={item.name} />
              : <div className="img-placeholder" />}
          </div>
          <div>
            <p className="co-item-name">{item.name}</p>
            <p className="co-item-meta">
              {item.size && `${item.size} `}{item.color && `· ${item.color} `}× {item.quantity}
            </p>
          </div>
          <p className="co-item-price">${item.subtotal?.toFixed(2)}</p>
        </div>
      ))}
      <div className="co-total">
        <span>Total</span><span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  /* shipping form */
  const [shipping, setShipping] = useState({
    shipping_name:    user?.name || '',
    shipping_address: '',
    shipping_city:    '',
    shipping_zip:     '',
  });

  /* payment */
  const [method, setMethod] = useState('cod');

  /* card form */
  const [savedCard, setSavedCard]   = useState(null);
  const [useSaved, setUseSaved]     = useState(false);
  const [saveCard, setSaveCardFlag] = useState(true);
  const [card, setCard] = useState({
    holder: '', number: '', expiry: '', cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({});

  /* bank transfer */
  const [bankRef, setBankRef]   = useState('');
  const [slipFile, setSlipFile] = useState(null);

  /* load saved card on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CARD_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedCard(parsed);
        setUseSaved(true);
      }
    } catch {}
  }, []);

  /* guards */
  if (!user)         { navigate('/login'); return null; }
  if (!items.length) { navigate('/cart');  return null; }

  /* ── helpers ── */
  const handleShipping = e =>
    setShipping(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleCard = e => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'number') v = fmtCardNum(value);
    if (name === 'expiry') v = fmtExpiry(value);
    if (name === 'cvv')    v = value.replace(/\D/g, '').slice(0, 4);
    setCard(c => ({ ...c, [name]: v }));
    setCardErrors(ce => ({ ...ce, [name]: '' }));
  };

  const validateCard = () => {
    const errs = {};
    if (!card.holder.trim())                        errs.holder = 'Required';
    if (card.number.replace(/\s/g,'').length < 16)  errs.number = 'Enter 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry))        errs.expiry = 'Format MM/YY';
    if (card.cvv.length < 3)                         errs.cvv    = 'Enter 3–4 digit CVV';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Step 1 → 2 ── */
  const goToPayment = e => {
    e.preventDefault();
    setStep(2);
  };

  /* ── Step 2 → 3 ── */
  const goToConfirm = e => {
    e.preventDefault();
    setError('');
    if (method === 'card' && !useSaved) {
      if (!validateCard()) return;
      if (saveCard) {
        localStorage.setItem(CARD_KEY, JSON.stringify({
          holder: card.holder,
          number: card.number,
          expiry: card.expiry,
        }));
        setSavedCard({ holder: card.holder, number: card.number, expiry: card.expiry });
      }
    }
    if (method === 'bank' && !bankRef.trim()) {
      setError('Please enter your bank transfer reference number.');
      return;
    }
    setStep(3);
  };

  /* ── Final submit ── */
  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const payload = {
        ...shipping,
        payment_method: method,
        ...(method === 'card' && {
          card_last4: (useSaved ? savedCard.number : card.number).replace(/\s/g,'').slice(-4),
          card_holder: useSaved ? savedCard.holder : card.holder,
        }),
        ...(method === 'bank' && { bank_ref: bankRef }),
      };
      const r = await placeOrder(payload);
      if (r.status) {
        clear();
        navigate('/orders', {
          state: {
            newOrder: true,
            paymentMethod: method,
            pendingBank: method === 'bank',
          }
        });
      } else {
        setError(r.message || 'Failed to place order');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedCard = () => {
    localStorage.removeItem(CARD_KEY);
    setSavedCard(null);
    setUseSaved(false);
  };

  /* ─── Payment options config ───────────────────────────── */
  const paymentOptions = [
    { id: 'cod',  label: 'Cash on Delivery', icon: <CashIcon /> },
    { id: 'card', label: 'Card Payment',     icon: <CardIcon /> },
    { id: 'bank', label: 'Bank Transfer',    icon: <BankIcon /> },
  ];

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="checkout-page container fade-up">
      <button className="pd-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="page-title" style={{ marginBottom: 28 }}>Checkout</h1>

      <Steps step={step} />

      <div className="checkout-layout">

        {/* ══ STEP 1 — SHIPPING ══ */}
        {step === 1 && (
          <form className="checkout-form" onSubmit={goToPayment}>
            <h2>Shipping Details</h2>

            <div className="form-group">
              <label>Full Name</label>
              <input name="shipping_name" value={shipping.shipping_name}
                onChange={handleShipping} required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="shipping_address" value={shipping.shipping_address}
                onChange={handleShipping} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input name="shipping_city" value={shipping.shipping_city}
                  onChange={handleShipping} required />
              </div>
              <div className="form-group">
                <label>ZIP / Postal Code</label>
                <input name="shipping_zip" value={shipping.shipping_zip}
                  onChange={handleShipping} required />
              </div>
            </div>

            <button type="submit" className="btn-primary"
              style={{ width: '100%', marginTop: 28, padding: '14px' }}>
              Continue to Payment →
            </button>
          </form>
        )}

        {/* ══ STEP 2 — PAYMENT ══ */}
        {step === 2 && (
          <form className="checkout-form" onSubmit={goToConfirm}>
            <h2>Payment Method</h2>

            <div className="payment-options">
              {/* ✅ FIX: icon is now destructured AND rendered */}
              {paymentOptions.map(({ id, label, icon }) => (
                <label
                  key={id}
                  className={`payment-opt ${method === id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={id}
                    checked={method === id}
                    onChange={() => { setMethod(id); setError(''); }}
                  />
                  <span className="payment-opt-icon">{icon}</span>
                  <span className="payment-opt-label">{label}</span>
                </label>
              ))}
            </div>

            {/* ── COD info ── */}
            {method === 'cod' && (
              <div className="payment-info-box">
                <p>💵 Pay in cash when your order is delivered. No extra charges.</p>
              </div>
            )}

            {/* ── CARD form ── */}
            {method === 'card' && (
              <div className="card-section">
                {savedCard && (
                  <div className="saved-card-box">
                    <div className="saved-card-info">
                      <span className="saved-card-icon">💳</span>
                      <div>
                        <p className="saved-card-name">{savedCard.holder}</p>
                        <p className="saved-card-num">{maskCard(savedCard.number)} · Exp {savedCard.expiry}</p>
                      </div>
                    </div>
                    <div className="saved-card-actions">
                      <label className="saved-card-use">
                        <input type="checkbox" checked={useSaved}
                          onChange={e => setUseSaved(e.target.checked)} />
                        Use this card
                      </label>
                      <button type="button" className="remove-card-btn"
                        onClick={removeSavedCard}>Remove</button>
                    </div>
                  </div>
                )}

                {!useSaved && (
                  <div className="card-form">
                    

                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input name="holder" value={card.holder} onChange={handleCard}
                        placeholder="John Smith" />
                      {cardErrors.holder && <span className="field-error">{cardErrors.holder}</span>}
                    </div>

                    <div className="form-group">
                      <label>Card Number</label>
                      <input name="number" value={card.number} onChange={handleCard}
                        placeholder="1234 5678 9012 3456" maxLength={19} />
                      {cardErrors.number && <span className="field-error">{cardErrors.number}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry</label>
                        <input name="expiry" value={card.expiry} onChange={handleCard}
                          placeholder="MM/YY" maxLength={5} />
                        {cardErrors.expiry && <span className="field-error">{cardErrors.expiry}</span>}
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input name="cvv" value={card.cvv} onChange={handleCard}
                          placeholder="123" maxLength={4} type="password" />
                        {cardErrors.cvv && <span className="field-error">{cardErrors.cvv}</span>}
                      </div>
                    </div>

                    <label className="save-card-label">
                      <input type="checkbox" checked={saveCard}
                        onChange={e => setSaveCardFlag(e.target.checked)} />
                      Save card for future purchases
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* ── BANK TRANSFER ── */}
            {method === 'bank' && (
              <div className="bank-section">
                <div className="payment-info-box bank-details">
                  <p><strong>Bank Transfer Instructions</strong></p>
                  <p>Bank: <strong>Demo Bank</strong></p>
                  <p>Account Name: <strong>ShopCo Ltd</strong></p>
                  <p>Account No: <strong>1234-5678-9012</strong></p>
                  <p>Reference: <strong>Your Order ID (assigned after placing)</strong></p>
                  <p className="bank-note">⚠️ Your order will be held until payment is verified by our admin (usually within 24 hrs).</p>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Your Transfer Reference / Transaction ID</label>
                  <input value={bankRef} onChange={e => setBankRef(e.target.value)}
                    placeholder="e.g. TXN123456789" />
                </div>

                <div className="form-group">
                  <label>Upload Payment Slip <span className="optional">(optional)</span></label>
                  <input type="file" accept="image/*,.pdf"
                    onChange={e => setSlipFile(e.target.files[0])} />
                  {slipFile && <p className="slip-name">📎 {slipFile.name}</p>}
                </div>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="form-row" style={{ marginTop: 28 }}>
              <button type="button" className="btn-secondary"
                onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                Review Order →
              </button>
            </div>
          </form>
        )}

        {/* ══ STEP 3 — CONFIRM ══ */}
        {step === 3 && (
          <div className="checkout-form">
            <h2>Review & Confirm</h2>

            <div className="review-section">
              <div className="review-header">
                <span>📦 Shipping</span>
                <button type="button" className="edit-btn" onClick={() => setStep(1)}>Edit</button>
              </div>
              <p>{shipping.shipping_name}</p>
              <p>{shipping.shipping_address}, {shipping.shipping_city} {shipping.shipping_zip}</p>
            </div>

            <div className="review-section">
              <div className="review-header">
                <span>💳 Payment</span>
                <button type="button" className="edit-btn" onClick={() => setStep(2)}>Edit</button>
              </div>
              {method === 'cod' && <p>💵 Cash on Delivery</p>}
              {method === 'card' && (
                <p>💳 Card ending in{' '}
                  {(useSaved ? savedCard?.number : card.number)
                    ?.replace(/\s/g,'').slice(-4)}
                  {' '}— {useSaved ? savedCard?.holder : card.holder}
                </p>
              )}
              {method === 'bank' && (
                <>
                  <p>🏦 Bank Transfer</p>
                  <p className="review-sub">Reference: {bankRef}</p>
                  <p className="review-sub pending-note">
                    ⏳ Order will be <strong>pending admin approval</strong> until payment is verified.
                  </p>
                </>
              )}
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="btn-primary"
              style={{ width: '100%', marginTop: 28, padding: '14px' }}
              onClick={handleSubmit} disabled={loading}>
              {loading
                ? 'Placing Order...'
                : `Confirm & Place Order — $${total.toFixed(2)}`}
            </button>

            <button type="button" className="btn-secondary"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => setStep(2)}>← Back to Payment</button>
          </div>
        )}

        <OrderSummary items={items} total={total} />
      </div>
    </div>
  );
}