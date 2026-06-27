import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { contactApi } from '../api/contactApi';
import './Contact.css';

export default function Contact() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill in Name, Email, and Message.');
      return;
    }
    
    try {
      const res = await contactApi.submitContact({
        name,
        subject,
        email,
        phone,
        message
      });
      
      if (res.success) {
        setSubmitted(true);
        setName('');
        setSubject('');
        setEmail('');
        setPhone('');
        setMessage('');
        
        setTimeout(() => {
          setSubmitted(false);
        }, 4000);
      } else {
        alert(res.message || 'Failed to send your message. Please try again.');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      alert(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <main className="contact-page" id="contact-page-container">
      {/* ===== HERO BANNER ===== */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero__content">
            <h1 className="contact-hero__title">Contact us</h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="contact-breadcrumb-bar">
        <div className="container">
          <div className="contact-breadcrumb">
            <Link to="/">Home</Link>
            <span className="contact-breadcrumb__separator">&gt;</span>
            <span className="contact-breadcrumb__current">Contact us</span>
          </div>
        </div>
      </div>

      {/* ===== CONTACT SPLIT CARD SECTION ===== */}
      <section className="contact-main section">
        <div className="container">
          <div className="contact-card-wrapper animate-fadeInUp">
            {/* Left Column: Contact Information */}
            <div className="contact-info-panel">
              <h2 className="contact-info-panel__title">Contact Information</h2>
              <p className="contact-info-panel__subtitle">
                We guarantee you to connect with the Best Employers in Sri Lanka to find the best position for your Qualification.
              </p>
              
              <ul className="contact-info-list">
                <li className="contact-info-list__item">
                  <MapPin size={18} className="contact-info-list__icon" />
                  <span>Dampe Rd, Homagama.</span>
                </li>
                
                <li className="contact-info-list__item">
                  <Mail size={18} className="contact-info-list__icon" />
                  <span>Email: info@jobzone.lk</span>
                </li>
                
                <li className="contact-info-list__item">
                  <Phone size={18} className="contact-info-list__icon" />
                  <span>Call: 0765540871</span>
                </li>
              </ul>
            </div>

            {/* Right Column: Contact Form */}
            <div className="contact-form-panel">
              <h2 className="contact-form-panel__title">We want to hear form you!</h2>
              
              {submitted && (
                <div className="contact-form-success">
                  <CheckCircle2 size={20} />
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form__grid">
                  {/* Row 1 */}
                  <div className="contact-form__field">
                    <input 
                      type="text" 
                      placeholder="Enter Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <User size={18} className="contact-form__input-icon" />
                  </div>

                  <div className="contact-form__field">
                    <input 
                      type="text" 
                      placeholder="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                    <User size={18} className="contact-form__input-icon" />
                  </div>

                  {/* Row 2 */}
                  <div className="contact-form__field">
                    <input 
                      type="email" 
                      placeholder="Enter Your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Mail size={18} className="contact-form__input-icon" />
                  </div>

                  <div className="contact-form__field">
                    <input 
                      type="tel" 
                      placeholder="Enter Your Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Phone size={18} className="contact-form__input-icon" />
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="contact-form__field full-width">
                  <textarea 
                    placeholder="Enter Your Message"
                    rows="6"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                {/* Submit button */}
                <button type="submit" className="btn btn-primary contact-form__submit-btn">
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: THREE COLUMN LINKS ===== */}
      <section className="contact-columns section">
        <div className="container">
          <div className="contact-columns__grid">
            {/* Column 1: Careers */}
            <div className="contact-column-item">
              <h3 className="contact-column-item__title">Want to join us?</h3>
              <div className="contact-column-item__icon-wrap">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#007BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="contact-svg-icon">
                  <path d="M16 48c0-8.8 7.2-16 16-16s16 7.2 16 16" />
                  <circle cx="32" cy="18" r="10" />
                  <path d="M42 18h2a2 2 0 0 1 2 2v2" />
                  <path d="M22 18h-2a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <Link to="/jobs" className="btn contact-column-item__btn">
                CAREERS
              </Link>
            </div>

            {/* Column 2: Our Blog */}
            <div className="contact-column-item">
              <h3 className="contact-column-item__title">Read our latest news</h3>
              <div className="contact-column-item__icon-wrap">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#007BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="contact-svg-icon">
                  <rect x="8" y="8" width="48" height="48" rx="4" />
                  <line x1="16" y1="18" x2="48" y2="18" />
                  <line x1="16" y1="26" x2="32" y2="26" />
                  <line x1="16" y1="34" x2="48" y2="34" />
                  <line x1="16" y1="42" x2="40" y2="42" />
                </svg>
              </div>
              <Link to="/about" className="btn contact-column-item__btn">
                OUR BLOG
              </Link>
            </div>

            {/* Column 3: Our FAQ */}
            <div className="contact-column-item">
              <h3 className="contact-column-item__title">Have questions?</h3>
              <div className="contact-column-item__icon-wrap">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#007BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="contact-svg-icon">
                  <path d="M21 15h22a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5h-4l-8 8v-8H21a5 5 0 0 1-5-5V20a5 5 0 0 1 5-5z" />
                  <text x="32" y="36" fontSize="18" fontFamily="Inter, sans-serif" fontWeight="800" textAnchor="middle" fill="#007BFF" stroke="none">?</text>
                </svg>
              </div>
              <Link to="/about" className="btn contact-column-item__btn">
                OUR FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
