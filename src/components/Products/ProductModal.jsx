import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ProductModal = ({ show, handleClose }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="shadow-lg rounded-4"
      dialogClassName="modal-dialog-scrollable"
    >
      <Modal.Header
        closeButton
        className="border-0 pb-0"
        style={{ background: "linear-gradient(90deg, #f0f4f8, #d9e4f5)" }}
      >
        <Modal.Title className="fw-bold text-dark">New Product</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium">Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter product name"
              className="border-0 bg-light rounded-2 py-2"
              style={{ boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)" }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium">Price Ex. VAT/Tax</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="number"
                placeholder="Price per unit"
                className="border-0 bg-light rounded-2 py-2 flex-grow-1"
                style={{ boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)" }}
              />
              <span className="ms-3 text-secondary fw-medium">SEK</span>
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium">Unit</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter unit (e.g., pcs, kg)"
              className="border-0 bg-light rounded-2 py-2"
              style={{ boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)" }}
            />
          </Form.Group>

          <div className="d-flex gap-2 mb-4">
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-pill px-3 py-1 fw-medium"
              style={{ borderColor: "#4f46e5", color: "#4f46e5" }}
            >
              VAT / Tax 20%
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-pill px-3 py-1 fw-medium"
              style={{ borderColor: "#4f46e5", color: "#4f46e5" }}
            >
              + Generate ID
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          className="rounded-pill px-4 py-2 fw-medium"
          style={{ borderColor: "#6c757d", color: "#6c757d" }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleClose}
          className="rounded-pill px-4 py-2 fw-medium"
          style={{ background: "linear-gradient(90deg, #4f46e5, #6b46c1)", border: "none" }}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;