import React, { useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import NewSnippetModal from "./NewSnippetModal";

const SnippetsTable = () => {
  const [modalShow, setModalShow] = useState(false);
  const [search, setSearch] = useState("");
  const [snippets, setSnippets] = useState([
    { name: "Dummy name", snippet: "Snippet" },
    { name: "Sample template", snippet: "Another snippet" },
  ]);

  const filteredSnippets = snippets.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.snippet.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSnippet = (data) => {
    setSnippets((prev) => [
      ...prev,
      { name: data.templateName, snippet: data.snippet },
    ]);
    setModalShow(false); // close modal after adding
  };

  return (
    <div
      className="p-4 rounded-3"
      style={{
        maxWidth: "100%",
        background: "linear-gradient(135deg, #f0f4f8 0%, #d9e4f5 100%)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className="bg-white p-4 rounded-3 shadow-sm"
        style={{ backdropFilter: "blur(6px)", background: "rgba(255, 255, 255, 0.95)" }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary rounded-circle p-2" style={{ width: "40px", height: "40px" }}>
              <i className="bi bi-code-slash text-white fs-5"></i>
            </div>
            <div>
              <h5 className="mb-0 text-dark fw-bold">Snippets</h5>
              <p className="text-muted mb-0 small">Create reusable text for your documents.</p>
            </div>
          </div>
          <div className="d-flex gap-3">
            <Form.Control
              type="text"
              placeholder="Search snippets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-light rounded-2 py-2"
              style={{ maxWidth: "250px", boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)" }}
            />
            <Button
              variant="primary"
              className="px-4 py-2 rounded-pill shadow-sm fw-medium"
              style={{ background: "linear-gradient(90deg, #4f46e5, #6b46c1)", border: "none" }}
              onClick={() => setModalShow(true)}
            >
              + Create Snippet
            </Button>
          </div>
        </div>

        <div className="table-responsive">
          <Table hover responsive className="align-middle text-nowrap">
            <thead className="bg-light">
              <tr>
                <th className="py-3 text-dark fw-semibold">Template Name</th>
                <th className="py-3 text-dark fw-semibold">Snippet</th>
              </tr>
            </thead>
            <tbody>
              {filteredSnippets.length > 0 ? (
                filteredSnippets.map((item, index) => (
                  <tr key={index} className="border-bottom hover-effect">
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{item.snippet}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-5 text-muted">
                    <i className="bi bi-clipboard-x fs-2 mb-3"></i>
                    <h6>No snippets found</h6>
                    <p className="mb-0">Create a snippet to get started!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Modal for adding snippets */}
        <NewSnippetModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          onSubmit={handleAddSnippet}
        />
      </div>

      {/* Inline Styles */}
      <style>{`
        .table-responsive {
          border-radius: 8px;
          overflow: hidden;
        }

        .table {
          background-color: #fff;
        }

        .table thead {
          border-bottom: 2px solid #e9ecef;
        }

        .table th {
          font-size: 0.95rem;
        }

        .table td {
          vertical-align: middle;
        }

        .hover-effect:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
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
          .d-flex.gap-3 {
            flex-direction: column;
            align-items: stretch;
          }

          .form-control {
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

export default SnippetsTable;