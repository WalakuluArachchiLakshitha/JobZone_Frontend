import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import loginBgWoman from '../assets/login_bg_woman.png';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.values(newErrors).some((err) => err)) return;

    setIsLoading(true);
    setApiError('');
    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.message);
    }
  };

  // ── Google Sign-In ──────────────────────────────────────────────────
  const googleBtnRef = useRef(null);
  const gsiInitialized = useRef(false);

  const handleGoogleResponse = useCallback(async (response) => {
    if (response.credential) {
      setIsLoading(true);
      setApiError('');
      const result = await googleLogin(response.credential);
      setIsLoading(false);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setApiError(result.message);
      }
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    const initGoogleSignIn = () => {
      if (gsiInitialized.current) return;
      if (!window.google?.accounts?.id) return;
      if (!googleBtnRef.current) return;

      gsiInitialized.current = true;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleResponse,
      });

      // Render Google's own button inside a hidden container
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 400,
      });
    };

    if (window.google?.accounts?.id) {
      initGoogleSignIn();
    } else {
      window.handleGoogleScriptLoad = initGoogleSignIn;
    }

    return () => {
      gsiInitialized.current = false;
    };
  }, [handleGoogleResponse]);

  const handleGoogleClick = () => {
    // Click the hidden Google-rendered button to trigger the popup
    const hiddenBtn = googleBtnRef.current?.querySelector('[role="button"]');
    if (hiddenBtn) {
      hiddenBtn.click();
    } else {
      setApiError('Google Sign-In is not available. Please try again later.');
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">

        {/* Left Side: Form */}
        <div className="login-pane login-pane--form">
          <div className="login-form-wrapper">

            {/* Header */}
            <div className="login-header">
              <h1 className="login-title">Welcome Back 👋</h1>
              <p className="login-subtitle">
                Today is a new opportunity. It's your career journey. You shape it. Sign in to discover jobs.
              </p>
            </div>

            {/* Form */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {apiError && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#ffebe9', color: '#ea3829', border: '1px solid #ffc8c3', borderRadius: '6px', textAlign: 'center', fontSize: '0.875rem' }}>
                  {apiError}
                </div>
              )}

              {/* Email */}
              <div className={`form-group ${errors.email && touched.email ? 'form-group--error' : ''}`}>
                <label htmlFor="login-email" className="form-label">Email</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                />
                {errors.email && touched.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className={`form-group ${errors.password && touched.password ? 'form-group--error' : ''}`}>
                <label htmlFor="login-password" className="form-label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="at least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                />
                {errors.password && touched.password && (
                  <span className="form-error">{errors.password}</span>
                )}

                {/* Forgot Password */}
                <div className="forgot-password-link-container">
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span className="login-divider-line"></span>
              <span className="login-divider-text">Or</span>
              <span className="login-divider-line"></span>
            </div>

            {/* Google Login */}
            {/* Hidden Google-rendered button (for OAuth popup) */}
            <div ref={googleBtnRef} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }} />
            <button className="google-btn" type="button" onClick={handleGoogleClick}>
              <FcGoogle size={20} className="google-icon" />
              <span className="google-btn-text">Log in with Google</span>
            </button>

            {/* Footer Sign Up Link */}
            <p className="signup-prompt">
              Don't you have an account? <Link to="/register" className="signup-link">Register</Link>
            </p>
          </div>

          {/* Copy Right Footer */}
          <footer className="login-footer">
            © 2026 ALL RIGHTS RESERVED
          </footer>
        </div>

        {/* Right Side: Image with Logo Overlay */}
        <div className="login-pane login-pane--image" style={{ backgroundImage: `url(${loginBgWoman})` }}>
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
