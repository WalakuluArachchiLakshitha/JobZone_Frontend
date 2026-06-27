import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  ArrowLeft, 
  CheckCircle, 
  UserPlus, 
  LogIn, 
  XCircle,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import './CandidateDetail.css';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  
  const isLoggedIn = isAuthenticated;
  const userRole = role;

  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persistent Saved Candidates state
  const [savedCandidates, setSavedCandidates] = useState(() => {
    const saved = localStorage.getItem('jobzoneSavedCandidates');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jobzoneSavedCandidates', JSON.stringify(savedCandidates));
  }, [savedCandidates]);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!isLoggedIn || userRole !== 'employer') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await userApi.getSeekerById(id);
        if (res.success && res.seeker) {
          setCandidate(res.seeker);
        }
      } catch (err) {
        console.error('Error fetching candidate details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    }
  }, [id, isLoggedIn, userRole]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '1.25rem', color: '#004ae4' }}>
        Loading candidate profile...
      </div>
    );
  }

  // If the user is logged in as employer but candidate was not found in DB
  if (isLoggedIn && userRole === 'employer' && !candidate) {
    return (
      <div className="candidate-detail__not-found container">
        <XCircle size={48} />
        <h2>Candidate Not Found</h2>
        <p>The candidate profile you are looking for does not exist.</p>
        <Link to="/candidates" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Candidates
        </Link>
      </div>
    );
  }

  const isSaved = candidate ? savedCandidates.includes(candidate._id || candidate.id) : false;

  const handleSaveToggle = () => {
    if (!candidate) return;
    const candId = candidate._id || candidate.id;
    if (isSaved) {
      setSavedCandidates(prev => prev.filter(cid => cid !== candId));
    } else {
      setSavedCandidates(prev => [...prev, candId]);
    }
  };

  const handleDownloadCV = () => {
    if (candidate && candidate.resumeUrl) {
      const cvUrl = candidate.resumeUrl.startsWith('http') ? candidate.resumeUrl : `http://localhost:5000${candidate.resumeUrl}`;
      window.open(cvUrl, '_blank');
    } else {
      alert('No resume uploaded by this candidate.');
    }
  };

  const name = candidate ? (candidate.name || `${candidate.firstName} ${candidate.lastName}`) : '';
  const avatarUrl = candidate && candidate.avatar 
    ? (candidate.avatar.startsWith('http') ? candidate.avatar : `http://localhost:5000${candidate.avatar}`) 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80';
  
  const roleName = candidate ? (candidate.title || 'Professional Seeker') : '';
  const candLocation = candidate ? (candidate.location || 'Sri Lanka') : '';
  const firstSkill = candidate && candidate.skills && candidate.skills.length > 0 ? candidate.skills[0] : 'Information Technology';
  const bioText = candidate ? (candidate.bio || 'No professional bio provided yet.') : '';

  // Safe parsing for experience and education
  const expTitle = candidate && candidate.experience ? candidate.experience.split(' at ')[0] : 'Professional Experience';
  const expCompany = candidate && candidate.experience && candidate.experience.includes(' at ') ? candidate.experience.split(' at ')[1] : 'Company / Organization';
  
  const eduTitle = candidate && candidate.education ? candidate.education.split(' - ')[0] : 'Education Background';
  const eduSchool = candidate && candidate.education && candidate.education.includes(' - ') ? candidate.education.split(' - ')[1] : 'University / College';

  const skillsList = candidate && candidate.skills ? candidate.skills : [];
  const languagesList = candidate && candidate.languages ? candidate.languages : ['English', 'Sinhala'];

  return (
    <section className="candidate-detail-page" id="candidate-detail-container">
      {/* ===== HERO BANNER ===== */}
      <div className="candidate-detail-hero">
        <h1 className="candidate-detail-hero__title">Candidate Details</h1>
      </div>

      {/* ===== BREADCRUMBS ===== */}
      <div className="candidate-detail-breadcrumb-bar">
        <div className="container">
          <div className="candidate-detail-breadcrumb">
            <Link to="/">Home</Link>
            <span className="candidate-detail-breadcrumb__separator">&gt;</span>
            <Link to="/candidates">Candidates</Link>
            <span className="candidate-detail-breadcrumb__separator">&gt;</span>
            <span className="candidate-detail-breadcrumb__current">{name || 'Profile'}</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="container candidate-detail-content-wrap">
        {!isLoggedIn ? (
          /* ===== RESTRICTED ACCESS SCREEN (NOT LOGGED IN) ===== */
          <div className="restricted-card animate-fadeInUp">
            <div className="restricted-illustration">
              <svg viewBox="0 0 400 240" width="100%" height="240" fill="none" xmlns="http://www.w3.org/2000/svg" className="illustration-svg">
                <path d="M120 70 C 150 60, 180 80, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                <path d="M280 70 C 250 60, 220 80, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                <path d="M120 170 C 150 180, 180 160, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                <path d="M280 170 C 250 180, 220 160, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                <circle cx="200" cy="120" r="50" fill="#ffffff" filter="drop-shadow(0px 8px 24px rgba(0,0,0,0.06))"/>
                <circle cx="200" cy="120" r="44" stroke="#E5E7EB" strokeWidth="1"/>
                <defs>
                  <linearGradient id="shieldGrad" x1="175" y1="95" x2="225" y2="145" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#C026D3"/>
                    <stop offset="100%" stop-color="#2563EB"/>
                  </linearGradient>
                </defs>
                <path d="M200 95 C208 95, 222 92, 225 102 C225 120, 218 135, 200 143 C182 135, 175 120, 175 102 C178 92, 192 95, 200 95 Z" stroke="url(#shieldGrad)" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>
                <circle cx="218" cy="132" r="9" fill="#2563EB"/>
                <path d="M215 132 L217 134 L221 130" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className="restricted-card__title">THE PAGE IS ACCESSIBLE ONLY FOR SUBSCRIBED EMPLOYERS</h2>
            <p className="restricted-card__subtitle">If you are an employer please login to view candidate details.</p>
            
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary restricted-card__login-btn"
              id="restricted-login-btn"
            >
              <LogIn size={16} />
              Login
            </button>
          </div>
        ) : userRole === 'candidate' ? (
          /* ===== CANDIDATE RESTRICTED SCREEN (LOGGED IN AS CANDIDATE) ===== */
          <div className="candidate-restricted-card animate-fadeInUp">
            <div className="candidate-restricted-icon-wrap">
              <XCircle size={48} className="candidate-restricted-icon" />
            </div>
            <h2 className="candidate-restricted-message">
              You are not allowed to view candidate details. Only an Employer can view candidate details.
            </h2>
          </div>
        ) : (
          /* ===== CANDIDATE PROFILE SCREEN (LOGGED IN AS EMPLOYER) ===== */
          <div className="candidate-detail-layout animate-fadeInUp">
            {/* Header profile banner */}
            <header className="candidate-detail-header-card glass-card">
              <div className="candidate-detail-header__main">
                <div className="candidate-detail-header__avatar-wrap">
                  <img 
                    src={avatarUrl} 
                    alt={`${name} profile`} 
                    className="candidate-detail-header__avatar" 
                  />
                </div>
                <div className="candidate-detail-header__info">
                  <h2 className="candidate-detail-header__name">{name}</h2>
                  <div className="candidate-detail-header__subdetails">
                    <span className="candidate-detail-header__role">{roleName}</span>
                    <span className="candidate-detail-header__meta-item">
                      <MapPin size={14} />
                      {candLocation}
                    </span>
                    <span className="candidate-detail-header__meta-item badge badge-primary">
                      <Briefcase size={12} />
                      {firstSkill}
                    </span>
                  </div>
                </div>
              </div>

              <div className="candidate-detail-header__actions">
                <button 
                  className={`btn btn-save-candidate-detail ${isSaved ? 'btn-save-candidate-detail--saved' : ''}`}
                  onClick={handleSaveToggle}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle size={15} />
                      Saved
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      Save Candidate
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Columns grid */}
            <div className="candidate-detail-grid">
              
              {/* Left Column: Story Details */}
              <div className="candidate-detail-column-left">
                {/* Professional Summary */}
                <div className="candidate-detail-section-card glass-card">
                  <h3 className="candidate-detail-section__title">Professional Bio</h3>
                  <p className="candidate-detail-section__text">{bioText}</p>
                </div>

                {/* Work Experience */}
                <div className="candidate-detail-section-card glass-card">
                  <h3 className="candidate-detail-section__title">Work Experience</h3>
                  <div className="candidate-detail-timeline">
                    <div className="candidate-detail-timeline-item">
                      <div className="timeline-item__marker" />
                      <div className="timeline-item__content">
                        <h4 className="timeline-item__title">{expTitle}</h4>
                        <span className="timeline-item__company">{expCompany}</span>
                        <span className="timeline-item__date">2023 - Present</span>
                        <p className="timeline-item__description">
                          Led project execution and daily operational duties matching the role standards. Handled communication, report preparation, and execution tasks with the team.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="candidate-detail-section-card glass-card">
                  <h3 className="candidate-detail-section__title">Education History</h3>
                  <div className="candidate-detail-timeline">
                    <div className="candidate-detail-timeline-item">
                      <div className="timeline-item__marker timeline-item__marker--education" />
                      <div className="timeline-item__content">
                        <h4 className="timeline-item__title">{eduTitle}</h4>
                        <span className="timeline-item__school">{eduSchool}</span>
                        <span className="timeline-item__date">2019 - 2023</span>
                        <p className="timeline-item__description">
                          Completed rigorous academic coursework, participating in extra-curricular team projects, presentations, and technical group activities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact & Quick Badges */}
              <div className="candidate-detail-column-right">
                
                {/* Contact Card */}
                <div className="candidate-detail-section-card glass-card">
                  <h3 className="candidate-detail-section__title">Contact Details</h3>
                  <ul className="candidate-detail-contact-list">
                    <li>
                      <Mail size={16} className="contact-icon" />
                      <div className="contact-info-block">
                        <span className="contact-label">Email Address</span>
                        <strong className="contact-val">{candidate.email}</strong>
                      </div>
                    </li>
                    {candidate.phone && (
                      <li>
                        <Phone size={16} className="contact-icon" />
                        <div className="contact-info-block">
                          <span className="contact-label">Phone Number</span>
                          <strong className="contact-val">{candidate.phone}</strong>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Skills */}
                {skillsList.length > 0 && (
                  <div className="candidate-detail-section-card glass-card">
                    <h3 className="candidate-detail-section__title">Skills</h3>
                    <div className="candidate-detail-skills-wrap">
                      {skillsList.map((skill) => (
                        <span key={skill} className="candidate-detail-skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                <div className="candidate-detail-section-card glass-card">
                  <h3 className="candidate-detail-section__title">Languages</h3>
                  <div className="candidate-detail-languages-wrap">
                    {languagesList.map((lang) => (
                      <span key={lang} className="candidate-detail-lang-badge">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Download CV */}
                <div className="candidate-detail-section-card glass-card candidate-cv-download-card">
                  <h3 className="candidate-detail-section__title">Resume File</h3>
                  <p className="cv-download-desc">You can download the full candidate resume in PDF format.</p>
                  <button 
                    className="btn btn-primary btn-download-cv-candidate"
                    onClick={handleDownloadCV}
                  >
                    <Download size={16} />
                    Download CV (PDF)
                  </button>
                </div>

              </div>

            </div>

            {/* Back Button */}
            <div className="candidate-detail-back-bar">
              <Link to="/candidates" className="btn btn-secondary">
                <ArrowLeft size={16} />
                Back to All Candidates
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
