import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Templates = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="container-fluid py-5 px-4" style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #d9e4f5 100%)" }}>
      <div className="card shadow-lg border-0 rounded-3" style={{ background: "white", backdropFilter: "blur(10px)" }}>
        <div className="card-body p-4">
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
            {/* Left Side: Title and Description */}
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary rounded-circle p-2" style={{ width: "40px", height: "40px" }}>
                <i className="bi bi-file-earmark-text text-white fs-5"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">Templates</h4>
                <p className="text-muted mb-0 small">Save hours with reusable document templates.</p>
              </div>
            </div>

            {/* Right Side: Search + Button */}
            <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
              <InputGroup className="shadow-sm rounded-pill overflow-hidden flex-grow-1" style={{ maxWidth: "350px" }}>
                <InputGroup.Text className="bg-light border-0">
                  <i className="bi bi-search text-secondary"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search templates..."
                  className="border-0 bg-light"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ boxShadow: "none" }}
                />
              </InputGroup>

              <Button
                variant="primary"
                className="fw-semibold px-4 py-2 rounded-pill shadow-sm"
                style={{ background: "linear-gradient(90deg, #4f46e5, #6b46c1)", border: "none" }}
                onClick={() => navigate("/template-builder")}
              >
                + New Template
              </Button>
            </div>
          </div>

          {/* Templates Table / Empty State */}
          <div className="border rounded-3 p-5 bg-white shadow-sm text-center">
            <i className="bi bi-folder-x fs-1 text-secondary mb-3"></i>
            <h5 className="text-muted mb-2">No templates found</h5>
            <p className="text-muted mb-0">Create your first template to get started!</p>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        .card-body {
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .card-body:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .btn-primary {
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: linear-gradient(90deg, #4338ca, #5a32a3);
          transform: translateY(-1px);
        }

        .bg-light {
          background-color: #f8f9fa !important;
        }

        .input-group .form-control:focus {
          border-color: #4f46e5;
          box-shadow: none;
          background-color: #fff;
        }

        @media (max-width: 768px) {
          .d-flex.align-items-center.gap-3 {
            flex-direction: column;
            align-items: stretch;
          }

          .input-group {
            width: 100%;
          }

          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Templates;