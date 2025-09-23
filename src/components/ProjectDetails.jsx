import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectedUserId } from "../store/authSlice";

// Separate Chat Component
const ChatSection = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there, I wanted to follow up on the proposal we sent last week. Do you have any questions?",
      time: "2:58 PM",
      sender: "received",
      read: true,
    },
    {
      id: 2,
      text: "The proposal looks good overall. I just need to review it with our team before making a decision.",
      time: "3:02 PM",
      sender: "sent",
      read: true,
    },
    {
      id: 3,
      text: "Great, please let me know if you need any additional information from our side.",
      time: "3:05 PM",
      sender: "received",
      read: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "sent",
      read: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/template-builder")}
          >
            <i className="fas fa-file"></i> New Document
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-download"></i> Download PDF
          </button>
        </div>
      </div>

      <div className="chat-thread">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.sender}`}>
            <div className="message-content">
              <p>{message.text}</p>
              <span className="chat-time">{message.time}</span>
            </div>
            {message.sender === "sent" && (
              <i
                className={`fas fa-check-double ${
                  message.read ? "read" : "unread"
                }`}
              ></i>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Write your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="chat-tools">
          <button className="tool-btn">
            <i className="fas fa-paperclip"></i>
          </button>
          <button className="send-btn" onClick={handleSendMessage}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main ProjectDetails Component
const ProjectDetails = ({ project, onClose }) => {
  if (!project) return null;

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
            <p className="recipient-name">
              {project.recipients?.[0]?.recipientName || "Unknown Client"}
            </p>
            <p className="recipient-email">
              {project.recipients?.[0]?.recipientEmail || "No email provided"}
            </p>
          </div>
          <span
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
          </span>
        </div>
      </div>

      <div className="project-details-content">
        <div className="details-panel">
          {/* Value Section */}
          <div className="details-section">
            <h4 className="section-heading">Value</h4>
            <div className="detail-item">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value">SEK 79.50 ex. VAT/Tax</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tax</span>
              <span className="detail-value">SEK 15.90</span>
            </div>
            <div className="detail-item total">
              <span className="detail-label">Total</span>
              <span className="detail-value">SEK 95.40</span>
            </div>
          </div>

          {/* Signee Section */}
          <div className="details-section">
            <h4 className="section-heading">Signees</h4>
            <div className="recipient-list">
              {project.recipients?.length > 0 ? (
                project.recipients.map((recipient, index) => (
                  <div key={index} className="recipient-item">
                    <div className="recipient-info">
                      <p className="recipient-name">
                        {recipient.recipientName}
                      </p>
                      <p className="recipient-email">
                        {recipient.recipientEmail}
                      </p>
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
            <h4 className="section-heading">Event Details</h4>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(project.createdAt || new Date()).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expires</span>
              <span className="detail-value">
                {new Date(
                  project.expirationDate || new Date()
                ).toLocaleDateString()}
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
          </div>
        </div>

        {/* Chat Section - Using the separate component */}
        <ChatSection />
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
        }
        
        .project-details-header {
          background-color: #314aff;
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
          padding: 8px 12px;
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
