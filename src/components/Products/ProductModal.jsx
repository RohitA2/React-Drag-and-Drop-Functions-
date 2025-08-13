// ProductModal.js
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ProductModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>New Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter name" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price Ex. VAT/Tax</Form.Label>
            <div className="d-flex">
              <Form.Control type="number" placeholder="Price per unit" />
              <span className="ms-2 align-self-center">SEK</span>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Unit</Form.Label>
            <Form.Control type="text" placeholder="Enter unit" />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm">
              VAT / Tax 20%
            </Button>
            <Button variant="outline-primary" size="sm">
              + ID
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
