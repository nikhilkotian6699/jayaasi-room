'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authStep,
    setAuthStep,
    initiatePhoneLogin,
    initiateEmailLogin,
    completeVerification,
    pendingPhone,
    pendingEmail,
  } = useApp();

  const [phoneInput, setPhoneInput] = useState('98765 43210');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    initiatePhoneLogin(`+91 ${phoneInput.trim()}`);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    initiateEmailLogin(emailInput.trim());
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      completeVerification();
    }, 900);
  };

  return (
    <div className="auth-backdrop" onClick={closeAuthModal}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Top-left Brand Badge */}
        <div className="auth-brand-ribbon">
          <div className="auth-brand-logo-text">
            <span className="auth-brand-j">J</span>AYAASI<span className="auth-brand-dot">.COM</span>
          </div>
          <div className="auth-brand-tagline">WE ARE FOR HOSPITALITY</div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          className="auth-close-btn"
          onClick={closeAuthModal}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Character Illustration */}
        <div className="auth-hero-illustration-wrap">
          <img
            src="/images/guest login/login_hero_character.png"
            alt="Jayaasi Hospitality Concierge"
            className="auth-hero-character-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Modal Body depending on step */}
        <div className="auth-body-content">
          {authStep === 'phone' && (
            <>
              <h2 id="auth-modal-title" className="auth-heading">
                Let’s Get Started!
              </h2>
              <p className="auth-subheading">
                Enter your phone number to continue
              </p>

              <form onSubmit={handlePhoneSubmit}>
                {/* Phone Input Box matching screenshot */}
                <div className="auth-input-pill">
                  <div className="auth-phone-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#870f2b">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                  </div>

                  <div className="auth-phone-country">
                    <span className="auth-flag">🇮🇳</span>
                    <span className="auth-country-code">+91</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  <div className="auth-input-sep" />

                  <input
                    type="tel"
                    className="auth-text-field"
                    placeholder="Enter your phone number"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {/* Continue button */}
                <button type="submit" className="auth-primary-btn">
                  <span>Continue</span>
                  <div className="auth-btn-arrow-circle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#870f2b" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              </form>

              {/* Email login button */}
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => setAuthStep('email')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#870f2b" style={{ marginRight: '8px' }}>
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span>Login with Email</span>
              </button>
            </>
          )}

          {authStep === 'email' && (
            <>
              <h2 id="auth-modal-title" className="auth-heading">
                Login with Email
              </h2>
              <p className="auth-subheading">
                Enter your email address to verify your booking
              </p>

              <form onSubmit={handleEmailSubmit}>
                <div className="auth-input-pill">
                  <div className="auth-phone-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#870f2b">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>

                  <input
                    type="email"
                    className="auth-text-field"
                    placeholder="Enter your email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <button type="submit" className="auth-primary-btn">
                  <span>Continue</span>
                  <div className="auth-btn-arrow-circle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#870f2b" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              </form>

              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => setAuthStep('phone')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#870f2b" style={{ marginRight: '8px' }}>
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span>Login with Phone Number</span>
              </button>
            </>
          )}

          {authStep === 'verification' && (
            <>
              <h2 id="auth-modal-title" className="auth-heading">
                Verify Your Account
              </h2>
              <p className="auth-subheading">
                Verifying via secure missed call to <strong>{pendingPhone || pendingEmail || '+91 98765 43210'}</strong>
              </p>

              <div className="auth-verification-box">
                <div className="auth-calling-animation">
                  <div className="auth-ring-pulse" />
                  <div className="auth-phone-active-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                  </div>
                </div>
                <div className="auth-calling-text">
                  <span>Verify via Missed Call</span>
                  <small>No need to answer, verification happens automatically</small>
                </div>
              </div>

              <div className="auth-otp-row">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    maxLength={1}
                    className="auth-otp-box"
                    value={otpInput[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    placeholder="•"
                  />
                ))}
              </div>

              <button
                type="button"
                className="auth-primary-btn"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                <span>{isVerifying ? 'Verifying...' : 'Verify & Continue'}</span>
                <div className="auth-btn-arrow-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#870f2b" strokeWidth="3">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                className="auth-back-link"
                onClick={() => setAuthStep('phone')}
              >
                Change Phone Number
              </button>
            </>
          )}

          {authStep === 'success' && (
            <div className="auth-success-box">
              <div className="auth-success-check-badge">✓</div>
              <h2 className="auth-heading">Verified Successfully!</h2>
              <p className="auth-subheading">
                Welcome to Business Suite (Room 204). Returning to your service...
              </p>
            </div>
          )}

          {/* Trust Badges matching screenshot */}
          <div className="auth-trust-row">
            <div className="auth-trust-item">
              <div className="auth-trust-icon auth-trust-shield">🛡️</div>
              <div className="auth-trust-label">Secure & Safe</div>
            </div>

            <div className="auth-trust-divider" />

            <div className="auth-trust-item">
              <div className="auth-trust-icon auth-trust-bolt">⚡</div>
              <div className="auth-trust-label">Quick Access</div>
            </div>

            <div className="auth-trust-divider" />

            <div className="auth-trust-item">
              <div className="auth-trust-icon auth-trust-smile">😊</div>
              <div className="auth-trust-label">No Spam Guaranteed</div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="auth-terms-note">
            By clicking you agree to <span className="auth-terms-link">Terms and Conditions</span>
          </p>
        </div>

        {/* Bottom decorative wave */}
        <div className="auth-bottom-wave-wrap">
          <img
            src="/images/guest login/login_bottom_wave.png"
            alt=""
            className="auth-bottom-wave-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
}
