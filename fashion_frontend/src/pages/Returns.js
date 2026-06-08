// src/pages/Returns.js
import './InfoPage.css';

export default function Returns() {
  return (
    <div className="info-page">
      <div className="container">
        <div className="info-hero">
          <span className="badge">Hassle-free</span>
          <h1 className="page-title">Returns & Exchanges</h1>
          <p className="info-lead">Not quite right? We make returns simple — 30 days, no questions asked.</p>
        </div>

        <div className="info-grid">
          <section className="info-card">
            <div className="info-card-icon"><img src="images/1.png" alt="image" /></div>
            <h2>30-Day Window</h2>
            <p>Return any unworn, unwashed item in its original condition within <strong>30 days</strong> of delivery.</p>
          </section>

          <section className="info-card">
            <div className="info-card-icon"><img src="images/2.png" alt="image" /></div>
            <h2>Free Exchanges</h2>
            <p>Want a different size or colour? Exchanges are <strong>completely free</strong>. We'll cover the return shipping.</p>
          </section>

          <section className="info-card">
            <div className="info-card-icon"><img src="images/3.png" alt="image" /></div>
            <h2>Refunds</h2>
            <p>Refunds are issued to your original payment method within <strong>5–7 business days</strong> of us receiving the item.</p>
          </section>

          <section className="info-card">
            <div className="info-card-icon"><img src="images/4.png" alt="image" /></div>
            <h2>Non-Returnable Items</h2>
            <p>Final sale items, intimate wear, and personalised pieces cannot be returned. These are clearly marked on the product page.</p>
          </section>
        </div>

        <div className="info-steps">
          <h3>How to Return</h3>
          <ol className="info-steps-list">
            <li>
              <span className="step-num">1</span>
              <div>
                <strong>Contact us</strong>
                <p>Email <a href="mailto:returns@store.com">returns@store.com</a> with your order number and reason.</p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <strong>Get your label</strong>
                <p>We'll email you a prepaid return label within 24 hours.</p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Pack & drop off</strong>
                <p>Pack the item securely and drop it at any courier point.</p>
              </div>
            </li>
            <li>
              <span className="step-num">4</span>
              <div>
                <strong>Refund processed</strong>
                <p>Once received and inspected, your refund or exchange is on its way.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
