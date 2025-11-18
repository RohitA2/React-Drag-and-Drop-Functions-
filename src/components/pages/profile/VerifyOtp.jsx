import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [email, setEmail] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from location state or redirect
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      toast.error("No email found. Please sign up again.");
      navigate("/register");
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [location, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedOtp = pastedData.slice(0, 4).split("");

    if (pastedOtp.every(char => /^\d?$/.test(char))) {
      const newOtp = [...otp];
      pastedOtp.forEach((char, index) => {
        if (index < 4) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);

      // Focus the last filled input or the last one
      const lastFilledIndex = pastedOtp.findIndex(char => !char) - 1;
      const focusIndex = lastFilledIndex >= 0 ? lastFilledIndex : Math.min(pastedOtp.length - 1, 3);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp: otpString
      });

      if (res.status === 200) {
        toast.success("Email verified successfully!");
        navigate("/login", { 
          state: { message: "Your account has been verified. Please login." }
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const message = error?.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(message);
      
      // Clear OTP on error
      setOtp(["", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email
      });

      toast.success("New OTP sent to your email!");
      setCountdown(30);
      setOtp(["", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      const message = error?.response?.data?.message || "Failed to resend OTP. Please try again.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.join("").length === 4;

  return (
    <div className="verify-otp-container">
      <div className="verify-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="verify-content">
        <div className="verify-card">
          <div className="card-header">
            <img src="/images/signlink.jpg" alt="SignLink Logo" className="verify-logo" />
            <h1 className="verify-title">Verify Your Email</h1>
            <p className="verify-subtitle">
              We've sent a 4-digit code to your email
            </p>
            <p className="email-display">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="verify-form">
            <div className="otp-container">
              <label className="otp-label">Enter verification code</label>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="otp-input"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={`verify-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !isOtpComplete}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="resend-section">
            <p className="resend-text">
              Didn't receive the code?{" "}
              <button
                type="button"
                className={`resend-button ${countdown > 0 ? 'disabled' : ''}`}
                onClick={handleResendOtp}
                disabled={isResending || countdown > 0}
              >
                {isResending ? (
                  "Sending..."
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend OTP"
                )}
              </button>
            </p>
          </div>

          <div className="help-section">
            <div className="help-box">
              <strong>Having trouble?</strong>
              <ul className="help-list">
                <li>Check your spam folder</li>
                <li>Make sure you entered the correct email</li>
                <li>The code expires in 15 minutes</li>
              </ul>
            </div>
          </div>

          <div className="back-section">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/register")}
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .verify-otp-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .verify-background {
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

        .verify-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
        }

        .verify-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .verify-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .verify-logo {
          width: 180px;
          height: auto;
          margin-bottom: 20px;
          border-radius: 8px;
        }

        .verify-title {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .verify-subtitle {
          color: #718096;
          font-size: 16px;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .email-display {
          color: #667eea;
          font-weight: 600;
          font-size: 14px;
          margin: 0;
          word-break: break-all;
        }

        .verify-form {
          margin-bottom: 24px;
        }

        .otp-container {
          margin-bottom: 32px;
        }

        .otp-label {
          display: block;
          margin-bottom: 16px;
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
          text-align: center;
        }

        .otp-inputs {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .otp-input {
          width: 60px;
          height: 70px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          background: #fafafa;
          transition: all 0.3s ease;
          outline: none;
        }

        .otp-input:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
          transform: translateY(-2px);
        }

        .otp-input:not(:placeholder-shown) {
          border-color: #f59e0b;
          background: white;
        }

        .verify-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

        .verify-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .verify-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .verify-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
        }

        .verify-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .verify-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .verify-button.loading {
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

        .resend-section {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .resend-text {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .resend-button {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 0;
          font-size: 14px;
        }

        .resend-button:hover:not(.disabled):not(:disabled) {
          color: #5a67d8;
          text-decoration: underline;
        }

        .resend-button.disabled,
        .resend-button:disabled {
          color: #a0aec0;
          cursor: not-allowed;
          text-decoration: none;
        }

        .help-section {
          margin-bottom: 24px;
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
          font-size: 14px;
        }

        .help-list {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
          padding-left: 16px;
          line-height: 1.5;
        }

        .help-list li {
          margin-bottom: 6px;
        }

        .back-section {
          text-align: center;
        }

        .back-button {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.3s ease;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .back-button:hover {
          color: #5a67d8;
          background: #f7fafc;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .verify-otp-container {
            padding: 16px;
            align-items: flex-start;
            background: white;
          }

          .verify-background {
            display: none;
          }

          .verify-card {
            padding: 30px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
          }

          .verify-card::before {
            height: 3px;
          }

          .verify-logo {
            width: 150px;
            margin-bottom: 16px;
          }

          .verify-title {
            font-size: 24px;
          }

          .otp-inputs {
            gap: 12px;
          }

          .otp-input {
            width: 55px;
            height: 65px;
            font-size: 24px;
          }

          .verify-button {
            padding: 18px;
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .verify-card {
            padding: 24px 20px;
          }

          .card-header {
            margin-bottom: 24px;
          }

          .verify-logo {
            width: 140px;
          }

          .otp-inputs {
            gap: 8px;
          }

          .otp-input {
            width: 50px;
            height: 60px;
            font-size: 22px;
          }
        }

        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .verify-card,
          .otp-input,
          .verify-button,
          .resend-button,
          .back-button {
            transition: none;
          }

          .verify-button::before {
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

export default VerifyOtp;