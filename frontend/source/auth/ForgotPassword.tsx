import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ParticleBackground from "./ParticleBackground";
import "./ForgotPassword.css";
import md5 from 'md5';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Refs for OTP inputs
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const renderOtpInputs = () => (
    <div className="forgot-form-group">
      <label className="forgot-label">Enter 4-digit verification code</label>
      <div className="otp-container">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={otpRefs[index]}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={handleOtpPaste}
            className={`otp-input ${error ? 'error' : ''}`}
            disabled={loading}
            aria-label={`Digit ${index + 1} of OTP`}
            aria-invalid={!!error}
            aria-describedby={error ? 'otp-error' : undefined}
          />
        ))}
      </div>
      {error && (
        <div id="otp-error" className="error-message" style={{ marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  );

  const renderResendButton = () => (
    <div className="forgot-footer" style={{ marginTop: '5px' }}>
      <span style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>
        Didn't receive code?{' '}
      </span>
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={countdown > 0 || loading}
        className="resend-button"
        aria-label={countdown > 0 ? `Resend OTP in ${countdown} seconds` : 'Resend OTP'}
      >
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
      </button>
    </div>
  );

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch('http://vw.aisrv.in/new_backend/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess("OTP sent to your email successfully!");
      setStep("otp");
      setCountdown(60); // 60 seconds countdown

      // Focus first OTP input
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    } else if (value && index === 3) {
      // Auto-submit when last digit is entered
      const otpString = newOtp.join('');
      if (otpString.length === 4) {
        document.getElementById('verify-otp-btn')?.click();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (/^\d{4}$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 4);
      setOtp(newOtp);
      // Auto-submit after pasting valid OTP
      setTimeout(() => {
        document.getElementById('verify-otp-btn')?.click();
      }, 100);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');

    
    if (otpString.length !== 4) {
      setError("Please enter complete 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch('http://vw.aisrv.in/new_backend/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setResetToken(data.resetToken);
      setSuccess("OTP verified successfully!");
      setStep("password");

    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      // Clear OTP on error
      setOtp(["", "", "", ""]);
      otpRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Hash the new password with MD5
    const hashedPassword = md5(newPassword);

    try {
      setLoading(true);
      setError("");

      const response = await fetch('http://vw.aisrv.in/new_backend/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          resetToken, 
          newPassword: hashedPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successfully! Please login with your new password.' } 
        });
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    try {
      setLoading(true);
      setError("");
      setOtp(["", "", "", ""]);

      const response = await fetch('http://vw.aisrv.in/new_backend/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccess("New OTP sent to your email!");
      setCountdown(60);
      otpRefs[0].current?.focus();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-root">
      <ParticleBackground />
      <div className="forgot-center">
        <div className="forgot-card">
          {step === "email" && (
            <>
              <div className="forgot-header">
                <h1 className="forgot-title">Forgot Password</h1>
                <p className="forgot-desc">Enter your email to receive a 4-digit OTP</p>
              </div>
              <div className="forgot-content">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSendOtp}>
                  <div className="forgot-form-group">
                    <label className="forgot-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="forgot-input"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="forgot-button"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
                <div className="forgot-footer">
                  <Link to="/login" className="forgot-link">
                    ← Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="forgot-header">
                <h1 className="forgot-title">Verify OTP</h1>
                <p className="forgot-desc">
                  Enter the 4-digit code sent to <strong>{email}</strong>
                </p>
              </div>
              <div className="forgot-content">
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleVerifyOtp} style={{ width: '100%' }}>
                  {renderOtpInputs()}
                  <button 
                    id="verify-otp-btn"
                    type="submit" 
                    className="forgot-button"
                    disabled={loading || otp.some(digit => !digit)}
                    style={{ marginTop: '20px' }}
                  >
                    {loading ? "Verifying..." : "Continue"}
                  </button>
                </form>
                {renderResendButton()}
                <div className="forgot-footer" style={{ marginTop: '20px' }}>
                  <button 
                    type="button" 
                    className="forgot-link"
                    onClick={() => {
                      setStep("email");
                      setOtp(["", "", "", ""]);
                      setError("");
                      setSuccess("");
                    }}
                    disabled={loading}
                    style={{ fontSize: '0.9rem' }}
                  >
                    ← Back to Email
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              <div className="forgot-header">
                <h1 className="forgot-title">Reset Password</h1>
                <p className="forgot-desc">Enter your new password</p>
              </div>
              <div className="forgot-content">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleResetPassword}>
                  <div className="forgot-form-group">
                    <label className="forgot-label">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="forgot-input"
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>
                  <div className="forgot-form-group">
                    <label className="forgot-label">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="forgot-input"
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="forgot-button"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}