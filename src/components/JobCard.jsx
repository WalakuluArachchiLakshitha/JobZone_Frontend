import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Clock, Calendar, Folder, CheckCircle } from 'lucide-react';
import { savedJobsApi } from '../api/savedJobsApi';
import './JobCard.css';

export default function JobCard({ job, initialSaved }) {
  const navigate = useNavigate();

  // Mocking branch names based on locations or ID to match figma Branch values
  const branchName = job.branch || (job.location.includes(',') ? `${job.location.split(',')[0]} Branch` : 'Malabe Branch');

  const getBaseId = (id) => String(id || '').split('-')[0];

  const jobId = job._id || job.id;

  // If the parent passes initialSaved (e.g. from Dashboard saved list), trust it.
  // Otherwise fall back to checking localStorage as a best-effort for guests.
  const [isSaved, setIsSaved] = useState(() => {
    if (initialSaved !== undefined) return initialSaved;
    const savedRaw = localStorage.getItem('jobzoneSavedJobs');
    const savedList = savedRaw ? JSON.parse(savedRaw) : [];
    return savedList.some(s => getBaseId(s.id || s._id) === getBaseId(jobId));
  });

  // Keep isSaved in sync when initialSaved prop changes from outside
  useEffect(() => {
    if (initialSaved !== undefined) {
      setIsSaved(initialSaved);
    }
  }, [initialSaved]);

  // Sync saved status from changes elsewhere (only used when not controlled by parent)
  useEffect(() => {
    if (initialSaved !== undefined) return; // parent controls state — skip
    const handleSavedJobsChanged = () => {
      const savedRaw = localStorage.getItem('jobzoneSavedJobs');
      const savedList = savedRaw ? JSON.parse(savedRaw) : [];
      setIsSaved(savedList.some(s => getBaseId(s.id || s._id) === getBaseId(jobId)));
    };
    window.addEventListener('jobzoneSavedJobsChanged', handleSavedJobsChanged);
    return () => window.removeEventListener('jobzoneSavedJobsChanged', handleSavedJobsChanged);
  }, [jobId, initialSaved]);

  // Handle click on favorite (toggle action) — calls backend API
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('jobzone_token');

    if (!token) {
      // Not logged in — fall back to localStorage only
      const savedRaw = localStorage.getItem('jobzoneSavedJobs');
      const savedList = savedRaw ? JSON.parse(savedRaw) : [];
      let updatedList = [...savedList];
      if (!isSaved) {
        updatedList = [job, ...updatedList];
      } else {
        updatedList = updatedList.filter(s => getBaseId(s.id || s._id) !== getBaseId(jobId));
      }
      localStorage.setItem('jobzoneSavedJobs', JSON.stringify(updatedList));
      setIsSaved(!isSaved);
      window.dispatchEvent(new Event('jobzoneSavedJobsChanged'));
      return;
    }

    // Logged in — use backend API
    try {
      if (isSaved) {
        await savedJobsApi.unsaveJob(jobId);
        setIsSaved(false);
      } else {
        await savedJobsApi.saveJob(jobId);
        setIsSaved(true);
      }
      // Notify Dashboard and other listeners to refresh the saved jobs list
      window.dispatchEvent(new Event('jobzoneSavedJobsChanged'));
    } catch (err) {
      // If 409 (already saved), just toggle the UI state
      if (err?.status === 409) {
        setIsSaved(true);
      } else {
        console.error('Failed to toggle saved job:', err);
      }
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="job-card" id={`job-card-${jobId}`} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="job-card__logo-container">
        <div className="job-card__logo-box">
          <span className="job-card__logo-job">JOB</span>
          <span className="job-card__logo-zone">ZONE</span>
        </div>
      </div>

      <div className="job-card__content">
        <h3 className="job-card__title">
          <Link to={`/jobs/${jobId}`}>{job.title}</Link>
        </h3>
        <div className="job-card__company-row">
          <span className="job-card__company">{job.company?.name || job.company || 'Company'}</span>
          {(job.employer?.verified) && (
            <span className="job-card__verified-badge" title="Verified Company">
              <CheckCircle size={13} /> Verified
            </span>
          )}
          <span className="job-card__branch">@ {branchName}</span>
        </div>
        <div className="job-card__location">
          <MapPin size={13} className="job-card__location-icon" />
          <span>{job.location}</span>
        </div>

        {/* sub-details row */}
        <div className="job-card__details-row">
          <span className="job-card__detail-item">
            <Clock size={12} className="job-card__detail-icon" />
            Published {job.posted || '3 days ago'}
          </span>
          <span className="job-card__detail-item">
            <Calendar size={12} className="job-card__detail-icon" />
            Deadline {job.deadline || 'June 4, 2026'}
          </span>
          <span className="job-card__detail-item">
            <Folder size={12} className="job-card__detail-icon" />
            {job.category || 'Marketing, Sales & Business Development'}
          </span>
        </div>
      </div>

      <div className="job-card__meta">
        {typeof job.matchScore === 'number' && (
          <span className={`job-card__match-score ${job.matchScore >= 70 ? 'job-card__match-score--high' : job.matchScore >= 40 ? 'job-card__match-score--medium' : 'job-card__match-score--low'}`}>
            {job.matchScore}% Match
          </span>
        )}
        <span className="job-card__type-badge">{job.type}</span>
        <button
          className={`job-card__favorite-btn ${isSaved ? 'job-card__favorite-btn--active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label="Save Job"
        >
          <Heart size={14} color={isSaved ? "#ffffff" : "currentColor"} />
        </button>
      </div>
    </div>
  );
}
