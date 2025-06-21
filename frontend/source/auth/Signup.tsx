import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ParticleBackground from "./ParticleBackground";
import "./Signup.css";
import Logo from "../../source/assets/images/Final.png";
import md5 from 'md5';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const navigate = useNavigate();

  // Dummy toast implementation (replace with your own if needed)
  const toast = ({ title, description }: { title: string, description: string }) => {
    alert(`${title}: ${description}`);
  };

  const checkEmailAvailability = async (email: string) => {
    if (!email) {
      setEmailError(null);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch(`http://vw.aisrv.in/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.exists) {
        setEmailError('This email is already registered');
      } else {
        setEmailError(null);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // Don't show error to user, just log it
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Update the handleChange function to check email on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // When email changes, check its availability
      if (name === 'email') {
        checkEmailAvailability(value);
      }
      return newData;
    });
  };

  // In frontend/source/auth/Signup.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailError) {
      toast({ title: "Error", description: "Please fix the email error before submitting" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters" });
      return;
    }

    try {
      setLoading(true);

      // Hash the password with MD5
      const hashedPassword = md5(formData.password);

      const response = await fetch("http://vw.aisrv.in/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: hashedPassword,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Show success toast
      toast({
        title: "Success!",
        description: "Your account has been created successfully!"
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="signup-root">
      <ParticleBackground />
      <div className="signup-center">
        <div className="signup-card">
          <img
            src={Logo}
            alt="Logo"
            className="signup-logo"
          />
          <div className="signup-header">
            <h1 className="signup-title">Create an account</h1>
            <p className="signup-subtitle">Enter your details to create a new account</p>
          </div>
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-form-group">
              <label className="signup-label" htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="signup-input"
              />
            </div>

            <div className="signup-form-group">
              <label className="signup-label" htmlFor="email">
                Email
                {isCheckingEmail && <span className="checking-email">Checking...</span>}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={() => checkEmailAvailability(formData.email)}
                placeholder="email@example.com"
                className={`signup-input ${emailError ? 'input-error' : ''}`}
              />
              {emailError && <div className="error-message">{emailError}</div>}
            </div>

            <div className="signup-form-group">
              <label className="signup-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="signup-input"
              />
            </div>

            <div className="signup-form-group">
              <label className="signup-label" htmlFor="confirmPassword">
                Confirm Password
                {formData.confirmPassword && (
                  <span className={`validation-icon ${formData.password === formData.confirmPassword ? 'valid' : 'invalid'}`}>
                    {formData.password === formData.confirmPassword ? '✓' : '✗'}
                  </span>
                )}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="signup-input"
              />
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="signup-footer">
            Already have an account?{" "}
            <Link to="/login" className="signup-link">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
