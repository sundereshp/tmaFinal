import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import {Logo} from '../../source/assets/images/Final.png'
import './Login.css';
import md5 from 'md5';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // Hash the password with MD5
        const hashedPassword = md5(password);
        
        try {
            const response = await fetch("http://localhost:5000/sunderesh/backend/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({ email, password: hashedPassword }),
                credentials: 'include'
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }
    
            // Redirect to homepage
            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            alert(error instanceof Error ? error.message : "Login failed");
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
