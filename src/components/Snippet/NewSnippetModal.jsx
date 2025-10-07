import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const NewSnippetModal = ({ show, onHide, onSubmit }) => {
  const [formData, setFormData] = useState({
    templateName: "",
    snippet: "",
  });
  const [errors, setErrors] = useState({
    templateName: "",
    snippet: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { templateName: "", snippet: "" };

    if (!formData.templateName.trim()) {
      newErrors.templateName = "Template name is required.";
      isValid = false;
    }

    if (!formData.snippet.trim()) {
      newErrors.snippet = "Snippet content is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ templateName: "", snippet: "" });
      onHide();
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="shadow-lg rounded-4"
      dialogClassName="modal-dialog-scrollable"
    >
      <Modal.Header
        closeButton
        className="border-0 pb-0"
        style={{ background: "linear-gradient(90deg, #f0f4f8, #d9e4f5)" }}
      >
        <Modal.Title className="fw-bold text-dark">New Snippet</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium">Template Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter template name"
              name="templateName"
              value={formData.templateName}
              onChange={handleChange}
              className={`border-0 bg-light rounded-2 py-2 ${errors.templateName ? "border border-danger" : ""}`}
              style={{ boxShadow: errors.templateName ? "inset 0 2px 4px rgba(220, 53, 69, 0.2)" : "inset 0 2px 4px rgba(0, 0, 0, 0.05)" }}
              isInvalid={!!errors.templateName}
            />
            {errors.templateName && <Form.Text className="text-danger">{errors.templateName}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium">Snippet</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Write your snippet here..."
              name="snippet"
              value={formData.snippet}
              onChange={handleChange}
              className={`border-0 bg-light rounded-2 py-2 ${errors.snippet ? "border border-danger" : ""}`}
              style={{ boxShadow: errors.snippet ? "inset 0 2px 4px rgba(220, 53, 69, 0.2)" : "inset 0 2px 4px rgba(0, 0, 0, 0.05)", resize: "vertical" }}
              isInvalid={!!errors.snippet}
            />
            {errors.snippet && <Form.Text className="text-danger">{errors.snippet}</Form.Text>}
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          className="rounded-pill px-4 py-2 fw-medium"
          style={{ borderColor: "#6c757d", color: "#6c757d" }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className="rounded-pill px-4 py-2 fw-medium"
          style={{ background: "linear-gradient(90deg, #4f46e5, #6b46c1)", border: "none" }}
          disabled={!!errors.templateName || !!errors.snippet}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewSnippetModal;