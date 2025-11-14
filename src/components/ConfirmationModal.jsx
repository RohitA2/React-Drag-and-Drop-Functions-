import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.5)",
          zIndex: 1050,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{
          zIndex: 1051,
          minWidth: "400px",
          maxWidth: "500px",
        }}
      >
        <div className="bg-white rounded-3 shadow-lg border-0">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#fef3c7",
                }}
              >
                <AlertTriangle size={20} color="#f59e0b" />
              </div>
              <h5 className="m-0 fw-semibold text-dark">{title}</h5>
            </div>
            <button
              onClick={onClose}
              className="btn btn-sm btn-light rounded-circle"
              style={{ width: "32px", height: "32px" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="m-0 text-muted">{message}</p>
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-end gap-2 p-4 border-top">
            <button
              onClick={onClose}
              className="btn btn-light px-4 py-2 rounded-pill"
              style={{ fontWeight: "500" }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-danger px-4 py-2 rounded-pill"
              style={{ fontWeight: "500" }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
