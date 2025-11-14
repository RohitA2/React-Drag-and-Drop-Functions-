import React, { useState } from "react";
import { X, Copy, ExternalLink, Calendar, Edit, Save, X as CloseIcon, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectedUserId } from "../store/authSlice";
import ChatSection from "./ChatSection";
import { Button, OverlayTrigger, Tooltip, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const ProjectDetails = ({ project, onClose }) => {
  if (!project) return null;
  console.log("project", project);

  // State to track selected recipient
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  // State for updating expiration date
  const [updatingExpiration, setUpdatingExpiration] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newExpirationDate, setNewExpirationDate] = useState(
    project.expirationDate ? new Date(project.expirationDate).toISOString().split('T')[0] : ''
  );

  // State for schedule management
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [updatingSchedule, setUpdatingSchedule] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    date: '',
    time: '',
    comment: '',
    description: '',
    location: ''
  });

  const selectedRecipient =
    project.recipients?.[selectedRecipientIndex] || project.recipients?.[0];

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateExpiration = async () => {
    if (!newExpirationDate) {
      alert("Please select a new expiration date.");
      return;
    }

    setUpdatingExpiration(true);
    try {
      const response = await fetch(`${API_URL}/api/updateExpireDate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalEmailId: project.id,
          newExpirationDate: new Date(newExpirationDate).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update expiration date');
      }

      const data = await response.json();
      if (data.success) {
        project.expirationDate = new Date(newExpirationDate).toISOString();
        setShowUpdateForm(false);
        toast.success('Expiration date updated successfully');
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating expiration:', error);
      toast.error('Failed to update expiration date');
    } finally {
      setUpdatingExpiration(false);
    }
  };

  // Schedule functions
  const handleCreateSchedule = () => {
    setIsCreatingSchedule(true);
    setEditingSchedule(null);
    setScheduleFormData({
      date: '',
      time: '',
      comment: '',
      description: '',
      location: ''
    });
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setIsCreatingSchedule(false);
    setEditingSchedule(schedule.id);
    setScheduleFormData({
      date: schedule.date,
      time: schedule.time.split(':').slice(0, 2).join(':'), // Remove seconds if present
      comment: schedule.comment || '',
      description: schedule.description || '',
      location: schedule.location || ''
    });
    setShowScheduleModal(true);
  };

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setEditingSchedule(null);
    setIsCreatingSchedule(false);
    setScheduleFormData({
      date: '',
      time: '',
      comment: '',
      description: '',
      location: ''
    });
  };

  const handleSaveSchedule = async () => {
    if (!scheduleFormData.date || !scheduleFormData.time) {
      toast.error('Date and time are required');
      return;
    }

    setUpdatingSchedule(true);
    try {
      const url = isCreatingSchedule 
        ? `${API_URL}/schedules/createSchedule`
        : `${API_URL}/schedules/updateSchedule`;

      const body = isCreatingSchedule
        ? {
            parentId: project.parentId || project.id,
            date: scheduleFormData.date,
            time: scheduleFormData.time + ':00',
            comment: scheduleFormData.comment,
            description: scheduleFormData.description,
            location: scheduleFormData.location
          }
        : {
            scheduleId: editingSchedule,
            date: scheduleFormData.date,
            time: scheduleFormData.time + ':00',
            comment: scheduleFormData.comment,
            description: scheduleFormData.description,
            location: scheduleFormData.location
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isCreatingSchedule ? 'create' : 'update'} schedule`);
      }

      const data = await response.json();
      if (data.success) {
        if (isCreatingSchedule) {
          // Add new schedule to the project data
          const newSchedule = {
            id: data.scheduleId,
            ...scheduleFormData,
            time: scheduleFormData.time + ':00'
          };
          project.schedules = [...(project.schedules || []), newSchedule];
          toast.success('Schedule created successfully');
        } else {
          // Update existing schedule in the project data
          const updatedSchedules = project.schedules.map(schedule =>
            schedule.id === editingSchedule
              ? { ...schedule, ...scheduleFormData, time: scheduleFormData.time + ':00' }
              : schedule
          );
          project.schedules = updatedSchedules;
          toast.success('Schedule updated successfully');
        }
        
        handleCloseScheduleModal();
      } else {
        throw new Error(data.error || `${isCreatingSchedule ? 'Creation' : 'Update'} failed`);
      }
    } catch (error) {
      console.error(`Error ${isCreatingSchedule ? 'creating' : 'updating'} schedule:`, error);
      toast.error(`Failed to ${isCreatingSchedule ? 'create' : 'update'} schedule`);
    } finally {
      setUpdatingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/schedules/deleteSchedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleId: scheduleId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      const data = await response.json();
      if (data.success) {
        // Remove schedule from the project data
        project.schedules = project.schedules.filter(schedule => schedule.id !== scheduleId);
        toast.success('Schedule deleted successfully');
      } else {
        throw new Error(data.error || 'Deletion failed');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleScheduleInputChange = (field, value) => {
    setScheduleFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatDisplayTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get unique key for recipients
  const getRecipientKey = (recipient, index) => {
    return recipient.id || `recipient-${recipient.recipientEmail}-${index}`;
  };

  // Get unique key for schedules
  const getScheduleKey = (schedule) => {
    return `schedule-${schedule.id}-${schedule.date}-${schedule.time}`;
  };

  return (
    <div className="project-details-sidebar">
      <div className="project-details-header">
        <div className="header-top">
          <h2 className="header-title">{project.proposalName}</h2>
          <div className="header-actions">
            <button className="close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="header-bottom">
          <div className="recipient-info">
            {/* Recipient info remains the same */}
          </div>
        </div>
      </div>

      <div className="project-details-content">
        <div className="details-panel">
          {/* Schedule Section */}
          <div className="details-section">
            <div className="section-header">
              <h4 className="section-heading">Schedules</h4>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateSchedule}
                className="add-schedule-btn"
              >
                <Plus size={14} className="me-1" />
                Add Schedule
              </Button>
            </div>
            
            {project.schedules && project.schedules.length > 0 ? (
              <div className="schedule-list">
                {project.schedules.map((schedule) => (
                  <div key={getScheduleKey(schedule)} className="schedule-item">
                    <div className="schedule-content">
                      <div className="schedule-date-time">
                        <div className="schedule-date">
                          <Calendar size={16} />
                          <span>{formatDisplayDate(schedule.date)}</span>
                        </div>
                        <div className="schedule-time">
                          {formatDisplayTime(schedule.time)}
                        </div>
                      </div>

                      {(schedule.comment || schedule.description || schedule.location) && (
                        <div className="schedule-details">
                          {schedule.comment && (
                            <div className="schedule-field">
                              <strong>Comment:</strong> {schedule.comment}
                            </div>
                          )}
                          {schedule.description && (
                            <div className="schedule-field">
                              <strong>Description:</strong> {schedule.description}
                            </div>
                          )}
                          {schedule.location && (
                            <div className="schedule-field">
                              <strong>Location:</strong> {schedule.location}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="schedule-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditSchedule(schedule)}
                        className="schedule-edit-btn"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="schedule-delete-btn ms-1"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-schedules">
                <Calendar size={32} className="mb-2" />
                <p>No schedules found</p>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleCreateSchedule}
                >
                  <Plus size={14} className="me-1" />
                  Create First Schedule
                </Button>
              </div>
            )}
          </div>

          {/* Signee Section */}
          <div className="details-section">
            <h4 className="section-heading">Signees</h4>
            <div className="recipient-list">
              {project.recipients?.length > 0 ? (
                project.recipients.map((recipient, index) => (
                  <div
                    key={getRecipientKey(recipient, index)}
                    className={`recipient-item ${index === selectedRecipientIndex ? "selected" : ""}`}
                    onClick={() => setSelectedRecipientIndex(index)}
                    style={{
                      cursor: "pointer",
                      border: index === selectedRecipientIndex ? "2px solid #4a6cf7" : "none",
                    }}
                  >
                    <div className="recipient-info">
                      <p className="recipient-name">{recipient.recipientName}</p>
                      <div className="d-flex align-items-center">
                        <p className="recipient-email me-2">{recipient.recipientEmail}</p>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{copiedField === `email-${index}` ? 'Copied!' : 'Copy email'}</Tooltip>}
                        >
                          <Button
                            variant="link"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(recipient.recipientEmail, `email-${index}`);
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
                            overlay={<Tooltip>{copiedField === `phone-${index}` ? 'Copied!' : 'Copy phone'}</Tooltip>}
                          >
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(recipient.recipientDetails.phone, `phone-${index}`);
                              }}
                            >
                              <Copy size={14} />
                            </Button>
                          </OverlayTrigger>
                        )}
                      </div>
                    </div>
                    <span
                      className={`recipient-status ${recipient.status === "denied"
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
                {new Date(project.expirationDate || new Date()).toLocaleDateString()}
              </span>
              {!showUpdateForm && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowUpdateForm(true)}
                  className="ms-2"
                >
                  <Calendar size={14} />
                </Button>
              )}
            </div>
            {showUpdateForm && (
              <div className="detail-item">
                <span className="detail-label">Update Expiration</span>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="date"
                    value={newExpirationDate}
                    onChange={(e) => setNewExpirationDate(e.target.value)}
                    style={{ minWidth: '150px' }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdateExpiration}
                    disabled={updatingExpiration}
                  >
                    {updatingExpiration ? 'Updating...' : 'Update'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setNewExpirationDate(
                        project.expirationDate ? new Date(project.expirationDate).toISOString().split('T')[0] : ''
                      );
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span
                className={`detail-value status ${project.signatures?.some((sig) => sig.status)
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

        {/* Chat Section */}
        <ChatSection
          recipientPhone={selectedRecipient?.recipientDetails?.phone}
          recipientName={selectedRecipient?.recipientName}
        />
      </div>

      {/* Schedule Update Modal */}
      <Modal show={showScheduleModal} onHide={handleCloseScheduleModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isCreatingSchedule ? 'Create New Schedule' : 'Update Schedule'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date *</Form.Label>
              <Form.Control
                type="date"
                value={scheduleFormData.date}
                onChange={(e) => handleScheduleInputChange('date', e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time *</Form.Label>
              <Form.Control
                type="time"
                value={scheduleFormData.time}
                onChange={(e) => handleScheduleInputChange('time', e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                type="text"
                value={scheduleFormData.comment}
                onChange={(e) => handleScheduleInputChange('comment', e.target.value)}
                placeholder="Enter comment"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={scheduleFormData.description}
                onChange={(e) => handleScheduleInputChange('description', e.target.value)}
                placeholder="Enter description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={scheduleFormData.location}
                onChange={(e) => handleScheduleInputChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseScheduleModal}>
            <CloseIcon size={14} className="me-1" /> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveSchedule}
            disabled={updatingSchedule}
          >
            {updatingSchedule ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {isCreatingSchedule ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save size={14} className="me-1" />
                {isCreatingSchedule ? 'Create Schedule' : 'Update Schedule'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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

        .close-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .close-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
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

        .details-section {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-heading {
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .add-schedule-btn {
          display: flex;
          align-items: center;
        }

        /* Schedule Styles */
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          background-color: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #4364EE;
          transition: all 0.2s;
        }

        .schedule-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .schedule-content {
          flex: 1;
        }

        .schedule-date-time {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .schedule-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2d3748;
        }

        .schedule-time {
          color: #4a5568;
          font-weight: 500;
        }

        .schedule-details {
          margin-top: 8px;
        }

        .schedule-field {
          margin-bottom: 4px;
          font-size: 14px;
          color: #4a5568;
        }

        .schedule-field strong {
          color: #2d3748;
        }

        .schedule-actions {
          display: flex;
          gap: 4px;
        }

        .schedule-edit-btn,
        .schedule-delete-btn {
          padding: 4px 8px;
        }

        .no-schedules {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .no-schedules p {
          margin-bottom: 16px;
        }

        /* Existing styles remain the same */
        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 8px 0;
          align-items: center;
        }

        .detail-label {
          color: #4a5568;
          font-size: 14px;
        }

        .detail-value {
          color: #1a202c;
          font-weight: 500;
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
        }

        .gap-2 > * + * {
          margin-left: 0.5rem;
        }
          
      `}</style>
    </div>
  );
};

export default ProjectDetails;