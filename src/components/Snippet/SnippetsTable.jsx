// SnippetsTable.js
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
      className="p-3 border rounded bg-white"
      style={{ maxWidth: "100%", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
    >
      <h5 className="mb-1">Snippets</h5>
      <p className="text-muted" style={{ fontSize: "0.9rem" }}>
        Create reusable strings of text, then add them to your documents.
      </p>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "250px" }}
        />
        <Button
          variant="primary"
          className="px-3"
          onClick={() => setModalShow(true)}
        >
          + Create Snippet
        </Button>
      </div>

      <Table hover responsive borderless>
        <thead>
          <tr className="border-bottom">
            <th style={{ fontWeight: "500" }}>Template Name</th>
            <th style={{ fontWeight: "500" }}>Snippet</th>
          </tr>
        </thead>
        <tbody>
          {filteredSnippets.map((item, index) => (
            <tr key={index} className="border-bottom">
              <td>{item.name}</td>
              <td>{item.snippet}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for adding snippets */}
      <NewSnippetModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        onSubmit={handleAddSnippet}
      />
    </div>
  );
};

export default SnippetsTable;
