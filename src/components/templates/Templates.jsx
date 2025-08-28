// src/components/Templates.jsx
import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Templates = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="container-fluid py-5 px-4">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            {/* Left Side: Title and Description */}
            <div>
              <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                Templates
              </h4>
              <p className="text-muted mb-0">
                Save hours of work by creating reusable document templates.
              </p>
            </div>

            {/* Right Side: Search + Button */}
            <div className="d-flex align-items-center gap-2 w-100 w-md-auto mt-3 mt-md-2">
              <InputGroup
                className="shadow-sm flex-grow-1"
                style={{ maxWidth: "300px" }}
              >
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search templates..."
                  className="border-start-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>

              <Button
                variant="primary"
                className="fw-semibold px-4 shadow-sm"
                onClick={() => navigate("/template-builder")}
              >
                + New Template
              </Button>
            </div>
          </div>

          {/* Templates Table / Empty State */}
          <div className="border rounded text-center text-muted py-5 bg-light">
            <i className="bi bi-folder-x fs-2 mb-2 d-block"></i>
            <p className="mb-0">No templates found</p>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        .card-body {
          background-color: #fff;
          border-radius: 8px;
        }

        .btn-primary {
          background-color: #4f46e5;
          border-color: #4f46e5;
        }

        .btn-primary:hover {
          background-color: #4338ca;
          border-color: #4338ca;
        }

        @media (max-width: 768px) {
          .d-flex.align-items-center.gap-2 {
            flex-direction: column;
            align-items: stretch;
          }

          .d-flex.align-items-center.gap-5 > * {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Templates;
