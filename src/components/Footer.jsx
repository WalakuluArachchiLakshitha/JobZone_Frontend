import { Link } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  const WHATSAPP_URL = 'https://wa.me/94765540871?text=' + encodeURIComponent('Hi! I\'m reaching out from JobZone.');

  return (
    <footer className="footer" id="site-footer">
      <div className="footer__container container">
        {/* ── Brand + Description ─────────────────────────────────── */}
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-job">JOB</span>
              <span className="footer__logo-zone">ZONE</span>
            </Link>
            <p className="footer__tagline">
              Sri Lanka's trusted platform connecting talent with opportunity. Find your dream job or hire the perfect candidate.
            </p>
            <div className="footer__socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
                <FaFacebookF size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="LinkedIn">
                <FaLinkedinIn size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="footer__social-link footer__social-link--whatsapp" aria-label="WhatsApp">
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>

          {/* ── Link Columns ──────────────────────────────────────── */}
          <div className="footer__grid">
            <div className="footer__column">
              <h4 className="footer__title">For Job Seekers</h4>
              <ul className="footer__list">
                <li><Link to="/jobs">Browse Jobs</Link></li>
                <li><Link to="/candidates">Candidates</Link></li>
                <li><Link to="/dashboard">My Dashboard</Link></li>
                <li><Link to="/dashboard?tab=resume">Create My CV</Link></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__title">For Employers</h4>
              <ul className="footer__list">
                <li><Link to="/post-vacancy">Post a Vacancy</Link></li>
                <li><Link to="/companies">Companies</Link></li>
                <li><Link to="/dashboard">Employer Dashboard</Link></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__title">Company</h4>
              <ul className="footer__list">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/about">Privacy Policy</Link></li>
                <li><Link to="/about">Terms &amp; Conditions</Link></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__title">Get In Touch</h4>
              <ul className="footer__list">
                <li><Link to="/contact">Contact Us</Link></li>
                <li>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    WhatsApp Support
                  </a>
                </li>
                <li><a href="mailto:info@jobzone.lk">info@jobzone.lk</a></li>
                <li><a href="tel:+94765540871">076 554 0871</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">JobZone © 2026, All Rights Reserved — Powered by JobZone</p>
        </div>
      </div>
    </footer>
  );
}
