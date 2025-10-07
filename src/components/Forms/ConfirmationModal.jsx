import React from "react";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";

const ConfirmationModal = ({
  show,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "danger", // default to danger for destructive actions
  cancelVariant = "outline-secondary",
}) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop="static"
      className="modern-modal"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            {/* Modern icon - you can replace with your own icon component */}
            <div className="modal-icon mb-3">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h5 className="fw-bold mb-2">{title}</h5>
            <p className="text-muted">{message}</p>
          </div>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button
              variant={cancelVariant}
              onClick={onCancel}
              className="px-4 py-2 rounded-3"
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              className="px-4 py-2 rounded-3"
            >
              {confirmText}
            </Button>
          </div>
        </Modal.Body>
      </motion.div>
    </Modal>
  );
};

// Add this to your global CSS or style component
const modernStyles = `
  .modern-modal .modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .modal-icon {
    color: var(--bs-primary);
    background: rgba(var(--bs-primary-rgb), 0.1);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
  
  .modal-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .btn {
    font-weight: 500;
    min-width: 100px;
  }
`;

// Add the styles to the document head
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = modernStyles;
  document.head.appendChild(styleElement);
}

export default ConfirmationModal;
