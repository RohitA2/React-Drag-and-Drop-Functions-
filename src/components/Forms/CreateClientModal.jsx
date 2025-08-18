import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import IndividualClientForm from "./IndividualClientForm";
import CompanyClientForm from "./CompanyClientForm";

export default function CreateClientModal({ show, onHide }) {
  const [selectedType, setSelectedType] = useState("individual");

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Recipient</h5>
          <div className="btn-group p-0">
            <button
              className={`btn btn-sm ${
                selectedType === "individual" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setSelectedType("individual")}
            >
              Individual
            </button>
            <button
              className={`btn btn-sm ${
                selectedType === "company" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setSelectedType("company")}
            >
              Company
            </button>
          </div>
        </div>

        {/* Render form */}
        {selectedType === "individual" && <IndividualClientForm />}
        {selectedType === "company" && <CompanyClientForm />}
      </Modal.Body>
    </Modal>
  );
}
