import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeSlash, ArrowLeft } from "react-bootstrap-icons";

const ResetPassword = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(
                `${API_URL}/api/auth/reset-password/${token}`,
                {
                    newPassword: formData.password,
                }
            );

            toast.success("Password reset successfully! You can now login with your new password.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid or expired reset link");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="reset-password-container">
            <div className="reset-background">
                <div className="bg-shape shape-1"></div>
                <div className="bg-shape shape-2"></div>
                <div className="bg-shape shape-3"></div>
            </div>

            <div className="reset-content">
                <div className="reset-card">
                    <div className="card-header">
                        <img
                            src="/images/signlink.jpg"
                            alt="SignLink Logo"
                            className="reset-logo"
                        />
                        <h1 className="reset-title">Reset Password</h1>
                        <p className="reset-subtitle">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="reset-form">
                        {/* New Password Field */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                New Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="form-input password-input"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="form-helper">
                                Password must be at least 6 characters long
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm New Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="form-input password-input"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <div className="error-message">
                                    Passwords don't match
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`reset-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading || formData.password !== formData.confirmPassword}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Updating Password...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>

                    {/* Additional Help */}
                    <div className="help-section">
                        <p className="help-text">
                            Having trouble?{" "}
                            <Link to="/forgot-password" className="help-link">
                                Request a new reset link
                            </Link>
                        </p>
                    </div>

                    {/* Back to Login */}
                    <div className="back-section">
                        <Link to="/login" className="back-link">
                            <ArrowLeft size={16} className="me-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .reset-password-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }

                .reset-background {
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

                .reset-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 440px;
                }

                .reset-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                }

                .reset-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .reset-logo {
                    width: 180px;
                    height: auto;
                    margin-bottom: 20px;
                    border-radius: 8px;
                }

                .reset-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 0 0 8px 0;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .reset-subtitle {
                    color: #718096;
                    font-size: 16px;
                    margin: 0;
                    font-weight: 500;
                }

                .reset-form {
                    margin-bottom: 24px;
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

                .password-wrapper {
                    position: relative;
                }

                .form-input {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background: #fafafa;
                    font-family: inherit;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #28a745;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.1);
                    transform: translateY(-2px);
                }

                .form-input::placeholder {
                    color: #a0aec0;
                }

                .password-input {
                    padding-right: 50px;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #a0aec0;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .password-toggle:hover {
                    color: #28a745;
                    background: #f7fafc;
                }

                .form-helper {
                    font-size: 12px;
                    color: #718096;
                    margin-top: 8px;
                }

                .error-message {
                    font-size: 12px;
                    color: #dc3545;
                    margin-top: 8px;
                    font-weight: 500;
                }

                .reset-button {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

                .reset-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }

                .reset-button:hover:not(:disabled)::before {
                    left: 100%;
                }

                .reset-button:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(40, 167, 69, 0.4);
                }

                .reset-button:active:not(:disabled) {
                    transform: translateY(-1px);
                }

                .reset-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .reset-button.loading {
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

                .help-section {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .help-text {
                    color: #718096;
                    font-size: 14px;
                    margin: 0;
                }

                .help-link {
                    color: #28a745;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .help-link:hover {
                    color: #218838;
                    text-decoration: underline;
                }

                .back-section {
                    text-align: center;
                }

                .back-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 14px;
                    transition: color 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                }

                .back-link:hover {
                    color: #5a67d8;
                    text-decoration: underline;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .reset-password-container {
                        padding: 16px;
                        align-items: flex-start;
                        background: white;
                    }

                    .reset-background {
                        display: none;
                    }

                    .reset-card {
                        padding: 30px 24px;
                        border-radius: 16px;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                        margin: 20px 0;
                    }

                    .reset-card::before {
                        height: 3px;
                    }

                    .reset-logo {
                        width: 150px;
                        margin-bottom: 16px;
                    }

                    .reset-title {
                        font-size: 24px;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
                        padding: 16px;
                        font-size: 16px;
                    }

                    .reset-button {
                        padding: 18px;
                        font-size: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .reset-card {
                        padding: 24px 20px;
                    }

                    .card-header {
                        margin-bottom: 24px;
                    text-align: center;
                    display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .reset-logo {
                        width: 140px;
                    }

                    .reset-title {
                        font-size: 22px;
                        text-align: center;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
                    .reset-card,
                    .form-input,
                    .reset-button,
                    .password-toggle {
                        transition: none;
                    }

                    .reset-button::before {
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

export default ResetPassword;