import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthMessages } from "../../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { BiEnvelope, BiLock, BiCheckCircle, BiErrorCircle, } from "react-icons/bi";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
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
    <div className="d-flex align-items-center justify-content-center bg-light py-5">
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ zIndex: 0 }}
      >
        <div className="position-absolute top-0 start-0 w-50 h-50 bg-primary bg-opacity-10 rounded-circle translate-middle"></div>
        <div className="position-absolute bottom-0 end-0 w-50 h-50 bg-info bg-opacity-10 rounded-circle translate-middle"></div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <BiLock size={48} className="text-primary" />
                  <h2 className="mt-3 fw-bold text-primary">Welcome Back</h2>
                  <p className="text-muted">
                    Sign in to your account to continue
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={onSubmit} className="mt-4">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <BiEnvelope />
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        className="form-control border-start-0"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">
                      Password
                    </label>
                    <div className="input-group position-relative">
                      <span className="input-group-text bg-light border-end-0">
                        <BiLock />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        className="form-control border-start-0 pe-5"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-link text-muted position-absolute end-0 top-0 mt-2 me-2"
                        style={{ zIndex: 5 }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <div className="form-text">
                      <Link to="/forgot-password" className="text-decoration-none">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-lg rounded-3 fw-medium py-2"
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </button>
                  </div>
                </form>

                <div className="position-relative my-4">
                  <hr />
                  <div className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                    or
                  </div>
                </div>

                {/* Social Login */}
                <div className="d-grid gap-2">
                  <button type="button" className="btn btn-light rounded-3 py-2">
                    <FaGoogle className="me-2" />
                    Continue with Google
                  </button>
                </div>

                {/* Sign up link */}
                <div className="text-center mt-4">
                  <p className="text-muted">
                    Don't have an account?{" "}
                    <span
                      className="text-decoration-none fw-medium"
                      style={{ cursor: "pointer", color: "#0d6efd" }}
                      onClick={() => navigate("/register")}
                    >
                      Sign up
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
