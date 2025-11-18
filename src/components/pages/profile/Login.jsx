import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthMessages } from "../../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { BiEnvelope, BiLock } from "react-icons/bi";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success, user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
    return () => dispatch(clearAuthMessages());
  }, [user, navigate, dispatch]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="card-header">
            <img src="/images/signlink.jpg" alt="SignLink Logo" className="login-logo" />
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={onSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-icon">
                  <BiEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="form-input"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-icon">
                  <BiLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="form-input password-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="form-helper">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="signup-section">
            <p className="signup-text">
              Don't have an account?{" "}
              <span
                className="signup-link"
                onClick={() => navigate("/register")}
              >
                Create account
              </span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .login-background {
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

        .login-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          width: 180px;
          height: auto;
          margin-bottom: 20px;
          border-radius: 8px;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          color: #718096;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
        }

        .login-form {
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

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #a0aec0;
          z-index: 2;
          font-size: 18px;
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
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
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
          font-size: 18px;
        }

        .password-toggle:hover {
          color: #667eea;
          background: #f7fafc;
        }

        .form-helper {
          margin-top: 8px;
          text-align: right;
        }

        .forgot-link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .forgot-link:hover {
          color: #5a67d8;
          text-decoration: underline;
        }

        .login-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        .login-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .login-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-button.loading {
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

        .signup-section {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .signup-text {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .signup-link {
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
          text-decoration: none;
        }

        .signup-link:hover {
          color: #5a67d8;
          text-decoration: underline;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .login-container {
            padding: 16px;
            align-items: flex-start;
            background: white;
          }

          .login-background {
            display: none;
          }

          .login-card {
            padding: 30px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
          }

          .login-card::before {
            height: 3px;
          }

          .login-logo {
            width: 150px;
            margin-bottom: 16px;
          }

          .login-title {
            font-size: 24px;
          }

          .form-input {
            padding: 16px 16px 16px 48px;
            font-size: 16px;
          }

          .login-button {
            padding: 18px;
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px 20px;
          }

          .card-header {
            margin-bottom: 24px;
          }

          .login-logo {
            width: 140px;
          }
        }

        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .login-card,
          .form-input,
          .login-button,
          .password-toggle {
            transition: none;
          }

          .login-button::before {
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

export default Login;