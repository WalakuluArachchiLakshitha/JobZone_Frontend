import { Link } from 'react-router-dom';
import { 
  FileText, 
  Contact, 
  Briefcase, 

  Monitor,
  Headphones,
  Clock
} from 'lucide-react';
import womanLaptopCelebrating from '../assets/woman_laptop_celebrating.png';
import './About.css';

export default function About() {
  return (
    <section className="about-page" id="about-page-container">
      {/* ===== HERO BANNER ===== */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero__content">
            <h1 className="about-hero__title">About us</h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="about-breadcrumb-bar">
        <div className="container">
          <div className="about-breadcrumb">
            <Link to="/">Home</Link>
            <span className="about-breadcrumb__separator">&gt;</span>
            <span className="about-breadcrumb__current">About us</span>
          </div>
        </div>
      </div>

      {/* ===== SECTION 1: OUR STORY ===== */}
      <section className="about-story section">
        <div className="container">
          <div className="story-grid">
            {/* Story Text */}
            <div className="story-content animate-fadeInUp">
              <h2 className="story-content__title">OUR STORY</h2>
              <h3 className="story-content__subtitle">
                Connecting Talent with Opportunity – Find Jobs, Post Vacancies, Grow Together.
              </h3>
              
              <p className="story-content__text">
                jobzone was founded with a bold vision: to transform the job marketplace in Sri Lanka from a fragmented, impersonal space into a dynamic, human-centric ecosystem where talent and opportunity meet with ease, purpose, and clarity. Early on, we recognized that many job seekers struggle with mismatched roles, hidden opportunities, and unclear career paths, while employers often waste time sifting through unqualified applicants or dealing with inefficient recruitment processes.
              </p>
              
              <p className="story-content__text">
                From our earliest days, we committed ourselves to bridging this gap – not simply as a job board, but as a strategic partner to both job seekers and organizations, leveraging technology, data, and a deep understanding of Sri Lanka's labor market dynamics.
              </p>
              
              <Link to="/jobs" className="btn btn-primary story-content__btn" id="story-search-jobs-btn">
                SEARCH JOBS
              </Link>
            </div>

            {/* Diamond Collage */}
            <div className="story-collage">
              <div className="collage-grid">
                {/* Top Diamond */}
                <div className="diamond-container diamond-container--top">
                  <div className="diamond-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" 
                      alt="Businesswoman smiling" 
                      className="diamond-img"
                    />
                  </div>
                </div>

                {/* Left Diamond */}
                <div className="diamond-container diamond-container--left">
                  <div className="diamond-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80" 
                      alt="Team collaborating" 
                      className="diamond-img"
                    />
                  </div>
                </div>

                {/* Right Diamond */}
                <div className="diamond-container diamond-container--right">
                  <div className="diamond-inner">
                    <img 
                      src={womanLaptopCelebrating} 
                      alt="Woman celebrating with laptop" 
                      className="diamond-img"
                    />
                  </div>
                </div>

                {/* Bottom Diamond */}
                <div className="diamond-container diamond-container--bottom">
                  <div className="diamond-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80" 
                      alt="Industrial welder workshop" 
                      className="diamond-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: PROCESS TIMELINE STATS ===== */}
      <section className="about-stats-timeline">
        <div className="container">
          <div className="stats-timeline-row">
            {/* Stat 1 */}
            <div className="stat-timeline-item">
              <FileText size={36} className="stat-timeline-item__icon" />
              <span className="stat-timeline-item__value">0</span>
              <span className="stat-timeline-item__label">Jobs Added</span>
            </div>

            {/* Stat 2 */}
            <div className="stat-timeline-item">
              <Contact size={36} className="stat-timeline-item__icon" />
              <span className="stat-timeline-item__value">0</span>
              <span className="stat-timeline-item__label">Active Resumes</span>
            </div>

            {/* Stat 3 */}
            <div className="stat-timeline-item">
              <Briefcase size={36} className="stat-timeline-item__icon" />
              <span className="stat-timeline-item__value">0</span>
              <span className="stat-timeline-item__label">Positions Matched</span>
            </div>
          </div>

          {/* Connected timeline line & circular points */}
          <div className="stats-timeline-progress">
            <div className="stats-timeline-progress__line" />
            <div className="stats-timeline-progress__points">
              <div className="timeline-point"><div className="timeline-point__dot" /></div>
              <div className="timeline-point"><div className="timeline-point__dot" /></div>
              <div className="timeline-point"><div className="timeline-point__dot" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: OUR FEATURED SERVICES ===== */}
      <section className="about-services section">
        <div className="container">
          <div className="about-services__header">
            <h2 className="about-services__title">OUR FEATURED SERVICES</h2>
            <p className="about-services__subtitle">
              A better career is out there. We'll help you find it. We're your first step to becoming everything you want to be.
            </p>
          </div>

          <div className="services-grid">
            {/* Service 1 */}
            <div className="service-card glass-card">
              <div className="service-card__circle-icon">
                <div className="service-card__icon-container">
                  <Monitor size={32} />
                  <span className="service-card__code-symbol">&lt;/&gt;</span>
                </div>
              </div>
              <h3 className="service-card__title">Cross Browsers</h3>
              <p className="service-card__description">
                Etiam lobortis egestas orci vitaa laort ed at nunc nec mas pretiuem lao.
              </p>
            </div>

            {/* Service 2 */}
            <div className="service-card glass-card">
              <div className="service-card__circle-icon">
                <div className="service-card__icon-container">
                  <Headphones size={32} />
                </div>
              </div>
              <h3 className="service-card__title">Easy Customization</h3>
              <p className="service-card__description">
                Etiam lobortis egestas orci vitaa laort ed at nunc nec mas pretiuem lao.
              </p>
            </div>

            {/* Service 3 */}
            <div className="service-card glass-card">
              <div className="service-card__circle-icon">
                <div className="service-card__icon-container">
                  <div className="briefcase-clock-wrap">
                    <Briefcase size={28} />
                    <Clock size={16} className="briefcase-clock-badge" />
                  </div>
                </div>
              </div>
              <h3 className="service-card__title">Quick Support</h3>
              <p className="service-card__description">
                Etiam lobortis egestas orci vitaa laort ed at nunc nec mas pretiuem lao.
              </p>
            </div>
          </div>
        </div>
      </section>

    </section>
  );
}
