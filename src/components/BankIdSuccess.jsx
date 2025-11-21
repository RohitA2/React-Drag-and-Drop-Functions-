import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function BankIdSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("id");
  const relayState = params.get("relay_state");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const resp = await axios.get(
          `http://localhost:5000/bankid/status/${sessionId}`
        );
        setData(resp.data);
      } catch (err) {
        console.error(err);
        setData({ error: "Failed to verify session. Please try again." });
      } finally {
        setLoading(false);
      }
    }
    if (sessionId) verify();
  }, [sessionId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-5">
          <div className="spinner-border text-success mb-4" role="status" style={{ width: "4rem", height: "4rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="text-muted animate__animated animate__pulse animate__infinite">
            Verifying your BankID...
          </h3>
          <p className="text-secondary mt-3">Please wait while we confirm your identity</p>
        </div>
      </div>
    );
  }

  // Error State
  if (data?.error || !data?.success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-danger-soft">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "480px", width: "100%" }}>
          <div className="card-body p-5 text-center">
            <div className="mb-4">
              <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "4.5rem" }}></i>
            </div>
            <h2 className="fw-bold text-dark">Authentication Failed</h2>
            <p className="text-muted fs-5 mt-3">
              {data?.error || "The session has expired or is still pending."}
            </p>
            <button onClick={() => window.location.reload()} className="btn btn-danger btn-lg px-5 mt-4">
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = data.user;

  return (
    <>
      {/* Bootstrap 5 + Icons CDN */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />
      <style>
        {`
          .bg-gradient-success {
            background: linear-gradient(135deg, #d4f4e2 0%, #a7e9d1 100%);
          }
          .bg-gradient-danger-soft {
            background: linear-gradient(135deg, #fce4e4 0%, #fddede 100%);
          }
          .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .card-hover:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
          }
          .initials-avatar {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: linear-gradient(135deg, #20c997, #0d6efd);
            color: white;
            font-size: 2rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.7s ease-out forwards;
          }
        `}
      </style>

      <div className="min-vh-100 bg-gradient-success d-flex align-items-center justify-content-center p-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              {/* Main Success Card */}
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden card-hover">
                {/* Header */}
                <div className="bg-success text-white text-center py-5 px-4">
                  <div className="mb-4 animate__animated animate__bounceIn">
                    <i className="bi bi-check-circle-fill" style={{ fontSize: "5rem" }}></i>
                  </div>
                  <h1 className="fw-bold display-5 mb-3">Welcome back!</h1>
                  <p className="lead opacity-90">
                    You have been successfully authenticated with BankID
                  </p>
                </div>

                {/* Body */}
                <div className="card-body p-5">
                  {/* User Profile Section */}
                  <div className="text-center mb-5 animate-fadeInUp">
                    <div className="position-relative d-inline-block">
                      <div className="initials-avatar shadow-lg">
                        {user?.name?.charAt(0) || <i className="bi bi-person"></i>}
                      </div>
                      <div
                        className="position-absolute bg-white rounded-circle shadow-sm"
                        style={{ bottom: -5, right: -5, width: 40, height: 40 }}
                      >
                        <i className="bi bi-shield-check text-success fs-3"></i>
                      </div>
                    </div>
                    <h3 className="mt-4 fw-bold text-dark">
                      {user?.name || user?.personalNumber}
                    </h3>
                    <p className="text-success fw-semibold">
                      <i className="bi bi-patch-check-fill me-2"></i>
                      Verified Identity
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="row g-4 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
                    {user?.personalNumber && (
                      <div className="col-md-6">
                        <div className="bg-light rounded-3 p-4 border-start border-success border-4">
                          <small className="text-muted text-uppercase fw-semibold">Personal Number</small>
                          <p className="fw-bold fs-5 mb-0 mt-1">{user.personalNumber}</p>
                        </div>
                      </div>
                    )}
                    {data.status && (
                      <div className="col-md-6">
                        <div className="bg-light rounded-3 p-4 border-start border-primary border-4">
                          <small className="text-muted text-uppercase fw-semibold">Status</small>
                          <p className="fw-bold text-success fs-5 mb-0 mt-1">{data.status}</p>
                        </div>
                      </div>
                    )}
                    {user?.givenName && (
                      <div className="col-md-6">
                        <div className="bg-light rounded-3 p-4 border-start border-warning border-4">
                          <small className="text-muted text-uppercase fw-semibold">Full Name</small>
                          <p className="fw-bold fs-5 mb-0 mt-1">
                            {user.givenName} {user.surname || ""}
                          </p>
                        </div>
                      </div>
                    )}
                    {relayState && (
                      <div className="col-md-6">
                        <div className="bg-light rounded-3 p-4 border-start border-info border-4">
                          <small className="text-muted text-uppercase fw-semibold">Relay State</small>
                          <p className="fw-mono fs-6 mb-0 mt-1 text-truncate">{relayState}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-center mt-5 pt-4 border-top">
                    <p className="text-muted small">
                      <i className="bi bi-lock-fill text-success me-1"></i>
                      Secured by BankID • Verified on {new Date().toLocaleString("sv-SE")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}