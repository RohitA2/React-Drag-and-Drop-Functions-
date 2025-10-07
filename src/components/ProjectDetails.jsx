import React, { useState } from "react";
import { X, Copy, ExternalLink, Edit, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectedUserId } from "../store/authSlice";
import ChatSection from "./ChatSection";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const ProjectDetails = ({ project, onClose }) => {
  if (!project) return null;

  // State to track selected recipient
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  // State for expiration date editing
  const [editingExpiration, setEditingExpiration] = useState(false);
  const [tempExpiration, setTempExpiration] = useState(
    project.expirationDate
      ? new Date(project.expirationDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [expirationDate, setExpirationDate] = useState(project.expirationDate);

  const selectedRecipient =
    project.recipients?.[selectedRecipientIndex] || project.recipients?.[0];

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEditExpiration = () => {
    setTempExpiration(
      expirationDate
        ? new Date(expirationDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setEditingExpiration(true);
  };

  const handleSaveExpiration = async () => {
    setExpirationDate(new Date(tempExpiration));
    setEditingExpiration(false);

    try {
      const response = await fetch(`${API_URL}/api/updateExpireDate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalEmailId: project.id, // Assuming project.id is the proposalEmailId
          newExpirationDate: tempExpiration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Updated successfully:", data);
      } else {
        console.error("Failed to update expiration date");
      }
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpiration(false);
  };

  // Assuming project has amount fields; if not, these can be calculated or fetched
  const totalAmount = project.totalAmount || 79.5;
  const tax = project.tax || 15.9;
  const grandTotal = totalAmount + tax;

  return (
    <div className="project-details-sidebar">
      <div className="project-details-header">
        <div className="header-top">
          <h2 className="header-title">{project.proposalName}</h2>
          {/* <span className="proposal-id">#{project.id || "123456"}</span> */}
          <div className="header-actions">
            {/* <button className="invite-btn">
              <i className="fas fa-envelope"></i> Invite
            </button> */}
            <button className="close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="header-bottom">
          <div className="recipient-info">
            {/* <p className="recipient-name">
              {project.recipients?.[0]?.recipientName || "Unknown Client"}
            </p>
            <p className="recipient-email">
              {project.recipients?.[0]?.recipientEmail || "No email provided"}
            </p> */}
            {/* <p className="recipient-phone">
              {project.recipients?.[0]?.recipientDetails?.phone ||
                "No phone provided"}
            </p> */}
          </div>

          {/* <span
            className={`proposal-status ${
              project.signatures?.some((sig) => sig.status)
                ? "signed"
                : project.recipients?.some((r) => r.status === "denied")
                ? "denied"
                : "sent"
            }`}
          >
            {project.signatures?.some((sig) => sig.status)
              ? "Signed"
              : project.recipients?.some((r) => r.status === "denied")
              ? "Denied"
              : "Sent"}
          </span> */}
        </div>
      </div>

      <div className="project-details-content">
        <div className="details-panel">
          {/* Value Section */}
          <div className="details-section">
            <h4 className="section-heading">Value</h4>
            <div className="detail-item">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value">
                SEK {totalAmount.toFixed(2)} ex. VAT/Tax
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tax</span>
              <span className="detail-value">SEK {tax.toFixed(2)}</span>
            </div>
            <div className="detail-item total">
              <span className="detail-label">Total</span>
              <span className="detail-value">SEK {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Signee Section */}
          <div className="details-section">
            <h4 className="section-heading">Signees</h4>
            <div className="recipient-list">
              {project.recipients?.length > 0 ? (
                project.recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className={`recipient-item ${
                      index === selectedRecipientIndex ? "selected" : ""
                    }`}
                    onClick={() => setSelectedRecipientIndex(index)}
                    style={{
                      cursor: "pointer",
                      border:
                        index === selectedRecipientIndex
                          ? "2px solid #4a6cf7"
                          : "none",
                    }}
                  >
                    <div className="recipient-info">
                      <p className="recipient-name">
                        {recipient.recipientName}
                      </p>
                      <div className="d-flex align-items-center">
                        <p className="recipient-email me-2">
                          {recipient.recipientEmail}
                        </p>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              {copiedField === `email-${index}`
                                ? "Copied!"
                                : "Copy email"}
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="link"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(
                                recipient.recipientEmail,
                                `email-${index}`
                              );
                            }}
                          >
                            <Copy size={14} />
                          </Button>
                        </OverlayTrigger>
                      </div>
                      <div className="d-flex align-items-center">
                        <p className="recipient-phone me-2">
                          {recipient.recipientDetails?.phone || "No phone"}
                        </p>
                        {recipient.recipientDetails?.phone && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {copiedField === `phone-${index}`
                                  ? "Copied!"
                                  : "Copy phone"}
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(
                                  recipient.recipientDetails.phone,
                                  `phone-${index}`
                                );
                              }}
                            >
                              <Copy size={14} />
                            </Button>
                          </OverlayTrigger>
                        )}
                      </div>
                    </div>
                    <span
                      className={`recipient-status ${
                        recipient.status === "denied"
                          ? "denied"
                          : recipient.status === "sent"
                          ? "sent"
                          : "signed"
                      }`}
                    >
                      {recipient.status || "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-recipients">No recipients found</p>
              )}
            </div>
          </div>

          {/* Event Section */}
          <div className="details-section">
            <h4 className="section-heading">More Details</h4>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(project.createdAt || new Date()).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expires</span>
              <span className="detail-value d-flex align-items-center">
                {editingExpiration ? (
                  <>
                    <input
                      type="date"
                      value={tempExpiration}
                      onChange={(e) => setTempExpiration(e.target.value)}
                      className="form-control me-2"
                      style={{ width: "auto", minWidth: "150px" }}
                    />
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Save</Tooltip>}
                    >
                      <Button
                        variant="link"
                        size="sm"
                        className="ms-1"
                        onClick={handleSaveExpiration}
                      >
                        <Save size={14} />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Cancel</Tooltip>}
                    >
                      <Button
                        variant="link"
                        size="sm"
                        className="ms-1"
                        onClick={handleCancelEdit}
                      >
                        <X size={14} />
                      </Button>
                    </OverlayTrigger>
                  </>
                ) : (
                  <>
                    <span className="me-2">
                      {new Date(
                        expirationDate || new Date()
                      ).toLocaleDateString()}
                    </span>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit expiration date</Tooltip>}
                    >
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleEditExpiration}
                      >
                        <Edit size={14} />
                      </Button>
                    </OverlayTrigger>
                  </>
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span
                className={`detail-value status ${
                  project.signatures?.some((sig) => sig.status)
                    ? "signed"
                    : project.recipients?.some((r) => r.status === "denied")
                    ? "denied"
                    : "sent"
                }`}
              >
                {project.signatures?.some((sig) => sig.status)
                  ? "Signed"
                  : project.recipients?.some((r) => r.status === "denied")
                  ? "Denied"
                  : "Sent"}
              </span>
            </div>
            {project.link && (
              <div className="detail-item">
                <span className="detail-label">Link</span>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Open link in new tab</Tooltip>}
                >
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-value text-primary d-flex align-items-center"
                  >
                    View Proposal <ExternalLink size={14} className="ms-2" />
                  </a>
                </OverlayTrigger>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section - Using the separate component */}
        <ChatSection
          recipientPhone={selectedRecipient?.recipientDetails?.phone}
          recipientName={selectedRecipient?.recipientName}
        />
      </div>

      <style>{`
        .project-details-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 950px;
          background-color: #f8f8f8;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
          overflow-y: auto;
          /* Hide scrollbar for WebKit browsers (Chrome, Safari, Edge) */
          &::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for Firefox */
          scrollbar-width: none;
          /* Hide scrollbar for IE/Edge */
          -ms-overflow-style: none;
        }
        
        .project-details-header {
          background-color: #4364EE;
          color: white;
          padding: 24px 32px;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .header-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          flex: 1;
        }
        
        .proposal-id {
          font-size: 14px;
          color: #a0aec0;
          margin: 0 16px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .header-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .recipient-info {
          flex: 1;
        }

        .recipient-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .recipient-email {
          font-size: 14px;
          color: #a0aec0;
          margin: 0;
        }
        
        .invite-btn, .close-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .invite-btn:hover, .close-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .proposal-status {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .proposal-status.signed {
          background-color: #68d391;
          color: white;
        }

        .proposal-status.denied {
          background-color: #fc8181;
          color: white;
        }

        .proposal-status.sent {
          background-color: #4a6cf7;
          color: white;
        }

        .project-details-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .details-panel {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          /* Hide scrollbar for details-panel as well */
          &::-webkit-scrollbar {
            display: none;
          }
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .chat-panel {
          width: 380px;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-left: 1px solid #e2e8f0;
        }

        .details-section {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .section-heading {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1a202c;
          padding-bottom: 8px;
          border-bottom: 1px solid #edf2f7;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 8px 0;
          align-items: center;
        }

        .detail-item.total {
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 8px;
          font-weight: 600;
        }

        .detail-label {
          color: #4a5568;
          font-size: 14px;
        }

        .detail-value {
          color: #1a202c;
          font-weight: 500;
        }

        .detail-value.status.signed {
          color: #38a169;
        }

        .detail-value.status.denied {
          color: #e53e3e;
        }

        .detail-value.status.sent {
          color: #3182ce;
        }
        
        .recipient-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .recipient-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background-color: #f7fafc;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .recipient-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .recipient-status {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
        }
        
        .recipient-status.sent {
          background-color: #e2e8f0;
          color: #4a5568;
        }

        .recipient-status.signed {
          background-color: #68d391;
          color: white;
        }

        .recipient-status.denied {
          background-color: #fc8181;
          color: white;
        }

        .no-recipients {
          color: #a0aec0;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .chat-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 4px 12px;
          border-radius: 6px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary {
          background-color: #4a6cf7;
          color: white;
        }

        .btn-secondary {
          background-color: transparent;
          color: #4a5568;
          border: 1px solid #cbd5e0;
        }

        .chat-thread {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          /* Hide scrollbar for chat-thread if applicable */
          &::-webkit-scrollbar {
            display: none;
          }
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .chat-message {
          display: flex;
          max-width: 85%;
        }
        
        .chat-message.received {
          align-self: flex-start;
        }
        
        .chat-message.sent {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        
        .message-content {
          padding: 12px 16px;
          border-radius: 12px;
          position: relative;
        }
        
        .chat-message.received .message-content {
          background-color: #edf2f7;
          border-top-left-radius: 4px;
        }
        
        .chat-message.sent .message-content {
          background-color: #4a6cf7;
          color: white;
          border-top-right-radius: 4px;
        }
        
        .chat-time {
          font-size: 11px;
          color: #a0aec0;
          margin-top: 4px;
          display: block;
        }

        .chat-message.sent .chat-time {
          color: rgba(255, 255, 255, 0.7);
        }

        .fa-check-double {
          font-size: 12px;
          align-self: flex-end;
          margin-bottom: 8px;
          margin-right: 4px;
        }
        
        .fa-check-double.read {
          color: #4a6cf7;
        }
        
        .fa-check-double.unread {
          color: #a0aec0;
        }
        
        .chat-input-area {
          display: flex;
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          gap: 12px;
        }
        
        .chat-input-area input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }
        
        .chat-tools {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tool-btn {
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          font-size: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tool-btn:hover {
          background-color: #f7fafc;
        }
        
        .send-btn {
          background-color: #4a6cf7;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .send-btn:hover {
          background-color: #3b5be3;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 1024px) {
          .project-details-sidebar {
            width: 100%;
          }

          .project-details-content {
            flex-direction: column;
          }
          
          .chat-panel {
            width: 100%;
            border-left: none;
            border-top: 1px solid #e2e8f0;
          }
        }
          
      `}</style>
    </div>
  );
};

export default ProjectDetails;
