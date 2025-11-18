import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Envelope, CheckCircle } from "react-bootstrap-icons";

const ForgotPassword = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, {
                email,
            });

            toast.success("Password reset email sent! Check your inbox.");
            setIsSubmitted(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setEmail("");
        setIsSubmitted(false);
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-background">
                <div className="bg-shape shape-1"></div>
                <div className="bg-shape shape-2"></div>
                <div className="bg-shape shape-3"></div>
            </div>

            <div className="forgot-content">
                <div className="forgot-card">
                    <div className="card-header">
                        <img
                            src="/images/signlink.jpg"
                            alt="SignLink Logo"
                            className="forgot-logo"
                        />
                        
                        {!isSubmitted ? (
                            <>
                                <h1 className="forgot-title">Forgot Password?</h1>
                                <p className="forgot-subtitle">
                                    Enter your email address and we'll send you a reset link
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="success-icon">
                                    <CheckCircle size={48} className="text-success" />
                                </div>
                                <h1 className="success-title">Email Sent!</h1>
                                <p className="success-subtitle">
                                    Check your inbox for password reset instructions
                                </p>
                            </>
                        )}
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="forgot-form">
                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Envelope size={18} />
                                    </span>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-input"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-helper">
                                    We'll send a password reset link to this email
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`submit-button ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Sending Reset Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="login-section">
                                <p className="login-text">
                                    Remember your password?{" "}
                                    <Link to="/login" className="login-link">
                                        Back to Login
                                    </Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="success-content">
                            {/* Success State */}
                            <div className="success-alert">
                                <div className="alert-content">
                                    <CheckCircle size={20} className="me-2" />
                                    <div>
                                        <strong>Reset email sent to {email}</strong>
                                        <div className="alert-subtext">The link will expire in 15 minutes</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <button
                                    onClick={handleReset}
                                    className="action-button secondary"
                                >
                                    Send to Another Email
                                </button>
                                <Link
                                    to="/login"
                                    className="action-button primary"
                                >
                                    Back to Login
                                </Link>
                            </div>

                            {/* Help Text */}
                            <div className="help-box">
                                <strong>Didn't receive the email?</strong>
                                <ul className="help-list">
                                    <li>Check your spam folder</li>
                                    <li>Make sure you entered the correct email</li>
                                    <li>Wait a few minutes and try again</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .forgot-password-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }

                .forgot-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                }

                .bg-shape {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                }

                .shape-1 {
                    width: 300px;
                    height: 300px;
                    top: -100px;
                    left: -100px;
                }

                .shape-2 {
                    width: 200px;
                    height: 200px;
                    bottom: -50px;
                    right: 10%;
                }

                .shape-3 {
                    width: 150px;
                    height: 150px;
                    top: 20%;
                    right: -50px;
                }

                .forgot-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 440px;
                }

                .forgot-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                }

                .forgot-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .forgot-logo {
                    width: 180px;
                    height: auto;
                    margin-bottom: 20px;
                    border-radius: 8px;
                }

                .forgot-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 0 0 8px 0;
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .forgot-subtitle {
                    color: #718096;
                    font-size: 16px;
                    margin: 0;
                    font-weight: 500;
                }

                .success-icon {
                    margin-bottom: 16px;
                }

                .success-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #10b981;
                    margin: 0 0 8px 0;
                }

                .success-subtitle {
                    color: #718096;
                    font-size: 16px;
                    margin: 0;
                    font-weight: 500;
                }

                .forgot-form {
                    margin-bottom: 0;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #2d3748;
                    font-size: 14px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #a0aec0;
                    z-index: 2;
                }

                .form-input {
                    width: 100%;
                    padding: 16px 16px 16px 48px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background: #fafafa;
                    font-family: inherit;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #007bff;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
                    transform: translateY(-2px);
                }

                .form-input::placeholder {
                    color: #a0aec0;
                }

                .form-helper {
                    font-size: 12px;
                    color: #718096;
                    margin-top: 8px;
                }

                .submit-button {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                    overflow: hidden;
                }

                .submit-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }

                .submit-button:hover:not(:disabled)::before {
                    left: 100%;
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(0, 123, 255, 0.4);
                }

                .submit-button:active:not(:disabled) {
                    transform: translateY(-1px);
                }

                .submit-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .submit-button.loading {
                    background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .login-section {
                    text-align: center;
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }

                .login-text {
                    color: #718096;
                    font-size: 14px;
                    margin: 0;
                }

                .login-link {
                    color: #007bff;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .login-link:hover {
                    color: #0056b3;
                    text-decoration: underline;
                }

                .success-content {
                    text-align: center;
                }

                .success-alert {
                    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                    border: 1px solid #a7f3d0;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    text-align: left;
                }

                .alert-content {
                    display: flex;
                    align-items: flex-start;
                    color: #065f46;
                }

                .alert-subtext {
                    font-size: 14px;
                    color: #047857;
                    margin-top: 4px;
                }

                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .action-button {
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    text-align: center;
                    transition: all 0.3s ease;
                    border: 2px solid;
                }

                .action-button.primary {
                    background: #6b7280;
                    color: white;
                    border-color: #6b7280;
                }

                .action-button.primary:hover {
                    background: #4b5563;
                    border-color: #4b5563;
                    transform: translateY(-2px);
                    text-decoration: none;
                    color: white;
                }

                .action-button.secondary {
                    background: transparent;
                    color: #007bff;
                    border-color: #007bff;
                }

                .action-button.secondary:hover {
                    background: #007bff;
                    color: white;
                    transform: translateY(-2px);
                    text-decoration: none;
                }

                .help-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: left;
                }

                .help-box strong {
                    color: #374151;
                    display: block;
                    margin-bottom: 12px;
                }

                .help-list {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0;
                    padding-left: 16px;
                }

                .help-list li {
                    margin-bottom: 6px;
                    line-height: 1.4;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .forgot-password-container {
                        padding: 16px;
                        align-items: flex-start;
                        background: white;
                    }

                    .forgot-background {
                        display: none;
                    }

                    .forgot-card {
                        padding: 30px 24px;
                        border-radius: 16px;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                        margin: 20px 0;
                    }

                    .forgot-card::before {
                        height: 3px;
                    }

                    .forgot-logo {
                        width: 150px;
                        margin-bottom: 16px;
                    }

                    .forgot-title,
                    .success-title {
                        font-size: 24px;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        text-align: center;
                        display: block;
                        width: 100%;
                        padding: 0;
                        margin: 0 0 8px 0;
                        font-size: 24px;
                        font-weight: 700;
                        line-height: 1.2;
                    }

                    .form-input {
                        padding: 16px 16px 16px 48px;
                        font-size: 16px;
                    }

                    .submit-button {
                        padding: 18px;
                        font-size: 16px;
                    }

                    .action-buttons {
                        gap: 10px;
                    }

                    .action-button {
                        padding: 16px;
                    font-size: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .forgot-card {
                        padding: 24px 20px;
                    }

                    .card-header {
                        margin-bottom: 24px;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .forgot-logo {
                        width: 140px;
                    }

                    .forgot-title,
                    .success-title {
                        font-size: 22px;
                        text-align: center;
                        margin-bottom: 8px;
                        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        display: block;
                        width: 100%;
                        padding: 0;
                        margin: 0 0 8px 0;
                        font-size: 22px;
                        font-weight: 700;
                        line-height: 1.2;
                        text-align: center;
                    }
                }

                /* Reduced motion for accessibility */
                @media (prefers-reduced-motion: reduce) {
                    .forgot-card,
                    .form-input,
                    .submit-button,
                    .action-button {
                        transition: none;
                    }

                    .submit-button::before {
                        display: none;
                    }

                    .spinner {
                        animation-duration: 2s;
                    }
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;