import React, { useState } from "react";
import { X, Search, Save, Settings } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreateClientModal from "./Forms/CreateClientModal";
import SignatureBlock from "./Blocks/SignatureBlock";
import { components } from "react-select";

const HeaderSidebar = ({ isOpen, onClose, onAddBlock, hasSignatureBlock }) => {
  const [name, setName] = React.useState("Sales Proposal");
  const [showModal, setShowModal] = useState(false);
  const [expirationDate, setExpirationDate] = React.useState("09/15/2025");

  // Signature-block button handler
  const handleAddSignatureBlock = () => {
    if (onAddBlock) {
      const newBlock = {
        id: Date.now(),
        type: "signature",
        settings: {
          width: 400,
          height: 150,
          backgroundColor: "#fff",
          textColor: "#000",
          textAlign: "left",
        },
      };
      onAddBlock(newBlock);
    }
  };

  const handleSave = () => {
    // Save logic here
    onClose();
  };

  return (
    <div
      className={`fixed top-0 right-0 bg-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "" : "translate-x-full"
      }`}
      style={{
        width: "500px",
        height: "100vh",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        marginLeft: "-130px",
        padding: "25px",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-1 border-bottom bg-light">
        <h5 className="m-1  text-black fs-8 fw-semibold small-text1">
          Send Document
        </h5>
        <button
          onClick={onClose}
          className="btn btn-sm hower-shadow bg-white border-0"
          aria-label="Close"
        >
          <X size={20} className="text-black" />
        </button>
      </div>

      {/* Content */}
      <div
        className="p-1 overflow-auto"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="mb-4">
          {/* Document Name */}
          <div className="mb-4">
            <label className="form-label text-muted fw-semibold mb-1 d-block rounded p-2 small-text2 ">
              Document name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="form-control bg-light rounded"
              maxLength={50}
              required
            />
          </div>

          {/* From Section */}
          <div className="mb-4">
            <label className="mb-1 form-label text-muted small-text fw-semibold mb-1 sm small-text1">
              From
            </label>
            <div className="border rounded p-1 d-flex justify-content-between align-items-center">
              <div>
                <p className="m-1  text-black fs-8  small-text1">
                  Rohit Chakrawarti
                </p>
                <p className="m-1  text-black fs-8 small-text1">
                  Sender. Needs to sign
                </p>
              </div>
            </div>
          </div>

          {/* To Section */}
          <div className="mb-4">
            <p className="form-label text-muted small-text fw-semibold mb-1 sm small-text1">
              To:
            </p>

            <div className="border rounded p-2 d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2 w-100">
                {/* Add New Recipient Button */}
                <button
                  className="btn btn-primary btn-sm flex-grow- form-control justify-content-center align-items-center"
                  onClick={(e) => {
                    setShowModal(true);
                    e.currentTarget.blur();
                  }}
                >
                  <span className="mb-1 text-white fs-[10px] ">
                    + Add new recipient
                  </span>
                </button>

                {/* OR text */}
                <p className="flex-grow-0 text-center text-muted align-self-center m-0">
                  or
                </p>

                {/* Existing recipient search */}
                <input
                  type="text"
                  placeholder="An existing recipient"
                  className="form-control flex-grow-1"
                />
              </div>
            </div>

            {/* Modal Component */}
            <CreateClientModal
              show={showModal}
              onHide={() => setShowModal(false)}
            />
          </div>

          {/* Signature Block */}
          {!hasSignatureBlock && (
            <div className="border rounded p-3 mb-4 bg-danger bg-opacity-10 text-danger">
              <div className="form-check d-flex align-items-center gap-2 mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="signatureBlock"
                  checked
                  readOnly
                />
                <label
                  className="form-check-label small font-weight-bold"
                  htmlFor="signatureBlock"
                >
                  Signature-block missing
                </label>
              </div>
              <p className="small mb-2">
                Add a Signature-block if you'd like for your recipient to sign.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddSignatureBlock}
              >
                Add Signature-block
              </button>
            </div>
          )}

          {/* Expiration */}
          <div className="mb-4">
            <label className="small font-weight-bold text-muted mb-1">
              Expiration:
            </label>
            <div className="d-flex gap-2 align-items-center">
              {/* Date picker input */}
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="form-control flex-grow-1"
              />
              {/* Send as field (readonly) */}
              <input
                type="text"
                placeholder="Send as"
                className="form-control flex-grow-1 bg-light"
                readOnly
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top bg-white">
        <div className="d-flex align-items-center gap-2">
          {/* Small save button */}
          <button
            className="btn btn-sm btn-light position-relative d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            onClick={handleSave}
            onMouseEnter={() => setShowSaveOptions(true)}
          >
            <Save size={16} />
          </button>

          {/* Send document button */}
          <button className="btn btn-primary flex-grow-1 small-text1">
            Send document
          </button>
        </div>
        {/* Checkbox */}
        <div className="form-check m-0 d-flex align-items-center">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="saveTemplate"
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="saveTemplate"
          >
            Save document as a template
          </label>
        </div>
      </div>

      <style>{`
        .small-text1 {font-size: 0.9rem};
        .small-text3 {font-size: 0.5rem};`}</style>
    </div>
  );
};

export default HeaderSidebar;
