import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="footer__container container">
        <div className="footer__grid">
          <div className="footer__column">
            <h4 className="footer__title">Candidates</h4>
            <ul className="footer__list">
              <li><Link to="/dashboard">Candidate Listing</Link></li>
              <li><Link to="/dashboard">Candidates Grid</Link></li>
              <li><Link to="/jobs">Jobs Listing</Link></li>
              <li><Link to="/about">Terms and Conditions</Link></li>
              <li><Link to="/dashboard">User Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer__column">
            <h4 className="footer__title">Recruiter</h4>
            <ul className="footer__list">
              <li><Link to="/companies">Employer Listing</Link></li>
              <li><Link to="/dashboard">Create CV</Link></li>
              <li><Link to="/companies">Employers Grid</Link></li>
              <li><Link to="/jobs">Job Listing</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
            </ul>
          </div>

          <div className="footer__column">
            <h4 className="footer__title">Career Booster</h4>
            <ul className="footer__list">
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/about">News</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
              <li><Link to="/about">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer__column">
            <h4 className="footer__title">Stay Connected</h4>
            <ul className="footer__list">
              <li><Link to="/contact">Contact us</Link></li>
              <li><Link to="/post-vacancy">Post New Job</Link></li>
              <li><Link to="/dashboard">Create CV</Link></li>
              <li><Link to="/about">About us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">JobZone © 2026, All Right Reserved - Powered by JobZone</p>
        </div>
      </div>
    </footer>
  );
}
