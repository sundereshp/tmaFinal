import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import Logo from "../../source/assets/images/Final.png";
import './Login.css';
import md5 from 'md5';
import { useInvitation } from '../../hooks/useInvitation';
import { useEffect } from 'react';
import { toast } from 'sonner';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { checkInvitation } = useInvitation();

    // Check for invitation token on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('token')) {
            // Just show a message that they should log in first
            toast.info('Please log in to accept the invitation');
        }
    }, []);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        try {
            const response = await fetch("https://vw.aisrv.in/new_backend/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password: md5(password)
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Login failed');
            }
    
            const data = await response.json();
            console.log('Login API Response:', data); // Debug log
            localStorage.setItem('token', data.token);
            
            // After successful login, check for invitation
            const hasPendingInvitation = await checkInvitation(true);
            
            if (!hasPendingInvitation) {
                // If no invitation or already processed, navigate to dashboard
                navigate('/dashboard');
            }
            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard'); // Changed from '/' to '/dashboard'
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred during login');
        }
    };


    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <div className="login-root">
            <ParticleBackground />

            <div className="login-center">


                <div className="login-card">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="login-logo"
                    />
                    <div className="login-header">
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">
                            Login to your account to continue
                        </p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-form-group">
                            <label className="login-label" htmlFor="email">
                                Email Address
                            </label>
                            <div className="login-input-wrapper">
                                <span className="login-icon">
                                    <Mail size={16} color="#a3a3a3" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="login-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label" htmlFor="password">
                                Password
                            </label>
                            <div className="login-input-wrapper">
                                <span className="login-icon">
                                    <Lock size={16} color="#a3a3a3" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="login-input"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="login-forgot"
                        >
                            Forgot your password?
                        </button>
                        <div className="login-signup">
                            Don't have an account?{' '}
                            <Link to="/signup" className="login-signup-link">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
