import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import IndividualClientForm from "./IndividualClientForm";

export default function ParentModal() {
  const [showMain, setShowMain] = useState(true); // Main Modal
  const [showConfirm, setShowConfirm] = useState(false); // Confirm Modal

  // Jab user modal ko close kare
  const handleCloseMain = () => {
    setShowConfirm(true); // confirm popup dikhao
  };

  // Confirm YES → modal band
  const handleConfirmYes = () => {
    setShowConfirm(false);
    setShowMain(false);
  };

  // Confirm NO → confirm band karo, modal wapas open rahe
  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* Main Modal */}
      <Modal
        show={showMain}
        onHide={handleCloseMain}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body>
          <IndividualClientForm />
        </Modal.Body>
      </Modal>

      {/* Confirm Modal */}
      <Modal show={showConfirm} centered>
        <Modal.Body className="text-center">
          <h6 className="fw-bold">Unsaved changes</h6>
          <p className="text-muted small">Are you sure you want to cancel?</p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button variant="light" onClick={handleConfirmNo}>
              No
            </Button>
            <Button variant="danger" onClick={handleConfirmYes}>
              Yes
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
