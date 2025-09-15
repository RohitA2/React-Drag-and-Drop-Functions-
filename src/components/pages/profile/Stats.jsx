import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";
const API_URL = import.meta.env.VITE_API_URL;

const Stats = () => {
  const userId = useSelector(selectedUserId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, you would replace this with your actual API endpoint
        const response = await fetch(`${API_URL}/schedules/manage/${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading proposal data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalProposals = data.groupedProposals.length;
  const totalRecipients = data.groupedProposals.reduce(
    (acc, group) => acc + group.recipients.length,
    0
  );
  const sentProposals = data.groupedProposals.filter((group) =>
    group.recipients.some((recipient) => recipient.status === "sent")
  ).length;

  const signedProposals = data.groupedProposals.filter(
    (group) =>
      group.signatures && group.signatures.some((sig) => sig.status === true)
  ).length;

  const scheduledMeetings = data.userSchedules ? data.userSchedules.length : 0;

  // Get recent proposals (last 5)
  const recentProposals = [...data.groupedProposals]
    .sort((a, b) => {
      const dateA = new Date(a.proposals[0]?.createdAt || 0);
      const dateB = new Date(b.proposals[0]?.createdAt || 0);
      return dateB - dateA;
    })
    .slice(0, 5);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="stats-container">
      <div className="stats-header">
        {/* <h1>Proposal Dashboard</h1> */}
        <p>
          Welcome back, {data.user.firstName}! Here's your Proposals Dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon proposal-icon">
            <i className="fas fa-file-contract"></i>
          </div>
          <div className="stat-content">
            <h3>{totalProposals}</h3>
            <p>Total Proposals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon recipient-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{totalRecipients}</h3>
            <p>Recipients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sent-icon">
            <i className="fas fa-paper-plane"></i>
          </div>
          <div className="stat-content">
            <h3>{sentProposals}</h3>
            <p>Sent</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon signed-icon">
            <i className="fas fa-signature"></i>
          </div>
          <div className="stat-content">
            <h3>{signedProposals}</h3>
            <p>Signed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon schedule-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{scheduledMeetings}</h3>
            <p>Scheduled Meetings</p>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Proposals</h2>
        <div className="proposals-list">
          {recentProposals.map((group, index) => (
            <div key={index} className="proposal-item">
              <div className="proposal-info">
                <h4>
                  {group.proposals[0]?.proposalName || "Unnamed Proposal"}
                </h4>
                <p>Expires: {formatDate(group.proposals[0]?.expirationDate)}</p>

                {/* Show all recipients */}
                <div className="recipients-list">
                  {group.recipients.map((recipient) => (
                    <div key={recipient.id} className="recipient-item">
                      <p>
                        <strong>{recipient.recipientName}</strong> (
                        {recipient.recipientEmail}) -{" "}
                        <span
                          className={`recipient-status ${
                            recipient.status === "sent"
                              ? "status-sent"
                              : recipient.status === "signed"
                              ? "status-signed"
                              : "status-pending"
                          }`}
                        >
                          {recipient.status}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="proposal-status">
                {group.signatures &&
                group.signatures.some((sig) => sig.status) ? (
                  <span className="status-badge signed">Signed</span>
                ) : (
                  <span className="status-badge pending">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .stats-container {
          padding: 24px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .stats-header {
          margin-bottom: 32px;
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .stats-header h1 {
          font-size: 2.2rem;
          margin-bottom: 8px;
          color: #2c3e50;
        }

        .stats-header p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 24px;
          color: white;
        }

        .proposal-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .recipient-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .sent-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .signed-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .schedule-icon {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        .stat-content h3 {
          font-size: 2rem;
          margin: 0 0 5px 0;
          color: #2c3e50;
        }

        .stat-content p {
          margin: 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .recent-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .recent-section h2 {
          margin-top: 0;
          color: #2c3e50;
          padding-bottom: 16px;
          border-bottom: 1px solid #ecf0f1;
        }

        .proposals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .proposal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          background: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .proposal-item:hover {
          background: #e9ecef;
        }

        .proposal-info h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
        }

        .proposal-info p {
          margin: 4px 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.signed {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.pending {
          background: #ffecb3;
          color: #f57c00;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
        }

        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .error-message i {
          font-size: 3rem;
          color: #e74c3c;
          margin-bottom: 16px;
        }

        .error-message h3 {
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .error-message p {
          color: #7f8c8d;
          margin-bottom: 20px;
        }

        .error-message button {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease;
        }

        .error-message button:hover {
          background: #5a6fd5;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
          }

          .stat-icon {
            margin-right: 0;
            margin-bottom: 10px;
          }

          .proposal-item {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
          .recipients-list {
            margin-top: 8px;
          }

          .recipient-item {
            font-size: 0.85rem;
            color: #555;
            margin: 2px 0;
          }

          .recipient-status {
            font-weight: 600;
            text-transform: capitalize;
          }

          .status-sent {
            color: #007bff;
          }

          .status-signed {
            color: #28a745;
          }

          .status-pending {
            color: #f57c00;
          }
        }
      `}</style>

      {/* Add Font Awesome for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      />
    </div>
  );
};

export default Stats;
