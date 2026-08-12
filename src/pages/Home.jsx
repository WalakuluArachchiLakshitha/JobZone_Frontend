import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Mail,
  FileText,
  MessageSquare,

  FolderOpen
} from 'lucide-react';
import { jobsApi } from '../api/jobsApi';
import JobCard from '../components/JobCard';
import './Home.css';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      setIsLoading(true);
      try {
        const res = await jobsApi.getJobs({ limit: 50, sort: '-createdAt' });
        if (res.success) {
          setJobsList(res.jobs || []);
        }
      } catch (err) {
        console.error('Error fetching jobs for Home:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentJobs();
  }, []);

  const displayedJobs = jobsList.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, jobsList.length));
  };

  const getSectorCount = (sectorName) => {
    return jobsList.filter(job => {
      const field = `${job.category || ''} ${job.industry || ''} ${job.title || ''}`.toLowerCase();
      if (sectorName === 'Human Resources & Recruitment') {
        return field.includes('human resources') || field.includes('recruitment') || field.includes(' hr ') || field.includes('hr');
      }
      if (sectorName === 'Engineering & Technical') {
        return field.includes('engineering') || field.includes('technical') || field.includes('engineer');
      }
      if (sectorName === 'Information Technology (IT) & Software') {
        return field.includes('information technology') || field.includes('it ') || field.includes('software') || field.includes('developer') || field.includes('web');
      }
      if (sectorName === 'Healthcare & Medical') {
        return field.includes('healthcare') || field.includes('medical') || field.includes('nurse') || field.includes('doctor');
      }
      return false;
    }).length;
  };

  return (
    <main className="home-page" id="home-page-container">
      {/* ===== HERO SEARCH SECTION ===== */}
      <section className="hero-section" id="home-hero">
        <div className="hero-section__bg" aria-hidden="true" />
        <div className="container hero-section__container">
          <div className="hero-search-card" id="hero-search-bar">
            {/* Keywords */}
            <div className="hero-search-card__field">
              <Search size={18} className="hero-search-card__icon" />
              <input
                type="text"
                placeholder="Keywords or Title"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="Keywords or Title"
              />
            </div>

            <div className="hero-search-card__divider" />

            {/* Categories */}
            <div className="hero-search-card__field">
              <FolderOpen size={18} className="hero-search-card__icon" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Categories"
              >
                <option value="">Categories</option>
                <option value="Accounting & Finance">Accounting & Finance</option>
                <option value="Administration & Office Support">Administration & Office Support</option>
                <option value="Agriculture, Farming">Agriculture, Farming</option>
                <option value="Apparel, Garments & Textile">Apparel, Garments & Textile</option>
                <option value="Architecture, Construction & Property">Architecture, Construction & Property</option>
                <option value="Engineering & Technical">Engineering & Technical</option>
                <option value="Hospitality, Travel & Tourism">Hospitality, Travel & Tourism</option>
                <option value="Marketing, Sales & Business Development">Marketing, Sales & Business Development</option>
              </select>
            </div>

            <div className="hero-search-card__divider" />

            {/* Location */}
            <div className="hero-search-card__field">
              <MapPin size={18} className="hero-search-card__icon" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Location"
              />
            </div>

            <Link
              to={`/jobs?search=${keyword}&location=${location}&category=${category}`}
              className="btn btn-primary hero-search-card__btn"
              id="search-job-submit"
            >
              Search Job
            </Link>
          </div>
        </div>
      </section>

      {/* ===== RECENT JOBS SECTION ===== */}
      <section className="recent-jobs section" id="home-recent-jobs">
        <div className="container">
          <div className="recent-jobs__header">
            <h2 className="recent-jobs__title">Recent Jobs</h2>
            <p className="recent-jobs__subtitle">It is a long established fact that a reader will</p>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#004ae4', fontSize: '1.2rem', fontWeight: '500' }}>
              Loading recent vacancies...
            </div>
          ) : displayedJobs.length > 0 ? (
            <div className="recent-jobs__grid">
              {displayedJobs.map((job) => (
                <JobCard key={job._id || job.id} job={job} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
              No recent jobs found.
            </div>
          )}

          {!isLoading && visibleCount < jobsList.length && (
            <div className="recent-jobs__action">
              <button
                className="btn btn-secondary recent-jobs__load-more-btn"
                onClick={handleLoadMore}
                id="load-more-listings-btn"
              >
                LOAD MORE LISTINGS
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== HOT LINE BANNER ===== */}
      <section className="hotline-banner" id="home-hotline">
        <div className="hotline-banner__marquee">
          <h2 className="hotline-banner__text">
            HOT LINE – 0765540871 | E-mail – info@jobzone.lk
          </h2>
        </div>
      </section>

      {/* ===== 4 FEATURE PILLARS ===== */}
      <section className="features-section section" id="home-features">
        <div className="container">
          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card glass-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--blue">
                <Search size={24} />
              </div>
              <h3 className="feature-card__title">Find</h3>
              <p className="feature-card__description">
                Search for and be recommended a job you love.
              </p>
              <Link to="/jobs" className="btn feature-card__btn" id="feature-find-btn">
                Find a Jobs
              </Link>
            </div>

            {/* Card 2 */}
            <div className="feature-card glass-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--mail">
                <Mail size={24} />
              </div>
              <h3 className="feature-card__title">First</h3>
              <p className="feature-card__description">
                Set up a target alert and be first to the jobs that matter.
              </p>
              <Link to="/dashboard" className="btn feature-card__btn" id="feature-alert-btn">
                Create Alert
              </Link>
            </div>

            {/* Card 3 */}
            <div className="feature-card glass-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--check">
                <FileText size={24} />
              </div>
              <h3 className="feature-card__title">Found</h3>
              <p className="feature-card__description">
                Don't just find, be found, put your CV in front of great...
              </p>
              <Link to="/dashboard" className="btn feature-card__btn" id="feature-cv-btn">
                Upload CV
              </Link>
            </div>

            {/* Card 4 */}
            <div className="feature-card glass-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--message">
                <MessageSquare size={24} />
              </div>
              <h3 className="feature-card__title">Informed</h3>
              <p className="feature-card__description">
                Don't go it alone. We've got tips and tools to help you.
              </p>
              <Link to="/about" className="btn feature-card__btn" id="feature-news-btn">
                What is New
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CHOOSE YOUR SECTOR SECTION ===== */}
      <section className="sector-section section" id="home-sectors">
        <div className="container">
          <div className="sector-section__header">
            <h2 className="sector-section__title">Choose Your Sector</h2>
            <p className="sector-section__subtitle">
              Jobs across 10 sectors. See the latest roles now.
            </p>
          </div>

          <div className="sectors-grid">
            {/* Sector 1 */}
            <div className="sector-card glass-card">
              <div className="sector-card__logo-box">
                <div className="sector-card__logo-bar"></div>
                <div className="sector-card__logo-text-wrap">
                  <span className="sector-card__logo-job">JOB</span>
                  <span className="sector-card__logo-zone">ZONE</span>
                </div>
              </div>
              <h3 className="sector-card__title">Human Resources &amp; Recruitment</h3>
              <span className="sector-card__count">({getSectorCount('Human Resources & Recruitment')} vacancies)</span>
            </div>

            {/* Sector 2 */}
            <div className="sector-card glass-card">
              <div className="sector-card__logo-box">
                <div className="sector-card__logo-bar"></div>
                <div className="sector-card__logo-text-wrap">
                  <span className="sector-card__logo-job">JOB</span>
                  <span className="sector-card__logo-zone">ZONE</span>
                </div>
              </div>
              <h3 className="sector-card__title">Engineering &amp; Technical</h3>
              <span className="sector-card__count">({getSectorCount('Engineering & Technical')} vacancies)</span>
            </div>

            {/* Sector 3 */}
            <div className="sector-card glass-card">
              <div className="sector-card__logo-box">
                <div className="sector-card__logo-bar"></div>
                <div className="sector-card__logo-text-wrap">
                  <span className="sector-card__logo-job">JOB</span>
                  <span className="sector-card__logo-zone">ZONE</span>
                </div>
              </div>
              <h3 className="sector-card__title">
                Information Technology (IT) &amp; Software
              </h3>
              <span className="sector-card__count">({getSectorCount('Information Technology (IT) & Software')} vacancies)</span>
            </div>

            {/* Sector 4 */}
            <div className="sector-card glass-card">
              <div className="sector-card__logo-box">
                <div className="sector-card__logo-bar"></div>
                <div className="sector-card__logo-text-wrap">
                  <span className="sector-card__logo-job">JOB</span>
                  <span className="sector-card__logo-zone">ZONE</span>
                </div>
              </div>
              <h3 className="sector-card__title">Healthcare &amp; Medical</h3>
              <span className="sector-card__count">({getSectorCount('Healthcare & Medical')} vacancies)</span>
            </div>
          </div>

          <div className="sector-section__action">
            <Link to="/jobs" className="btn btn-primary sector-section__btn" id="browse-all-sectors">
              BROWSE ALL SECTORS
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LOOKING TO HIRE BANNER ===== */}
      <section className="hire-banner" id="home-hire">
        <div className="container hire-banner__container">
          <div className="hire-banner__content">
            <h2 className="hire-banner__title">Looking to Hire Instead?</h2>
            <p className="hire-banner__subtitle">
              Find great, fresh talent with customizable solutions from Job River.
            </p>
          </div>
          <div className="hire-banner__actions">
            <Link to="/post-vacancy" className="btn btn-dark hire-banner__btn" id="hire-get-started">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-dark hire-banner__btn" id="hire-employer">
              Employer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
