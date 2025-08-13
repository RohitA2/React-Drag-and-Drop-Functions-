// src/components/Templates.jsx
import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Templates = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1 fw-bold">Templates</h5>
            <p className="text-muted mb-0">
              Save hours of work by creating document templates.
            </p>
          </div>

          {/* Search + Create Button */}
          <div className="d-flex gap-2 mt-2 mt-sm-0">
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Button
              variant="primary"
              className="px-3"
              onClick={() => navigate("/template-builder")}
            >
              + Create Templates
            </Button>
          </div>
        </div>

        {/* Templates Table / Empty State */}
        <div className="text-center text-muted p-5 border rounded">
          No templates found
        </div>
      </div>
    </div>
  );
};

export default Templates;
