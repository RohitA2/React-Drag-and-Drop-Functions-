import React, { useState, useEffect } from "react";
import { X, Search, Save, Settings } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreateClientModal from "./Forms/CreateClientModal";
import SignatureBlock from "./Blocks/SignatureBlock";
import { components } from "react-select";
import { useSelector } from "react-redux";
import {
  selectUserFullName,
  selectUserEmail,
  selectedUserId,
} from "../store/authSlice"; // adjust path

const FRONT_API_URL=import.meta.env.FRONT_API_URL
const API_URL=import.meta.env.VITE_API_URL

const HeaderSidebar = ({
  isOpen,
  onClose,
  onAddBlock,
  hasSignatureBlock,
  canvasRef,
  blocks = [],
}) => {
  const fullName = useSelector(selectUserFullName);
  const email = useSelector(selectUserEmail);
  const userId = useSelector(selectedUserId);
  const [name, setName] = React.useState("Sales Proposal");
  const [showModal, setShowModal] = useState(false);
  const [expirationDate, setExpirationDate] = React.useState(" ");
  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  // Send document handler
  const handleSendDocument = async () => {
    const headerId = localStorage.getItem("headerId");

    if (!headerId) {
      alert("HeaderId missing, please create header first!");
      return;
    }
    if (!selectedRecipient) {
      alert("Please select a recipient.");
      return;
    }

    const documentLink = `http://13.204.3.50/proposal/${headerId}`;

    const payload = {
      headerId,
      userId,
      name,
      from: { fullName, email },
      to: {
        id: selectedRecipient.id,
        name: selectedRecipient.name,
        email: selectedRecipient.email,
      },
      expirationDate,
      link: documentLink, // send link in payload
    };

    try {
      const res = await fetch(`${API_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Document sent successfully!");
        console.log("Mail API response:", data);
        onClose();
      } else {
        console.error("Failed to send document:", data);
        alert("Failed to send document.");
      }
    } catch (err) {
      console.error("Error sending document:", err);
      alert("Error while sending document.");
    }
  };

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

  useEffect(() => {
    if (!userId) return;

    const fetchRecipients = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/recipients?user_id=${userId}`
        );
        const data = await res.json();

        // Make sure we store an array
        if (data.success === false) {
          setRecipients([]); // handle error
        } else {
          setRecipients(Array.isArray(data.data) ? data.data : data);
        }
      } catch (err) {
        console.error("Error fetching recipients:", err);
        setRecipients([]);
      }
    };

    fetchRecipients();
  }, [userId]);

  // Filter recipients based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecipients([]);
      return;
    }
    const filtered = recipients.filter((r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipients(filtered);
  }, [searchTerm, recipients]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.35)",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 300ms ease",
          pointerEvents: isOpen ? "auto" : "none",
          zIndex: 1049,
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="position-fixed top-0 end-0 bg-white shadow-lg"
        style={{
          width: "500px",
          height: "100vh",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-in-out",
          zIndex: 1050,
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
                    {fullName}
                  </p>
                  {/* <p className="m-1 text-black fs-8 small-text1">{email}</p> */}
                  {/* <p className="m-1 text-black fs-8 small-text1"> {userId}</p> */}
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
                    placeholder="Search an existing recipient"
                    className="form-control flex-grow-1"
                    value={
                      selectedRecipient ? selectedRecipient.name : searchTerm
                    }
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedRecipient(null); // reset selection
                    }}
                  />

                  {/* Dropdown for search results */}
                  {filteredRecipients.length > 0 && !selectedRecipient && (
                    <ul
                      className="list-group position-absolute mt-1 w-100 shadow-sm"
                      style={{ zIndex: 1060 }}
                    >
                      {filteredRecipients.map((r) => (
                        <li
                          key={r.id}
                          className="list-group-item list-group-item-action small"
                          onClick={() => {
                            setSelectedRecipient(r);
                            setSearchTerm("");
                            setFilteredRecipients([]);
                          }}
                        >
                          {r.name} - {r.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Modal Component */}
              <CreateClientModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onCreated={(newRecipient) =>
                  setRecipients((prev) => [...prev, newRecipient])
                }
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
                  Add a Signature-block if you'd like for your recipient to
                  sign.
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
            >
              <Save size={16} />
            </button>

            {/* Send document button */}
            <button
              className="btn btn-primary flex-grow-1 small-text1"
              onClick={handleSendDocument}
            >
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
    </>
  );
};

export default HeaderSidebar;
