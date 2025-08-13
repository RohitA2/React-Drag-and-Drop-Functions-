import React, { useState } from "react";
import { Modal, Button, Nav } from "react-bootstrap";
import IndividualClientForm from "./IndividualClientForm";
import CompanyClientForm from "./CompanyClientForm";

export default function CreateClientModal({ show, onHide }) {
  const [selectedType, setSelectedType] = useState("individual");

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Client</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Toggle between Individual & Company */}
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link
              active={selectedType === "individual"}
              onClick={() => setSelectedType("individual")}
            >
              Individual
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={selectedType === "company"}
              onClick={() => setSelectedType("company")}
            >
              Company
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Render the selected form */}
        {selectedType === "individual" && <IndividualClientForm />}
        {selectedType === "company" && <CompanyClientForm />}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary">Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
