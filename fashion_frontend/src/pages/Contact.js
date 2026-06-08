// src/pages/Contact.js
import { useState } from 'react';
import './InfoPage.css';

export default function Contact() {
  const [form, setForm]   = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Replace with your actual contact API call if you have one
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="info-page">
      <div className="container">
        <div className="info-hero">
          <span className="badge">Get in Touch</span>
          <h1 className="page-title">Contact Us</h1>
          <p className="info-lead">We'd love to hear from you. Our team replies within 24 hours.</p>
        </div>

        <div className="contact-layout">
          {/* Left — form */}
          <div className="contact-form-wrap">
            {sent ? (
              <div className="contact-success fade-up">
                <div className="contact-success-icon">✓</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn-outline" onClick={() => { setSent(false); setForm({ name:'',email:'',subject:'',message:'' }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form fade-up">
                <div className="contact-row">
                  <div className="contact-field">
                    <label>Your Name</label>
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="Aisha Fernando" required />
                  </div>
                  <div className="contact-field">
                    <label>Email Address</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="you@email.com" required />
                  </div>
                </div>
                <div className="contact-field">
                  <label>Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Select a topic…</option>
                    <option value="order">Order Inquiry</option>
                    <option value="return">Return / Exchange</option>
                    <option value="product">Product Question</option>
                    <option value="shipping">Shipping</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="contact-field">
                  <label>Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    rows={5} placeholder="Tell us how we can help…" required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right — info */}
          <aside className="contact-info">
            <div className="contact-info-card">
              <div className="contact-info-icon"><img src="images/email.png" alt="image" /></div>
              <h4>Email Us</h4>
              <a href="mailto:hello@store.com">hello@store.com</a>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon"><img src="images/call.png" alt="image" /></div>
              <h4>Call Us</h4>
              <a href="tel:+94112345678">+94 11 234 5678</a>
              <p>Mon–Fri, 9am–6pm</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon"><img src="images/res.png" alt="image" /></div>
              <h4>Response Time</h4>
              <p>Within 24 hours on business days</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
