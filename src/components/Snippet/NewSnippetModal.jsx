// NewSnippetModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const NewSnippetModal = ({ show, onHide, onSubmit }) => {
  const [formData, setFormData] = useState({
    templateName: "",
    snippet: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ templateName: "", snippet: "" });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title style={{ fontWeight: "600" }}>New Snippet</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "500" }}>Template Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              name="templateName"
              value={formData.templateName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ fontWeight: "500" }}>Snippet</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Write..."
              name="snippet"
              value={formData.snippet}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          style={{ borderRadius: "8px", minWidth: "100px" }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          style={{ borderRadius: "8px", minWidth: "100px", backgroundColor: "#0066FF" }}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewSnippetModal;
