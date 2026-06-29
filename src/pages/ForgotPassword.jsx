import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import './ForgotPassword.css';

const STEPS = {
  EMAIL: 'email',
  OTP: 'otp',
  NEW_PASSWORD: 'new-password',
  SUCCESS: 'success',
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Step 1: Send OTP ──────────────────────────────────────────────────

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setApiError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authApi.forgotPassword(email);
      if (response.success) {
        setStep(STEPS.OTP);
      }
    } catch (error) {
      setApiError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      const lastInput = document.getElementById('otp-input-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setApiError('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authApi.verifyOtp(email, otpString);
      if (response.success) {
        setResetToken(response.resetToken);
        setStep(STEPS.NEW_PASSWORD);
      }
    } catch (error) {
      setApiError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setApiError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setApiError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authApi.resetPassword(resetToken, newPassword);
      if (response.success) {
        setStep(STEPS.SUCCESS);
      }
    } catch (error) {
      setApiError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────

  const handleResendOtp = async () => {
    setIsLoading(true);
    setApiError('');
    setOtp(['', '', '', '', '', '']);

    try {
      await authApi.forgotPassword(email);
      setApiError(''); // Clear any previous error
    } catch (error) {
      setApiError(error.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="fp-section">
      <div className="fp-container">
        {/* Left Side: Form */}
        <div className="fp-pane fp-pane--form">
          <div className="fp-form-wrapper">

            {/* ── STEP: EMAIL ─────────────────────────────── */}
            {step === STEPS.EMAIL && (
              <>
                <div className="fp-header">
                  <div className="fp-icon-circle">
                    <Mail size={28} />
                  </div>
                  <h1 className="fp-title">Forgot Password?</h1>
                  <p className="fp-subtitle">
                    No worries! Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                </div>

                <form className="fp-form" onSubmit={handleSendOtp} noValidate>
                  {apiError && <div className="fp-error-banner">{apiError}</div>}

                  <div className="fp-field">
                    <label htmlFor="fp-email" className="fp-label">Email Address</label>
                    <input
                      id="fp-email"
                      type="email"
                      className="fp-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <button type="submit" className="fp-btn fp-btn--primary" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 size={18} className="fp-spinner" /> Sending...</>
                    ) : (
                      'Send OTP Code'
                    )}
                  </button>
                </form>

                <Link to="/login" className="fp-back-link">
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              </>
            )}

            {/* ── STEP: OTP ───────────────────────────────── */}
            {step === STEPS.OTP && (
              <>
                <div className="fp-header">
                  <div className="fp-icon-circle fp-icon-circle--otp">
                    <KeyRound size={28} />
                  </div>
                  <h1 className="fp-title">Enter Verification Code</h1>
                  <p className="fp-subtitle">
                    We've sent a 6-digit code to <strong>{email}</strong>. Check your inbox (and spam folder).
                  </p>
                </div>

                <form className="fp-form" onSubmit={handleVerifyOtp} noValidate>
                  {apiError && <div className="fp-error-banner">{apiError}</div>}

                  <div className="fp-otp-row" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="fp-otp-input"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <button type="submit" className="fp-btn fp-btn--primary" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 size={18} className="fp-spinner" /> Verifying...</>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </form>

                <p className="fp-resend-text">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    className="fp-resend-btn"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </p>

                <button type="button" className="fp-back-link" onClick={() => setStep(STEPS.EMAIL)}>
                  <ArrowLeft size={16} />
                  Change email
                </button>
              </>
            )}

            {/* ── STEP: NEW PASSWORD ──────────────────────── */}
            {step === STEPS.NEW_PASSWORD && (
              <>
                <div className="fp-header">
                  <div className="fp-icon-circle fp-icon-circle--lock">
                    <Lock size={28} />
                  </div>
                  <h1 className="fp-title">Set New Password</h1>
                  <p className="fp-subtitle">
                    Create a strong password that you don't use on other websites.
                  </p>
                </div>

                <form className="fp-form" onSubmit={handleResetPassword} noValidate>
                  {apiError && <div className="fp-error-banner">{apiError}</div>}

                  <div className="fp-field">
                    <label htmlFor="fp-new-password" className="fp-label">New Password</label>
                    <input
                      id="fp-new-password"
                      type="password"
                      className="fp-input"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      autoFocus
                    />
                  </div>

                  <div className="fp-field">
                    <label htmlFor="fp-confirm-password" className="fp-label">Confirm Password</label>
                    <input
                      id="fp-confirm-password"
                      type="password"
                      className="fp-input"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>

                  <button type="submit" className="fp-btn fp-btn--primary" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 size={18} className="fp-spinner" /> Resetting...</>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP: SUCCESS ───────────────────────────── */}
            {step === STEPS.SUCCESS && (
              <div className="fp-success-wrapper">
                <div className="fp-success-icon-circle">
                  <CheckCircle2 size={48} />
                </div>
                <h1 className="fp-title">Password Reset!</h1>
                <p className="fp-subtitle">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <button
                  className="fp-btn fp-btn--primary"
                  onClick={() => navigate('/login')}
                >
                  Back to Sign In
                </button>
              </div>
            )}

          </div>

          <footer className="fp-footer">
            © 2026 ALL RIGHTS RESERVED
          </footer>
        </div>

        {/* Right Side: Decorative panel */}
        <div className="fp-pane fp-pane--deco">
          <div className="fp-deco-content">
            <Link to="/" className="fp-logo-link">
              <span className="fp-logo-job">JOB</span>
              <span className="fp-logo-zone">ZONE</span>
            </Link>
            <p className="fp-deco-tagline">Your Career Journey Starts Here</p>
          </div>
        </div>

      </div>
    </section>
  );
}
