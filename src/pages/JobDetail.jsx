import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Banknote,
  Eye,
  Briefcase,
  User,
  Mail,
  Download,
  ChevronRight,
  Plus,
  Check,
  FileText,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobsApi';
import { savedJobsApi } from '../api/savedJobsApi';
import { applicationsApi } from '../api/applicationsApi';
import mataleMap from '../assets/matale_map.png';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [companyJobs, setCompanyJobs] = useState([]);

  useEffect(() => {
    // Reset page scroll when loading different job details
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchJobDetail = async () => {
      setIsLoading(true);
      try {
        const res = await jobsApi.getJobById(id);
        if (res.success && res.job) {
          setJob(res.job);

          // Get save status
          try {
            const savedRes = await savedJobsApi.getSavedJobs();
            if (savedRes.success) {
              setIsSaved(savedRes.savedJobs.some(item => item.job && String(item.job._id) === String(res.job._id)));
            }
          } catch (e) {
            console.error('Failed to check saved status:', e);
          }

          // Get application status
          try {
            const appRes = await applicationsApi.getApplications();
            if (appRes.success) {
              setHasApplied(appRes.applications.some(item => item.job && String(item.job._id) === String(res.job._id)));
            }
          } catch (e) {
            console.error('Failed to check application status:', e);
          }

          // Fetch other jobs from same company
          try {
            const companyJobsRes = await jobsApi.getJobs({ search: res.job.company });
            if (companyJobsRes.success) {
              setCompanyJobs(companyJobsRes.jobs.filter(j => String(j._id) !== String(res.job._id)));
            }
          } catch (e) {
            console.error('Failed to fetch company jobs:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '1.25rem', color: '#004ae4' }}>
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-not-found-container container section">
        <div className="not-found-card">
          <h2>Job Not Found</h2>
          <p>We couldn't find the job listing you're looking for. It may have expired or been removed.</p>
          <Link to="/jobs" className="btn-back">
            Back to All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const handleApply = async () => {
    if (hasApplied) return;
    try {
      const res = await applicationsApi.apply(job._id, "I am interested in this job vacancy.");
      if (res.success) {
        setHasApplied(true);
        triggerToast(`Application submitted successfully for ${job.title}!`);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit application.');
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await savedJobsApi.unsaveJob(job._id);
        setIsSaved(false);
        triggerToast('Job removed from shortlist.');
      } else {
        await savedJobsApi.saveJob(job._id);
        setIsSaved(true);
        triggerToast('Job added to shortlist successfully!');
      }
      window.dispatchEvent(new Event('jobzoneSavedJobsChanged'));
    } catch (err) {
      alert(err.message || 'Failed to save/unsave job.');
    }
  };

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const companyName = job.employer?.companyName || job.company || 'Unnamed Company';
  const companyLogo = job.employer?.avatar || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80';

  return (
    <div className="job-detail-page-wrapper">
      {/* Toast Message */}
      {showToast && (
        <div className="job-detail-toast">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===== HERO BANNER ===== */}
      <section className="job-detail-hero">
        <div className="container">
          <div className="job-detail-hero__content">
            <h1 className="job-detail-hero__title">Job Detail</h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="job-detail-breadcrumb-bar">
        <div className="container">
          <div className="job-detail-breadcrumb">
            <Link to="/">Home</Link>
            <span className="job-detail-breadcrumb__separator">&gt;</span>
            <Link to="/jobs">Jobs Listing</Link>
            <span className="job-detail-breadcrumb__separator">&gt;</span>
            <span className="job-detail-breadcrumb__current">{job.title}</span>
          </div>
        </div>
      </div>

      <div className="job-detail-main-container">
        
        {/* Overlapping Main Header Card */}
        <div className="job-detail-header-card">
          <div className="job-header-card-layout">
            
            {/* Left side: Stacked Logo */}
            <div className="job-header-logo-container">
              <div className="job-logo-emblem">
                <span className="logo-job">JOB</span>
                <span className="logo-zone">ZONE</span>
              </div>
            </div>

            {/* Right side: Detailed Job Info */}
            <div className="job-header-info-container">
              
              <h1 className="job-title-heading">{job.title}</h1>
              
              <div className="job-badges-row">
                <span className="job-type-badge">{job.type || 'Full time'}</span>
                <span className="job-company-tag">@{companyName}</span>
                <span className="job-posted-time">posted {job.posted || '3 days ago'}</span>
                <span className="job-category-tag">in {job.industry || 'Marketing, Sales & Business Development'}</span>
              </div>

              <div className="job-location-row">
                <div className="location-info">
                  <MapPin size={16} className="location-icon" />
                  <span>{job.location}</span>
                </div>
                <a href="#job-map-section" className="view-map-btn">View on Map</a>
              </div>

              <div className="job-meta-details-row">
                <span className="meta-item">
                  <Calendar size={16} className="meta-icon" />
                  <span>Post Date : {job.postDate || 'June 3, 2026'}</span>
                </span>
                <span className="meta-item">
                  <Calendar size={16} className="meta-icon" />
                  <span>Apply Before : {job.applyBefore || 'July 3, 2026'}</span>
                </span>
                <span className="meta-item">
                  <Banknote size={16} className="meta-icon" />
                  <span>Salary: {job.salary || '150,000.00 / Monthly'}</span>
                </span>
                <span className="meta-item">
                  <Eye size={16} className="meta-icon" />
                  <span>View(s) {job.views || 6}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="job-header-actions">
                <button
                  onClick={handleSaveToggle}
                  className={`action-btn-outline ${isSaved ? 'action-btn-outline--active' : ''}`}
                >
                  {isSaved ? <Check size={14} /> : <span style={{ marginRight: '2px', fontWeight: 'bold' }}>+</span>}
                  {isSaved ? 'Shortlisted' : 'Shortlist'}
                </button>
                <button
                  onClick={() => triggerToast(`Job details emailed to your registered address!`)}
                  className="action-btn-outline"
                >
                  <Mail size={14} />
                  Email Job
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="job-content-columns-grid">
          
          {/* Left Column: Descriptions */}
          <div className="job-details-left-column">
            
            {/* Job Detail Summary boxes */}
            <div className="job-summary-card">
              <h2 className="section-block-title">Job Detail</h2>
              <div className="summary-boxes-grid">
                
                <div className="summary-box-item">
                  <Briefcase size={22} className="summary-box-icon" />
                  <div className="summary-box-info">
                    <span className="summary-box-label">Job ID</span>
                    <span className="summary-box-value">{job.id || '29553'}</span>
                  </div>
                </div>

                <div className="summary-box-item">
                  <Briefcase size={22} className="summary-box-icon" />
                  <div className="summary-box-info">
                    <span className="summary-box-label">Experience</span>
                    <span className="summary-box-value">{job.experience || 'Fresh'}</span>
                  </div>
                </div>

                <div className="summary-box-item">
                  <User size={22} className="summary-box-icon" />
                  <div className="summary-box-info">
                    <span className="summary-box-label">Gender</span>
                    <span className="summary-box-value">
                      {(job.gender || 'Male, Female').split(',').map((g, idx) => (
                        <div key={idx} className="gender-stacked-line">{g.trim()}</div>
                      ))}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Job Description */}
            <div className="job-detail-description-block">
              <h2 className="section-block-title">Job Description</h2>
              <div className="description-text-content">
                {job.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Attached Files */}
            <div className="job-detail-attached-files-block">
              <h2 className="section-block-title">Attached Files</h2>
              <div className="files-cards-container">
                <div className="file-attachment-card">
                  <div className="file-card-top">
                    <FileText size={36} className="file-card-icon" />
                    <span className="file-card-name">Image-2026-06-031</span>
                  </div>
                  <button 
                    onClick={() => triggerToast('Downloading file Image-2026-06-031...')}
                    className="file-card-download-bar"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sidebar */}
          <div className="job-details-right-column">
            
            {/* CTA buttons card */}
            <div className="sidebar-apply-card">
              <button
                onClick={handleApply}
                disabled={hasApplied}
                className="sidebar-apply-btn"
              >
                {hasApplied ? 'ALREADY APPLIED' : 'APPLY FOR THE JOB'}
              </button>
              <div className="ends-in-label">
                Application ends in 26d 15h 39min
              </div>
            </div>

            <button
              onClick={() => triggerToast(`Contact form opened for ${companyName}`)}
              className="sidebar-contact-btn"
            >
              <Mail size={16} />
              CONTACT EMPLOYER
            </button>

            {/* Map Card */}
            <div className="sidebar-map-card" id="job-map-section">
              <img src={mataleMap} alt="Matale Map location" className="sidebar-map-image" />
              
              {/* Mock Map UI Overlays */}
              <div className="map-overlay-search">
                <input type="text" placeholder="Enter a location" className="map-search-input" readOnly />
                <div className="map-search-icons">
                  <Search size={14} className="map-search-icon" />
                  <span className="map-search-divider">|</span>
                  <svg className="map-route-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M22.43 11.59l-9.86-9.86a1 1 0 0 0-1.41 0l-9.86 9.86a1 1 0 0 0 0 1.41l9.86 9.86a1 1 0 0 0 1.41 0l9.86-9.86a1 1 0 0 0 0-1.41zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>
                  </svg>
                </div>
              </div>
              
              <button className="map-control-fullscreen" aria-label="Toggle fullscreen" type="button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
              
              <div className="map-control-zoom">
                <button aria-label="Zoom in" type="button">+</button>
                <button aria-label="Zoom out" type="button">-</button>
              </div>
              
              <div className="map-google-logo">
                <span className="google-g">G</span>
                <span className="google-o1">o</span>
                <span className="google-o2">o</span>
                <span className="google-g2">g</span>
                <span className="google-l">l</span>
                <span className="google-e">e</span>
              </div>
            </div>

            {/* More Jobs From Company Card */}
            <div className="sidebar-company-jobs-card">
              <h3 className="company-jobs-heading">
                More Jobs From {companyName}
              </h3>
              
              <div className="company-jobs-list">
                {companyJobs.length > 0 ? (
                  companyJobs.map((cj) => (
                    <Link key={cj._id || cj.id} to={`/jobs/${cj._id || cj.id}`} className="company-job-list-item">
                      <span className="cj-title">{cj.title}</span>
                      <span className="cj-category">{cj.industry || 'Marketing, Sales & Business Development'}</span>
                      <span className="cj-location">{cj.location}</span>
                    </Link>
                  ))
                ) : (
                  <div className="no-other-jobs">No other active vacancies listed for this company.</div>
                )}
              </div>

              <Link to="/jobs" className="view-all-company-jobs-link">
                VIEW ALL JOBS <ChevronRight size={14} />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
