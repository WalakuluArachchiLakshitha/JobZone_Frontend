import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { Upload, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { locationData } from '../data/locationData';
import registerHandshake from '../assets/register_handshake.png';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Credentials, 3: Profile Info
  const [role, setRole] = useState('candidate'); // candidate or employer
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Step 2 Credentials state
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Step 3 Profile Data state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    region: '',
    city: '',
    organizationName: '',
    nic: '',
  });

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Derived location options
  const availableCountries = Object.keys(locationData);
  const selectedCountryData = locationData[profileData.country];
  const availableRegions = selectedCountryData ? selectedCountryData.regions : [];
  const selectedRegionData = availableRegions.find(
    (r) => r.name === profileData.region || r.label === profileData.region
  );
  const availableCities = selectedRegionData ? selectedRegionData.cities : [];

  // Validation routines
  const validateCredentials = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== credentials.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateProfile = (name, value) => {
    switch (name) {
      case 'firstName':
        return !value.trim() ? 'First Name is required' : '';
      case 'lastName':
        return !value.trim() ? 'Last Name is required' : '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'phone':
        return !value.trim() ? 'Phone Number is required' : '';
      case 'country':
        return !value ? 'Country is required' : '';
      case 'region':
        return !value ? 'Region is required' : '';
      case 'city':
        return !value ? 'City is required' : '';
      case 'nic':
        if (!value.trim()) return 'NIC is required';
        if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(value.trim())) return 'Enter a valid NIC (e.g., 200012345678 or 123456789V)';
        return '';
      default:
        return '';
    }
  };

  // Step 2 Handlers
  const handleCredChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateCredentials(name, value) }));
    }
  };

  const handleCredBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateCredentials(name, value) }));
  };

  const handleCredSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      email: validateCredentials('email', credentials.email),
      password: validateCredentials('password', credentials.password),
      confirmPassword: validateCredentials('confirmPassword', credentials.confirmPassword),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true, confirmPassword: true });

    if (Object.values(newErrors).some((err) => err)) return;

    // Prefill profile email from credentials
    setProfileData((prev) => ({ ...prev, email: credentials.email }));
    setTouched({});
    setErrors({});
    setStep(3);
  };

  // Step 3 Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    if (name === 'country') {
      setProfileData((prev) => ({
        ...prev,
        country: value,
        region: '',
        city: '',
      }));
      setErrors((prev) => ({
        ...prev,
        country: validateProfile('country', value),
        region: '',
        city: '',
      }));
    } else if (name === 'region') {
      setProfileData((prev) => ({
        ...prev,
        region: value,
        city: '',
      }));
      setErrors((prev) => ({
        ...prev,
        region: validateProfile('region', value),
        city: '',
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) {
        setErrors((prev) => ({ ...prev, [name]: validateProfile(name, value) }));
      }
    }
  };

  const handleProfileBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateProfile(name, value) }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      firstName: validateProfile('firstName', profileData.firstName),
      lastName: validateProfile('lastName', profileData.lastName),
      email: validateProfile('email', profileData.email),
      phone: validateProfile('phone', profileData.phone),
      country: validateProfile('country', profileData.country),
      region: validateProfile('region', profileData.region),
      city: validateProfile('city', profileData.city),
    };

    // Add NIC validation for candidates
    if (role === 'candidate') {
      newErrors.nic = validateProfile('nic', profileData.nic);
    }

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      country: true,
      region: true,
      city: true,
      ...(role === 'candidate' ? { nic: true } : {}),
    });

    if (Object.values(newErrors).some((err) => err)) return;
    if (!agreedTerms) {
      alert('Please agree to the Terms and Conditions and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    const signupData = {
      email: credentials.email,
      password: credentials.password,
      role: role,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      country: profileData.country,
      region: profileData.region,
      city: profileData.city,
    };

    if (role === 'candidate') {
      signupData.nic = profileData.nic;
    }

    if (role === 'employer') {
      signupData.organizationName = profileData.organizationName;
    }

    try {
      const regResult = await register(signupData);
      if (regResult.success) {
        if (selectedFile) {
          const formData = new FormData();
          if (role === 'candidate') {
            formData.append('resume', selectedFile);
            await userApi.uploadResumeFile(formData);
          } else {
            formData.append('companyBR', selectedFile);
            await userApi.uploadCompanyBR(formData);
          }
        }
        navigate('/dashboard');
      } else {
        setApiError(regResult.message);
      }
    } catch (err) {
      setApiError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Role Selection Render
  if (step === 1) {
    return (
      <section className="login-section">
        <div className="login-container">

          {/* Left Side: Form */}
          <div className="login-pane login-pane--form">
            <div className="login-form-wrapper">

              <div className="login-header">
                <h1 className="login-title">Register your information</h1>
                <p className="login-subtitle">Fill the form below to get instant access:</p>
              </div>

              <div className="role-selection-actions">
                <button
                  type="button"
                  className="role-selection-btn"
                  onClick={() => {
                    setRole('candidate');
                    setStep(2);
                  }}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  className="role-selection-btn"
                  onClick={() => {
                    setRole('employer');
                    setStep(2);
                  }}
                >
                  Employer
                </button>
              </div>

            </div>

            <footer className="login-footer">
              © 2026 ALL RIGHTS RESERVED
            </footer>
          </div>

          {/* Right Side: Image with Logo Overlay */}
          <div className="login-pane login-pane--image" style={{ backgroundImage: `url(${registerHandshake})` }}>
            <div className="logo-overlay">
              <Link to="/" className="login-logo-link">
                <span className="logo-text-job">JOB</span>
                <span className="logo-text-zone">ZONE</span>
              </Link>
            </div>
          </div>

        </div>
      </section>
    );
  }

  // Step 2: Credentials Form Render
  if (step === 2) {
    return (
      <section className="login-section">
        <div className="login-container">

          {/* Left Side: Form */}
          <div className="login-pane login-pane--form">
            <div className="login-form-wrapper">

              <div className="login-header">
                <h1 className="login-title">Log in  now </h1>
                <p className="login-subtitle">Fill the form below to get instant access:</p>
              </div>

              <form className="login-form" onSubmit={handleCredSubmit} noValidate>
                {/* Email */}
                <div className={`form-group ${errors.email && touched.email ? 'form-group--error' : ''}`}>
                  <label htmlFor="cred-email" className="form-label">Email</label>
                  <input
                    id="cred-email"
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Example@email.com"
                    value={credentials.email}
                    onChange={handleCredChange}
                    onBlur={handleCredBlur}
                    autoComplete="email"
                  />
                  {errors.email && touched.email && (
                    <span className="form-error">{errors.email}</span>
                  )}
                </div>

                {/* Password */}
                <div className={`form-group ${errors.password && touched.password ? 'form-group--error' : ''}`}>
                  <label htmlFor="cred-password" className="form-label">Password</label>
                  <input
                    id="cred-password"
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="at least 8 characters"
                    value={credentials.password}
                    onChange={handleCredChange}
                    onBlur={handleCredBlur}
                    autoComplete="new-password"
                  />
                  {errors.password && touched.password && (
                    <span className="form-error">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={`form-group ${errors.confirmPassword && touched.confirmPassword ? 'form-group--error' : ''}`}>
                  <label htmlFor="cred-confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    id="cred-confirmPassword"
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="at least 8 characters"
                    value={credentials.confirmPassword}
                    onChange={handleCredChange}
                    onBlur={handleCredBlur}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <span className="form-error">{errors.confirmPassword}</span>
                  )}
                </div>

                <button type="submit" className="submit-btn">
                  Register
                </button>
              </form>

              <div className="login-divider">
                <span className="login-divider-line"></span>
                <span className="login-divider-text">Or</span>
                <span className="login-divider-line"></span>
              </div>

              <button className="google-btn" type="button" onClick={() => {
                setProfileData((prev) => ({ ...prev, email: 'googleuser@gmail.com' }));
                setStep(3);
              }}>
                <FcGoogle size={20} className="google-icon" />
                <span className="google-btn-text">Register with Google</span>
              </button>

              <p className="signup-prompt">
                Do you have an account? <Link to="/login" className="signup-link">Log in </Link>
              </p>
            </div>

            <footer className="login-footer">
              © 2026 ALL RIGHTS RESERVED
            </footer>
          </div>

          {/* Right Side: Image with Logo Overlay */}
          <div className="login-pane login-pane--image" style={{ backgroundImage: `url(${registerHandshake})` }}>
            <div className="logo-overlay">
              <Link to="/" className="login-logo-link">
                <span className="logo-text-job">JOB</span>
                <span className="logo-text-zone">ZONE</span>
              </Link>
            </div>
          </div>

        </div>
      </section>
    );
  }

  // Step 3: Detailed Profile Form Render
  return (
    <section className="profile-register-section">
      <div className="profile-register-container">

        {/* Title Block */}
        <div className="profile-register-header">
          <h1 className="profile-register-title">Register your information</h1>
          <p className="profile-register-subtitle">Fill the form below to get instant access:</p>
        </div>

        {/* 2-Column Form */}
        <form className="profile-register-form" onSubmit={handleProfileSubmit} noValidate>
          {apiError && (
            <div style={{ width: '100%', marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#ffebe9', color: '#ea3829', border: '1px solid #ffc8c3', borderRadius: '6px', textAlign: 'center', fontSize: '0.875rem' }}>
              {apiError}
            </div>
          )}
          <div className="profile-form-grid">

            {/* Left Column */}
            <div className="profile-form-column">

              {/* First Name */}
              <div className={`form-group ${errors.firstName && touched.firstName ? 'form-group--error' : ''}`}>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  placeholder="First Name *"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                />
                {errors.firstName && touched.firstName && (
                  <span className="form-error">{errors.firstName}</span>
                )}
              </div>

              {/* Email */}
              <div className={`form-group ${errors.email && touched.email ? 'form-group--error' : ''}`}>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Email *"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                />
                {errors.email && touched.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              {/* Country */}
              <div className={`form-group ${errors.country && touched.country ? 'form-group--error' : ''}`}>
                <label className="form-label">Country *</label>
                <select
                  name="country"
                  className="form-input form-select"
                  value={profileData.country}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                >
                  <option value="">Please select Country</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.country && touched.country && (
                  <span className="form-error">{errors.country}</span>
                )}
              </div>

              {/* Region */}
              <div className={`form-group ${errors.region && touched.region ? 'form-group--error' : ''}`}>
                <label className="form-label">Region *</label>
                <select
                  name="region"
                  className="form-input form-select"
                  value={profileData.region}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  disabled={!profileData.country}
                >
                  <option value="">Please select Region</option>
                  {availableRegions.map((reg) => (
                    <option key={reg.name} value={reg.name}>
                      {reg.label}
                    </option>
                  ))}
                </select>
                {errors.region && touched.region && (
                  <span className="form-error">{errors.region}</span>
                )}
              </div>

              {/* City */}
              <div className={`form-group ${errors.city && touched.city ? 'form-group--error' : ''}`}>
                <label className="form-label">City *</label>
                <select
                  name="city"
                  className="form-input form-select"
                  value={profileData.city}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  disabled={!profileData.region}
                >
                  <option value="">Please select City</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && touched.city && (
                  <span className="form-error">{errors.city}</span>
                )}
              </div>

            </div>

            {/* Right Column */}
            <div className="profile-form-column">

              {/* Last Name */}
              <div className={`form-group ${errors.lastName && touched.lastName ? 'form-group--error' : ''}`}>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  placeholder="Last Name *"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                />
                {errors.lastName && touched.lastName && (
                  <span className="form-error">{errors.lastName}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className={`form-group ${errors.phone && touched.phone ? 'form-group--error' : ''}`}>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="Phone Number *"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                />
                {errors.phone && touched.phone && (
                  <span className="form-error">{errors.phone}</span>
                )}
              </div>

              {/* Conditional Candidate Fields */}
              {role === 'candidate' && (
                <>
                  {/* NIC */}
                  <div className={`form-group ${errors.nic && touched.nic ? 'form-group--error' : ''}`}>
                    <label className="form-label">NIC Number *</label>
                    <input
                      type="text"
                      name="nic"
                      className="form-input"
                      placeholder="e.g., 200012345678 or 123456789V"
                      value={profileData.nic}
                      onChange={handleProfileChange}
                      onBlur={handleProfileBlur}
                    />
                    {errors.nic && touched.nic && (
                      <span className="form-error">{errors.nic}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Resume</label>
                    <div className="resume-dropzone">
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
                        <input type="file" onChange={handleFileUpload} accept=".jpeg,.jpg,.png,.doc,.docx,.pdf" style={{ display: 'none' }} />
                      </label>

                      {uploadedFileName && (
                        <div className="uploaded-file-tag">
                          <Check size={14} /> {uploadedFileName}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Conditional Employer Fields */}
              {role === 'employer' && (
                <>
                  {/* Organization Name */}
                  <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input
                      type="text"
                      name="organizationName"
                      className="form-input"
                      placeholder="Organization Name"
                      value={profileData.organizationName}
                      onChange={handleProfileChange}
                    />
                  </div>

                  {/* Company BR */}
                  <div className="form-group">
                    <label className="form-label">Company BR</label>
                    <div className="company-br-upload-wrap">
                      <label className="dropzone-upload-btn">
                        <Upload size={16} />
                        Upload File
                        <input type="file" onChange={handleFileUpload} accept=".jpeg,.jpg,.png,.pdf" style={{ display: 'none' }} />
                      </label>
                      {uploadedFileName && (
                        <div className="uploaded-file-tag">
                          <Check size={14} /> {uploadedFileName}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>

          </div>

          {/* Bottom Agreement and Submit */}
          <div className="profile-register-bottom">
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={() => setAgreedTerms(!agreedTerms)}
              />
              <span className="custom-checkbox-box"></span>
              <span className="checkbox-text">
                By clicking checkbox, you agree to our <Link to="#">Terms and Conditions</Link> and <Link to="#">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="final-signup-btn" disabled={isLoading}>
              {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </div>

        </form>

      </div>
    </section>
  );
}
