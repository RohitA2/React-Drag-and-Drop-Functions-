import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Building } from "lucide-react";

const SignUpForm = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);

      if (res.status === 200 || res.status === 201) {
        toast.success("Registration successful!");
        navigate("/verify-otp", { state: { email: formData.email } });
      } else {
        const message = res?.data?.message || "Something went wrong.";
        toast.error(`Error: ${message}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const message = error?.response?.data?.message || "Something went wrong.";
      toast.error(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="signup-content">
        <div className="signup-card">
          <div className="card-header">
            <img src="/images/signlink.jpg" alt="SignLink Logo" className="signup-logo" />
            <h1 className="signup-title">Create Your Account</h1>
            <p className="signup-subtitle">
              Join SignLink and start managing your signatures
            </p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input password-input"
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                      width="18"
                      height="18"
                    >
                      <path
                        fill="currentColor"
                        d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c5.2-11.8 8-24.8 8-38.5c0-53-43-96-96-96c-2.8 0-5.6 .1-8.4 .4c5.3 10.7 8.4 22.4 8.4 34.6c0 12.2-3.1 23.8-8.4 34.6L223.1 149.5zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 576 512"
                      width="18"
                      height="18"
                    >
                      <path
                        fill="currentColor"
                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="password-hint">
                Use 8+ characters with a mix of letters, numbers & symbols
              </p>
            </div>

            <button
              type="submit"
              className={`signup-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Company Registration Option */}
          <div className="company-option">
            <div className="company-option-content">
              <div className="company-icon">
                <Building size={20} />
              </div>
              <div className="company-text">
                <h4>Register as a Company</h4>
                <p>Create a company account with team management features</p>
              </div>
            </div>
            <Link to="/register/company" className="company-register-button">
              Register Company
            </Link>
          </div>

          <div className="login-section">
            <p className="login-text">
              Already have an account?{" "}
              <span
                className="login-link"
                onClick={() => navigate("/login")}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .signup-background {
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

        .signup-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
        }

        .signup-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .signup-card::before {
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

        .signup-logo {
          width: 180px;
          height: auto;
          margin-bottom: 20px;
          border-radius: 8px;
        }

        .signup-title {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .signup-subtitle {
          color: #718096;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
        }

        .signup-form {
          margin-bottom: 32px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
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

        .password-wrapper {
          position: relative;
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
          color: #667eea;
          background: #f7fafc;
        }

        .password-hint {
          font-size: 12px;
          color: #718096;
          margin: 8px 0 0 0;
          line-height: 1.4;
        }

        .signup-button {
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
          margin-top: 10px;
        }

        .signup-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .signup-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .signup-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .signup-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .signup-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .signup-button.loading {
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

        /* Company Registration Option */
        .company-option {
          background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin: 32px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .company-option:hover {
          border-color: #667eea;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .company-option-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .company-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
        }

        .company-text h4 {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 4px 0;
        }

        .company-text p {
          font-size: 14px;
          color: #718096;
          margin: 0;
          line-height: 1.4;
        }

        .company-register-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          text-align: center;
          display: inline-block;
        }

        .company-register-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          color: white;
          text-decoration: none;
        }

        .company-register-button:active {
          transform: translateY(0);
        }

        .login-section {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .login-text {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .login-link {
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
          text-decoration: none;
        }

        .login-link:hover {
          color: #5a67d8;
          text-decoration: underline;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: #718096;
          font-size: 14px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .divider span {
          padding: 0 16px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .signup-container {
            padding: 16px;
            align-items: flex-start;
            background: white;
          }

          .signup-background {
            display: none;
          }

          .signup-card {
            padding: 30px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
          }

          .signup-card::before {
            height: 3px;
          }

          .signup-logo {
            width: 150px;
            margin-bottom: 16px;
          }

          .signup-title {
            font-size: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .company-option {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .company-option-content {
            flex-direction: column;
            text-align: center;
          }

          .company-text h4 {
            font-size: 15px;
          }

          .company-text p {
            font-size: 13px;
          }

          .company-register-button {
            width: 100%;
          }

          .form-input {
            padding: 16px;
            font-size: 16px;
          }

          .signup-button {
            padding: 18px;
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .signup-card {
            padding: 24px 20px;
          }

          .card-header {
            margin-bottom: 24px;
          }

          .signup-logo {
            width: 140px;
          }

          .company-option {
            padding: 20px;
          }
        }

        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .signup-card,
          .form-input,
          .signup-button,
          .password-toggle,
          .company-option {
            transition: none;
          }

          .signup-button::before {
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

export default SignUpForm;