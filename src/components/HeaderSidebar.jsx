import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreateClientModal from "./Forms/CreateClientModal";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


import {
  selectUserFullName,
  selectUserEmail,
  selectedUserId,
} from "../store/authSlice";
import { selectHeaderIds } from "../store/headerSlice";
import {
  selectLastBlockId,
  selectLastAttachmentIds,
} from "../store/attachmentSlice";
import { selectParentId } from "../store/canvasSlice";

const API_URL = import.meta.env.VITE_API_URL;

const HeaderSidebar = ({
  isOpen,
  onClose,
  onAddBlock,
  hasSignatureBlock,
  canvasRef,
  blocks = [],
}) => {
  const navigate = useNavigate();
  const { toParties, fromParty, partyId } = useSelector((state) => state.party);
  const signatures = useSelector((state) => state.signatures.items);

  const fullName = useSelector(selectUserFullName);
  const email = useSelector(selectUserEmail);
  const userId = useSelector(selectedUserId);
  const headerIds = useSelector(selectHeaderIds);
  const signatureId = signatures[0]?.id;
  const lastIds = useSelector(selectLastAttachmentIds);
  const blockId = useSelector(selectLastBlockId);
  const canvasParentId = useSelector(selectParentId);

  const [name, setName] = useState("Proposal");
  const [showModal, setShowModal] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // Auto-select parties
  useEffect(() => {
    if (fromParty?.name) {
      setName(fromParty.documentName || "Sales Proposal");
    }

    if (toParties && toParties.length > 0) {
      setSelectedRecipients(toParties);
    }
  }, [fromParty, toParties, partyId]);

  // Fetch recipients for search/add
  useEffect(() => {
    if (!userId) return;

    const fetchRecipients = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recipients?user_id=${userId}`);
        const data = await res.json();
        if (data.success === false) {
          setRecipients([]);
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

  // Search filter
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

  // Toggle recipient selection
  const toggleRecipientSelection = (recipient) => {
    setSelectedRecipients((prev) => {
      const isSelected = prev.some((r) => r.id === recipient.id);
      if (isSelected) {
        return prev.filter((r) => r.id !== recipient.id);
      } else {
        return [...prev, recipient];
      }
    });
    setSearchTerm("");
    setFilteredRecipients([]);
  };

  // Remove recipient
  const removeRecipient = (recipientId) => {
    setSelectedRecipients((prev) => prev.filter((r) => r.id !== recipientId));
  };

  // Send document
  const handleSendDocument = async () => {
    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    // Use Redux state first, then localStorage as fallback
    const parentId = canvasParentId || localStorage.getItem("parentId");
    if (!parentId) {
      toast.error("Missing document parent. Add a block to create it first.");
      return;
    }

    setIsSending(true);

    // Get the first header ID (assuming we want to use the first one)
    const headerId = headerIds.length > 0 ? headerIds[0] : null;

    // if (!headerId) {
    //   toast.error(
    //     "No document header found. Please add content to your document."
    //   );
    //   setIsSending(false);
    //   return;
    // }

    const origin = window.location?.origin || "http://13.62.210.204";
    const documentLink = `${origin}/proposal?parentId=${parentId}`;

    const payload = {
      parentId: parentId,
      headerId,
      userId,
      name,
      from: {
        fullName: fromParty?.name || fullName,
        email: fromParty?.email || email,
      },
      to: selectedRecipients.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
      })),
      expirationDate,
      link: documentLink,
    };

    try {
      const res = await fetch(`${API_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to send document:", data);
        toast.error(data.error || "Failed to send document");
      } else {
        toast.success(`Document sent to ${selectedRecipients.length} recipient(s)!`);
        onClose();

        // ✅ Redirect using useNavigate after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      console.error("Error sending document:", err);
      toast.error("Failed to send document");
    } finally {
      setIsSending(false);
    }

  };

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
    onClose();
  };

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
          <h5 className="m-1 text-black fs-8 fw-semibold small-text1">
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
              <label className="form-label text-muted fw-semibold mb-1 d-block rounded p-2 small-text2">
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

            {/* From */}
            <div className="mb-4">
              <label className="mb-1 form-label text-muted small-text fw-semibold small-text1">
                From
              </label>
              <div className="border rounded p-1">
                <p className="m-1 text-black small-text1">
                  {fromParty?.name || fullName}
                </p>
                <p className="m-1 text-black small-text1">
                  {fromParty?.email || email}
                </p>
              </div>
            </div>

            {/* To */}
            <div className="mb-4">
              <p className="form-label text-muted small-text fw-semibold small-text1">
                To:
              </p>

              {/* Show selected recipients */}
              {selectedRecipients.length > 0 && (
                <div className="mb-2">
                  {selectedRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="border rounded p-2 mb-2 d-flex align-items-center justify-content-between bg-light"
                    >
                      <div className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={true}
                          readOnly
                        />
                        <div>
                          <p className="m-0 fw-semibold small-text1">
                            {recipient.name}
                          </p>
                          <p className="m-0 text-muted small-text3">
                            {recipient.email}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger"
                        onClick={() => removeRecipient(recipient.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border rounded p-2 d-flex justify-content-between align-items-center position-relative">
                <div className="d-flex gap-2 w-100">
                  <button
                    className="btn btn-primary btn-sm flex-grow-0 form-control"
                    onClick={(e) => {
                      setShowModal(true);
                      e.currentTarget.blur();
                    }}
                  >
                    <span className="mb-1 text-white fs-[10px]">
                      + Add new recipient
                    </span>
                  </button>

                  <p className="flex-grow-0 text-center text-muted align-self-center m-0">
                    or
                  </p>

                  <input
                    type="text"
                    placeholder="Search an existing recipient"
                    className="form-control flex-grow-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {filteredRecipients.length > 0 && (
                  <ul
                    className="list-group position-absolute mt-1 w-100 shadow-sm"
                    style={{ zIndex: 1060, top: "100%", left: 0 }}
                  >
                    {filteredRecipients.map((r) => (
                      <li
                        key={r.id}
                        className="list-group-item list-group-item-action small"
                        onClick={() => toggleRecipientSelection(r)}
                        style={{ cursor: "pointer" }}
                      >
                        {r.name} - {r.email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <CreateClientModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onCreated={(newRecipient) => {
                  setRecipients((prev) => [...prev, newRecipient]);
                  toggleRecipientSelection(newRecipient);
                }}
              />
            </div>

            {/* Signature Block */}
            {!hasSignatureBlock && (
              <div className="border rounded p-3 mb-4 bg-danger bg-opacity-10 text-danger">
                <p className="small mb-2">Signature-block missing</p>
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
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="form-control flex-grow-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top bg-white">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-light d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px" }}
              onClick={handleSave}
            >
              <Save size={16} />
            </button>
            <button
              className="btn btn-primary flex-grow-1 small-text1"
              onClick={handleSendDocument}
              disabled={isSending || selectedRecipients.length === 0}
            >
              {isSending
                ? "Sending..."
                : `Send document to ${selectedRecipients.length} recipient(s)`}
            </button>
          </div>
          <div className="form-check m-0 d-flex align-items-center mt-2">
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
          .small-text3 {font-size: 0.75rem};
        `}</style>
      </div>
    </>
  );
};

export default HeaderSidebar;
