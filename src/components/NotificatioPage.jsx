import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, X, Clock } from "lucide-react";
import { Container, Row, Col, Card, Badge, Button, OverlayTrigger, Tooltip, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectedUserId } from "../store/authSlice"; // Assuming Redux for user ID
const API_URL = import.meta.env.VITE_API_URL;
const NotificationsPage = () => {
    const userId = useSelector(selectedUserId);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/notifications/AllNotifications?userId=${userId}`);
            if (!response.ok) throw new Error("Failed to fetch notifications");
            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const response = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Failed to mark as read");
            const updatedNotification = await response.json();
            setNotifications((prev) =>
                prev.map((notif) => (notif.id === id ? updatedNotification : notif))
            );
        } catch (err) {
            alert("Failed to mark as read");
        }
    };

    const deleteNotification = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) return;
        try {
            const response = await fetch(`${API_URL}/notifications/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete notification");
            setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        } catch (err) {
            alert("Failed to delete notification");
        }
    };

    const getTypeIconAndColor = (type) => {
        switch (type) {
            case "success":
                return { icon: CheckCircle, color: "success" };
            case "warning":
                return { icon: AlertTriangle, color: "warning" };
            case "info":
            default:
                return { icon: Info, color: "info" };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={fetchNotifications} variant="outline-primary">
                    Retry
                </Button>
            </Container>
        );
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <Container fluid className="py-4 bg-light min-vh-100">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                            <Bell size={32} className="me-3 text-primary" />
                            <div>
                                <h1 className="mb-1 fw-bold">Notifications</h1>
                                {unreadCount > 0 && (
                                    <Badge bg="danger" className="fs-6">
                                        {unreadCount} unread
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button variant="outline-primary" onClick={fetchNotifications}>
                            <Clock size={16} className="me-1" /> Refresh
                        </Button>
                    </div>

                    {notifications.length === 0 ? (
                        <Card className="text-center py-5 bg-white shadow-sm">
                            <Bell size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No notifications yet</h5>
                            <p className="text-muted">You'll see updates here when something happens.</p>
                        </Card>
                    ) : (
                        <div className="notification-list">
                            {notifications.map((notification) => {
                                const { icon: Icon, color } = getTypeIconAndColor(notification.type);
                                const isUnread = !notification.isRead;

                                return (
                                    <Card
                                        key={notification.id}
                                        className={`mb-3 shadow-sm border-0 transition-all ${isUnread ? "border-start border-primary border-3" : ""
                                            }`}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <Card.Body className="p-4">
                                            <div className="d-flex align-items-start justify-content-between">
                                                <div className="d-flex align-items-start grow">
                                                    <div className={`p-2 rounded-circle bg-${color} bg-opacity-10 me-3 mt-1 shrink-0`}>
                                                        <Icon size={20} className={`text-${color}`} />
                                                    </div>
                                                    <div className="grow">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className={`mb-1 ${isUnread ? "fw-bold text-dark" : "text-muted"}`}>
                                                                {notification.title}
                                                            </h6>
                                                            {isUnread && (
                                                                <div className="shrink-0">
                                                                    <div
                                                                        className="rounded-circle bg-primary"
                                                                        style={{ width: "8px", height: "8px" }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className={`mb-2 ${isUnread ? "text-dark" : "text-muted"}`}>
                                                            {notification.message}
                                                        </p>
                                                        <small className="text-muted d-flex align-items-center">
                                                            <Clock size={12} className="me-1" />
                                                            {formatDate(notification.createdAt)}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 ms-3">
                                                    {isUnread && (
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>Mark as read</Tooltip>}
                                                        >
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="p-0 text-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(notification.id);
                                                                }}
                                                            >
                                                                <CheckCircle size={20} />
                                                            </Button>
                                                        </OverlayTrigger>
                                                    )}
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Delete</Tooltip>}
                                                    >
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 text-danger ms-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                        >
                                                            <X size={20} />
                                                        </Button>
                                                    </OverlayTrigger>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </Col>
            </Row>

            <style>{`
        .notification-list {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .border-primary.border-3 {
          border-left: 3px solid #0d6efd !important;
        }

        .min-vh-100 {
          min-height: 100vh;
        }
      `}</style>
        </Container>
    );
};

export default NotificationsPage;