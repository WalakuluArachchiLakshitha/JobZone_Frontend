import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Briefcase, 
  CheckCircle2,
  XCircle,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobsApi';
import './PostVacancy.css';

export default function PostVacancy() {
  const { isAuthenticated: isLoggedIn, role: contextRole } = useAuth();
  const navigate = useNavigate();

  // Read role from context first; fall back to localStorage if context is still
  // hydrating (user is null between token-restore and profile-fetch re-renders).
  const userRole = contextRole || localStorage.getItem('jobzoneUserRole') || '';

  // Company Details Form States
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  // Job Details Form States
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [noOfPositions, setNoOfPositions] = useState('1');
  const [jobLocation, setJobLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [experience, setExperience] = useState('');
  const [gender, setGender] = useState('');
  const [deadline, setDeadline] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (
      !companyName || !companyAddress || !contactPerson || !contactNumber || !companyLocation || !companyEmail ||
      !position || !industry || !noOfPositions || !jobLocation || !category || !jobType || !experience || !gender || !deadline || !salary || !description
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const jobData = {
        title: position,
        description: description,
        companyName: companyName,
        location: jobLocation,
        type: jobType,
        salary: parseFloat(salary.replace(/[^0-9.]/g, '')) || 0,
        salaryText: salary,
        category: category,
        industry: industry,
        experience: experience,
        gender: gender,
        deadline: deadline,
        noOfPositions: parseInt(noOfPositions, 10) || 1,
        contactPerson: contactPerson,
        contactNumber: contactNumber,
        companyAddress: companyAddress,
        companyEmail: companyEmail,
      };

      const res = await jobsApi.createJob(jobData);
      if (res.success) {
        setPostedSuccess(true);
        setTimeout(() => {
          setPostedSuccess(false);
          navigate('/jobs');
        }, 2000);
      }
    } catch (err) {
      alert(err.message || 'Failed to post job vacancy.');
    }
  };

  return (
    <main className="post-vacancy-page">
      {/* ===== HERO BANNER ===== */}
      <section className="post-vacancy-hero">
        <div className="container">
          <div className="post-vacancy-hero__content">
            <h1 className="post-vacancy-hero__title">Post New Job</h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="post-vacancy-breadcrumb-bar">
        <div className="container">
          <div className="post-vacancy-breadcrumb">
            <Link to="/">Home</Link>
            <span className="post-vacancy-breadcrumb__separator">&gt;</span>
            <span className="post-vacancy-breadcrumb__current">Post New Job</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <section className="post-vacancy-content">
        <div className="container">
          {!isLoggedIn ? (
            /* ===== RESTRICTED ACCESS SCREEN (NOT LOGGED IN) ===== */
            <div className="restricted-card animate-fadeInUp">
              <div className="restricted-illustration">
                <svg viewBox="0 0 400 240" width="100%" height="240" fill="none" xmlns="http://www.w3.org/2000/svg" className="illustration-svg">
                  <path d="M120 70 C 150 60, 180 80, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                  <path d="M280 70 C 250 60, 220 80, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                  <path d="M120 170 C 150 180, 180 160, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                  <path d="M280 170 C 250 180, 220 160, 200 120" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                  
                  <g transform="translate(150, 40)">
                    <rect x="0" y="0" width="18" height="24" rx="2" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <line x1="4" y1="6" x2="14" y2="6" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <line x1="4" y1="12" x2="14" y2="12" stroke="#D1D5DB" strokeWidth="1.5"/>
                  </g>
                  
                  <g transform="translate(240, 25)">
                    <rect x="0" y="0" width="22" height="16" rx="3" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <path d="M6 16 L6 20 L10 16 Z" fill="#D1D5DB"/>
                  </g>
                  
                  <g transform="translate(90, 80)">
                    <rect x="0" y="0" width="14" height="24" rx="2" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <circle cx="7" cy="19" r="1.5" fill="#D1D5DB"/>
                  </g>
                  
                  <g transform="translate(290, 80)">
                    <circle cx="10" cy="10" r="7" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <line x1="15" y1="15" x2="19" y2="19" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                  
                  <g transform="translate(90, 130)">
                    <rect x="0" y="0" width="28" height="18" rx="2" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <path d="M9 18 L5 22 L23 22 L19 18 Z" fill="#D1D5DB"/>
                  </g>
                  
                  <g transform="translate(290, 130)">
                    <circle cx="10" cy="10" r="8" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <path d="M10 5 L10 10 L14 10" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                  
                  <g transform="translate(150, 175)">
                    <path d="M0 6 L6 12 L18 0" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  
                  <g transform="translate(240, 175)">
                    <circle cx="8" cy="8" r="7" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <path d="M8 4 L8 12 M4 8 L12 8" stroke="#D1D5DB" strokeWidth="1.5"/>
                  </g>

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
              <p className="restricted-card__subtitle">If you are an employer please login to post a new job.</p>
              
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
            /* ===== CANDIDATE RESTRICTED SCREEN ===== */
            <div className="candidate-restricted-card animate-fadeInUp">
              <div className="candidate-restricted-icon-wrap">
                <XCircle size={48} className="candidate-restricted-icon" />
              </div>
              <h2 className="candidate-restricted-message">
                You are not allowed to post a job. Only an Employer can post a job.
              </h2>
            </div>
          ) : userRole === 'employer' ? (
            <div className="vacancy-form-redesign animate-fadeInUp">
              {postedSuccess && (
                <div className="vacancy-form-card__success">
                  <CheckCircle2 size={24} />
                  <span>Job vacancy posted successfully! Redirecting to Jobs list...</span>
                </div>
              )}

              <form onSubmit={handlePostJob} className="post-vacancy-form-el">
                
                {/* 1. Company Details Card */}
                <div className="form-card-section">
                  <h2 className="form-card-section__title">Company Details</h2>
                  <div className="form-card-grid">
                    
                    <div className="form-card-field">
                      <label>Company Name *</label>
                      <input 
                        type="text" 
                        placeholder="Company Name *"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-card-field">
                      <label>Company Address*</label>
                      <input 
                        type="text" 
                        placeholder="Company Address*"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Contact Person Name *</label>
                      <input 
                        type="text" 
                        placeholder="Contact Person Name *"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Contact Number*</label>
                      <input 
                        type="text" 
                        placeholder="Contact Number*"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Location*</label>
                      <input 
                        type="text" 
                        placeholder="Location*"
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Email*</label>
                      <input 
                        type="email" 
                        placeholder="Email*"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        required
                      />
                    </div>

                  </div>
                </div>

                {/* 2. Job Details Card */}
                <div className="form-card-section">
                  <h2 className="form-card-section__title">Job Details</h2>
                  <div className="form-card-grid">
                    
                    <div className="form-card-field">
                      <label>Position*</label>
                      <input 
                        type="text" 
                        placeholder="Position*"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Industry*</label>
                      <input 
                        type="text" 
                        placeholder="Industry*"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>No of Positions *</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="No of Positions *"
                        value={noOfPositions}
                        onChange={(e) => setNoOfPositions(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Location*</label>
                      <input 
                        type="text" 
                        placeholder="Location*"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Job Category *</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Job Category *</option>
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

                    <div className="form-card-field">
                      <label>Job Type *</label>
                      <select 
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        required
                      >
                        <option value="">Job Type *</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div className="form-card-field">
                      <label>Experience*</label>
                      <select 
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        required
                      >
                        <option value="">Experience*</option>
                        <option value="Fresh/Entry Level">Fresh/Entry Level</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                    </div>

                    <div className="form-card-field">
                      <label>Gender*</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      >
                        <option value="">Gender*</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Male/Female">Male/Female</option>
                        <option value="Any">Any</option>
                      </select>
                    </div>

                    <div className="form-card-field">
                      <label>Deadline*</label>
                      <input 
                        type="text" 
                        placeholder="Deadline*"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field">
                      <label>Salary*</label>
                      <input 
                        type="text" 
                        placeholder="Salary*"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field full-width">
                      <label>Job Description*</label>
                      <textarea 
                        rows="5"
                        placeholder="Job Description*"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-card-field full-width">
                      <label>Attached Files</label>
                      <div className="vacancy-file-dropzone">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#004ae4" strokeWidth="1.5" className="cloud-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <span className="dropzone-title">Drop a resume file or click to upload.</span>
                        <span className="dropzone-subtitle">To upload file size is <strong>(Max 5Mb)</strong> and allowed file types are <strong>(.jpeg, .doc, .docx, .pdf)</strong></span>
                        
                        <div className="dropzone-divider">
                          <span className="dropzone-line"></span>
                          <span className="dropzone-text">or</span>
                          <span className="dropzone-line"></span>
                        </div>

                        <label className="dropzone-upload-btn">
                          <Upload size={16} />
                          Upload Resume
                          <input 
                            type="file" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) setUploadedFileName(file.name);
                            }} 
                            accept=".jpeg,.jpg,.png,.doc,.docx,.pdf" 
                            style={{ display: 'none' }} 
                          />
                        </label>
                        
                        {uploadedFileName && (
                          <div className="uploaded-file-tag">
                            <CheckCircle2 size={14} /> {uploadedFileName}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="vacancy-form-submit-wrap">
                  <button type="submit" className="btn btn-primary vacancy-form-submit-btn">
                    Post Job
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* Any other logged-in role (e.g. admin) — show the candidate blocked screen */
            <div className="candidate-restricted-card animate-fadeInUp">
              <div className="candidate-restricted-icon-wrap">
                <XCircle size={48} className="candidate-restricted-icon" />
              </div>
              <h2 className="candidate-restricted-message">
                This page is for employers only.
              </h2>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
