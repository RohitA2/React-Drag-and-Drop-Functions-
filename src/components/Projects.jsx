import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectedUserId } from "../store/authSlice";
import Overview from "./pages/dashboard/OverView";
import { Eye, ArrowLeft } from "lucide-react";
import ProjectDetails from "./ProjectDetails";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Projects = () => {
  const userId = useSelector(selectedUserId);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOverview, setShowOverview] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/schedules/manage/${userId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Extract proposals for display
  const allProposals =
    userData?.groupedProposals?.flatMap((group) =>
      group.proposals.map((proposal) => ({
        ...proposal,
        parentId: group.parentId,
        recipients: group.recipients,
        schedules: group.schedules,
        signatures: group.signatures,
      }))
    ) || [];

  // Filter proposals based on status and search query
  const getFilteredProposals = () => {
    let filtered = allProposals;

    // Filter by status tab
    switch (activeTab) {
      case "sent":
        filtered = filtered.filter((proposal) =>
          proposal.recipients.some((recipient) => recipient.status === "sent")
        );
        break;
      case "signed":
        filtered = filtered.filter(
          (proposal) =>
            proposal.signatures &&
            proposal.signatures.some((sig) => sig.status === true)
        );
        break;
      case "denied":
        filtered = filtered.filter((proposal) =>
          proposal.recipients.some((recipient) => recipient.status === "denied")
        );
        break;
      default:
        // "all" tab - no filtering needed
        break;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (proposal) =>
          proposal.proposalName.toLowerCase().includes(query) ||
          proposal.recipients.some(
            (recipient) =>
              recipient.recipientName.toLowerCase().includes(query) ||
              recipient.recipientEmail.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  };

  const filteredProposals = getFilteredProposals();

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="app">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  // If overview view is active
  if (showOverview) {
    return (
      <div className="app">
        <div>
          <button onClick={() => setShowOverview(false)} className="btn-back">
            <ArrowLeft size={16} className="me-1 gap-1" />
            Back to Projects
          </button>
        </div>
        <Overview schedules={userData?.userSchedules || []} />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Project Details Sidebar - conditionally rendered */}
      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Main content - conditionally styled when sidebar is open */}
      <div className={`main-content ${selectedProject ? "with-sidebar" : ""}`}>
        <div className="filters">
          <div className="filter-tabs">
            <button
              className={activeTab === "all" ? "active" : ""}
              onClick={() => setActiveTab("all")}
            >
              All Projects
            </button>
            <button
              className={activeTab === "signed" ? "active" : ""}
              onClick={() => setActiveTab("signed")}
            >
              Signed
            </button>
            <button
              className={activeTab === "denied" ? "active" : ""}
              onClick={() => setActiveTab("denied")}
            >
              Denied
            </button>
          </div>

          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button
              className="btn-new"
              onClick={() => navigate("/template-builder")}
            >
              <i className="fas fa-plus"></i>
              New Project
            </button>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Proposal Name</th>
                <th>Client</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>
                      <div className="event-name">{proposal.proposalName}</div>
                    </td>
                    <td>
                      <div className="client-info">
                        {proposal.recipients &&
                        proposal.recipients.length > 0 ? (
                          <>
                            <div className="client-name">
                              {proposal.recipients[0].recipientName}
                              {proposal.recipients.length > 1 && (
                                <span className="recipient-count">
                                  +{proposal.recipients.length - 1} more
                                </span>
                              )}
                            </div>
                            <div className="client-email">
                              {proposal.recipients[0].recipientEmail}
                            </div>
                          </>
                        ) : (
                          <div className="no-recipient">No recipients</div>
                        )}
                      </div>
                    </td>
                    <td>
                      {new Date(proposal.expirationDate).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          proposal.signatures &&
                          proposal.signatures.some((sig) => sig.status)
                            ? "signed"
                            : proposal.recipients &&
                              proposal.recipients.some(
                                (r) => r.status === "denied"
                              )
                            ? "denied"
                            : "sent"
                        }`}
                      >
                        {proposal.signatures &&
                        proposal.signatures.some((sig) => sig.status)
                          ? "Signed"
                          : proposal.recipients &&
                            proposal.recipients.some(
                              (r) => r.status === "denied"
                            )
                          ? "Denied"
                          : "Sent"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          title="View Details"
                          onClick={() => {
                            setSelectedProject(proposal);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-projects">
                    <p>No projects found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7f9;
          color: #333;
        }
        
        .app {
          position: relative;
          padding: 10px;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        .main-content {
          transition: all 0.3s ease;
        }
        
        .main-content.with-sidebar {
          margin-right: 950px;
          overflow: hidden;
        }
        
        .loading, .error {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 18px;
        }
        
        .error {
          color: #c5221f;
        }
        
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .content-header h2 {
          font-size: 24px;
          font-weight: 600;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        /* Enhanced Button Styles */
        .btn-back {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(108, 117, 125, 0.2);
        }
        
        .btn-back:hover {
          background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(108, 117, 125, 0.3);
        }
        
        .btn-calendar {
          background: linear-gradient(135deg, #4a6cf7 0%, #3b5be3 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(74, 108, 247, 0.2);
        }
        
        .btn-calendar:hover {
          background: linear-gradient(135deg, #3b5be3 0%, #2a4bd8 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(74, 108, 247, 0.3);
        }
        
        .btn-new {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(40, 167, 69, 0.2);
        }
        
        .btn-new:hover {
          background: linear-gradient(135deg, #20c997 0%, #17a673 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(40, 167, 69, 0.3);
        }
        
        .btn-primary i, .btn-secondary i, .btn-back i, .btn-calendar i, .btn-new i {
          margin-right: 8px;
        }
        
        .filters {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .filter-tabs {
          display: flex;
          background-color: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .filter-tabs button {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .filter-tabs button:hover {
          background-color: #f8f9fa;
        }
        
        .filter-tabs button.active {
          background: linear-gradient(135deg, #4a6cf7 0%, #3b5be3 100%);
          color: white;
        }
        
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-box input {
          padding: 10px 15px 10px 35px;
          border: 1px solid #e1e4e8;
          border-radius: 8px;
          font-size: 14px;
          width: 250px;
          transition: all 0.3s ease;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #4a6cf7;
          box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
        }
        
        .search-box i {
          position: absolute;
          left: 12px;
          color: #6c757d;
        }
        
        /* Data Table Styles */
        .data-table-container {
          background-color: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th {
          background-color: #f8f9fa;
          padding: 16px 20px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .data-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .data-table tr:last-child td {
          border-bottom: none;
        }
        
        .data-table tr:hover {
          background-color: #f8f9fa;
        }
        
        .event-name {
          font-weight: 500;
          color: #212529;
        }
        
        .client-info {
          display: flex;
          flex-direction: column;
        }
        
        .client-name {
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #212529;
        }
        
        .recipient-count {
          font-size: 11px;
          color: #6c757d;
          background-color: #f0f2f5;
          padding: 2px 6px;
          border-radius: 10px;
        }
        
        .client-email {
          font-size: 12px;
          color: #6c757d;
        }
        
        .no-recipient {
          color: #6c757d;
          font-style: italic;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
        }
        
        .status-badge.sent {
          background-color: #e8f4ff;
          color: #1a73e8;
        }
        
        .status-badge.signed {
          background-color: #e6f4ea;
          color: #138a4f;
        }
        
        .status-badge.denied {
          background-color: #fce8e6;
          color: #c5221f;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .btn-view {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .btn-view {
          color: #4a6cf7;
          background-color: rgba(74, 108, 247, 0.1);
        }
        
        .btn-view:hover {
          background-color: rgba(74, 108, 247, 0.2);
          transform: scale(1.1);
        }
        
        .no-projects {
          padding: 30px;
          text-align: center;
          color: #6c757d;
        }
        
        @media (max-width: 992px) {
          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: flex-end;
          }
          
          .filters {
            flex-direction: column;
            gap: 15px;
          }
          
          .search-box input {
            width: 100%;
          }
          
          .data-table {
            display: block;
            overflow-x: auto;
          }
          
          .main-content.with-sidebar {
            margin-right: 0;
          }
        }
        
        @media (max-width: 1200px) {
          .main-content.with-sidebar {
            margin-right: 0;
            opacity: 0.3;
            pointer-events: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;
