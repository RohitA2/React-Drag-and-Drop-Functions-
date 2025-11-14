import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectedUserId } from "../store/authSlice";
import { Eye, Edit, CalendarPlus, Bell } from "lucide-react";
import ProjectDetails from "./ProjectDetails";
import { useNavigate } from "react-router-dom";
import Loader from "./Forms/Loader";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const Projects = () => {
  const userId = useSelector(selectedUserId);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/schedules/manage/${userId}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Live Countdown
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const updated = {};
      allProposals.forEach(p => {
        const expiry = new Date(p.expirationDate);
        const diff = expiry - now;
        if (diff <= 0) {
          updated[p.id] = "Expired";
        } else {
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          updated[p.id] = `${d}d ${h}h ${m}m left`;
        }
      });
      setCountdowns(updated);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [userData]);

  const allProposals =
    userData?.groupedProposals?.flatMap(group =>
      group.proposals.map(p => ({
        ...p,
        parentId: group.parentId,
        recipients: group.recipients,
        schedules: group.schedules,
        signatures: group.signatures,
      }))
    ) || [];

  const getFilteredProposals = () => {
    let list = allProposals;

    switch (activeTab) {
      case "signed":
        list = list.filter(p => p.signatures?.some(s => s.status));
        break;
      case "not-signed":
        list = list.filter(p => !p.signatures?.some(s => s.status));
        break;
      case "declined":
        list = list.filter(p => p.recipients?.some(r => r.status === "denied"));
        break;
      case "not-scheduled":
        list = list.filter(p => !p.schedules || p.schedules.length === 0);
        break;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.proposalName.toLowerCase().includes(q) ||
        p.recipients?.some(r =>
          r.recipientName?.toLowerCase().includes(q) ||
          r.recipientEmail?.toLowerCase().includes(q)
        )
      );
    }
    return list;
  };

  const filteredProposals = getFilteredProposals();

  const openEditMode = (project) => {
    navigate("/template-builder", {
      state: { editProject: project, projectId: project.id, parentId: project.parentId },
    });
  };

  const sendReminder = async (proposalId) => {
    try {
      const project = allProposals.find(p => p.id === proposalId);
      if (!project) {
        alert("Project not found");
        return;
      }

      const clientNames = project.recipients
        ?.map(r => r.recipientName || "Unknown")
        .filter(Boolean)
        .join(", ") || "Client";

      const clientEmails = project.recipients
        ?.map(r => r.recipientEmail)
        .filter(Boolean)
        .join(", ") || "";

      const expiry = new Date(project.expirationDate);
      const expiryFormatted = expiry.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      await fetch(`${API_URL}/api/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          proposalName: project.proposalName,
          expiryTime: expiryFormatted,
          clientNames,
          clientEmails,
        }),
      });
      toast.success("Reminder sent successfully");
    } catch (err) {
      console.error("Reminder failed:", err);
      toast.error("Failed to send reminder");
    }
  };

  // NEW STATUS: Signed / Not Signed / Declined
  const getStatus = (p) => {
    if (p.signatures?.some(s => s.status)) {
      return { text: "Signed", cls: "signed" };
    }
    if (p.recipients?.some(r => r.status === "denied")) {
      return { text: "Declined", cls: "declined" };
    }
    return { text: "Not Signed", cls: "not-signed" };
  };

  if (loading) return <Loader />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      {selectedProject && (
        <ProjectDetails project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      <div className={`main-content ${selectedProject ? "with-sidebar" : ""}`}>
        <div className="filters">
          <div className="filter-tabs">
            {["all", "signed", "not-signed", "declined", "not-scheduled"].map(tab => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button
              className="btn-new"
              onClick={() => navigate("/template-builder", { state: { newProject: true } })}
            >
              <i className="fas fa-plus"></i> New Project
            </button>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Proposal Name</th>
                <th>Client</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.length > 0 ? (
                filteredProposals.map(p => {
                  const status = getStatus(p);
                  const isNotScheduled = !p.schedules || p.schedules.length === 0;
                  const isNotSigned = status.cls === "not-signed";

                  return (
                    <tr key={p.id}>
                      <td><div className="event-name">{p.proposalName}</div></td>
                      <td>
                        <div className="client-info">
                          {p.recipients?.[0] ? (
                            <>
                              <div className="client-name">
                                {p.recipients[0].recipientName}
                                {p.recipients.length > 1 && (
                                  <span className="recipient-count">+{p.recipients.length - 1}</span>
                                )}
                              </div>
                              <div className="client-email">{p.recipients[0].recipientEmail}</div>
                            </>
                          ) : (
                            <div className="no-recipient">—</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="countdown">
                          {countdowns[p.id] || "—"}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${status.cls}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-view" onClick={() => setSelectedProject(p)}>
                            <Eye size={16} />
                          </button>
                          <button className="btn-edit" onClick={() => openEditMode(p)}>
                            <Edit size={16} />
                          </button>

                          {/* CALENDAR: Only if NOT scheduled */}
                          {isNotScheduled && (
                            <button
                              className="btn-calendar"
                              title="Schedule Now"
                              onClick={() => openEditMode(p)}
                            >
                              <CalendarPlus size={16} />
                            </button>
                          )}

                          {/* BELL: Only if NOT signed */}
                          {isNotSigned && (
                            <button
                              className="btn-bell"
                              title="Send Reminder"
                              onClick={() => sendReminder(p.id)}
                            >
                              <Bell size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        
        .filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
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
          white-space: nowrap;
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
          flex: 1;
          max-width: 300px;
        }
        
        .search-box input {
          padding: 10px 15px 10px 35px;
          border: 1px solid #e1e4e8;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
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
          z-index: 1;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .btn-new {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
          white-space: nowrap;
        }
        
        .btn-new:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }
        
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
        
        .countdown {
          font-size: 12px;
          font-weight: 600;
          color: #d32f2f;
          background: #ffebee;
          padding: 4px 8px;
          border-radius: 12px;
          white-space: nowrap;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
          white-space: nowrap;
        }
        
        .status-badge.signed {
          background-color: #e6f4ea;
          color: #138a4f;
        }
        
        .status-badge.not-signed {
          background-color: #e8f4ff;
          color: #1a73e8;
        }
        
        .status-badge.declined {
          background-color: #fce8e6;
          color: #c5221f;
        }
        
        .action-buttons {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        
        .btn-view, .btn-edit, .btn-calendar, .btn-bell {
          background: none;
          border: none;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .btn-view {
          color: #4a6cf7;
          background-color: rgba(74, 108, 247, 0.1);
        }
        
        .btn-view:hover {
          background-color: rgba(74, 108, 247, 0.2);
          transform: scale(1.05);
        }
        
        .btn-edit {
          color: #28a745;
          background-color: rgba(40, 167, 69, 0.1);
        }
        
        .btn-edit:hover {
          background-color: rgba(40, 167, 69, 0.2);
          transform: scale(1.05);
        }
        
        .btn-calendar {
          color: #1976d2;
          background-color: rgba(25, 118, 210, 0.1);
        }
        
        .btn-calendar:hover {
          background-color: rgba(25, 118, 210, 0.2);
          transform: scale(1.05);
        }
        
        .btn-bell {
          color: #2e7d32;
          background-color: rgba(46, 125, 50, 0.1);
        }
        
        .btn-bell:hover {
          background-color: rgba(46, 125, 50, 0.2);
          transform: scale(1.05);
        }
        
        .no-projects {
          padding: 30px;
          text-align: center;
          color: #6c757d;
        }
        
        @media (max-width: 992px) {
          .filters {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            max-width: 100%;
          }
          
          .header-actions {
            justify-content: flex-end;
          }
          
          .main-content.with-sidebar {
            margin-right: 0;
          }
          
          .data-table {
            display: block;
            overflow-x: auto;
          }
        }
        
        @media (max-width: 768px) {
          .filter-tabs {
            flex-wrap: wrap;
          }
          
          .filter-tabs button {
            flex: 1;
            min-width: 120px;
            text-align: center;
          }
          
          .action-buttons {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
        
        @media (max-width: 1200px) {
          .main-content.with-sidebar {
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;