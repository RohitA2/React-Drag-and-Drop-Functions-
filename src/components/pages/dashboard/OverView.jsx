import React, { useState, useEffect } from "react";
import { Card, Button, Container, Row, Col, Badge } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSelector } from "react-redux";
import { parse, format } from "date-fns";
import { selectedUserId } from "../../../store/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

export default function OverView() {
  const userId = useSelector(selectedUserId);
  const [value, setValue] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState({
    start: null,
    end: null,
    weekNumber: null,
  });
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // day | week | month

  // Fetch schedule data from API
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/schedules/user/${userId}`);
        if (!response.ok) {
          setError("Failed to fetch schedule data");
          throw new Error("Failed to fetch schedule data");
        }
        const data = await response.json();
        console.log("response from api", data);
        if (data.success) {
          // Data is now a flat array, not nested under data.schedules
          setScheduleData(Array.isArray(data.data) ? data.data : []);
        } else {
          setScheduleData([]);
          console.warn("API returned unsuccessful response:", data.message);
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
        setError(error.message);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [userId]);

  // Week calculations
  const getWeekRange = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const firstDayOfYear = new Date(startOfWeek.getFullYear(), 0, 1);
    const pastDaysOfYear = (startOfWeek - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );

    return { start: startOfWeek, end: endOfWeek, weekNumber };
  };

  const generateDaysOfWeek = (startDate) => {
    const days = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDate);
      days.push(day);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  useEffect(() => {
    const weekRange = getWeekRange(value);
    setCurrentWeek(weekRange);
    setDaysOfWeek(generateDaysOfWeek(weekRange.start));
  }, [value]);

  // Formatters
  const formatDate = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[date.getDay()]} ${date.getDate()}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "Loading...";
    const startMonth = start.toLocaleString("default", { month: "short" });
    const endMonth = end.toLocaleString("default", { month: "short" });

    if (startMonth === endMonth) {
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}, ${start.getFullYear()} (Week ${
        currentWeek.weekNumber
      })`;
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}, ${start.getFullYear()} (Week ${
      currentWeek.weekNumber
    })`;
  };

  // Get events for specific date
  const getEventsForDate = (date) => {
    // Local date string instead of UTC ISO
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return scheduleData.filter((event) => event.date === dateStr);
  };

  // Get events for current view
  const getFilteredEvents = () => {
    if (!scheduleData.length) return [];

    if (viewMode === "day") {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      return scheduleData.filter((event) => event.date === todayStr);
    } else if (viewMode === "week") {
      const { start, end } = currentWeek;
      return scheduleData.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });
    } else {
      const month = value.getMonth();
      const year = value.getFullYear();
      return scheduleData.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getMonth() === month && eventDate.getFullYear() === year
        );
      });
    }
  };

  const filteredEvents = getFilteredEvents();

  // Generate month grid cells
  const generateMonthGrid = () => {
    const firstDay = new Date(value.getFullYear(), value.getMonth(), 1);
    const lastDay = new Date(value.getFullYear(), value.getMonth() + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const grid = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDay; i++) {
      grid.push({ date: null, events: [] });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(value.getFullYear(), value.getMonth(), day);
      const events = getEventsForDate(currentDate);
      grid.push({ date: currentDate, events });
    }

    // Fill remaining cells to complete the grid (42 cells total)
    while (grid.length < 42) {
      grid.push({ date: null, events: [] });
    }

    return grid;
  };

  // Get event display text
  const getEventDisplayText = (event) => {
    if (event.proposalEmail) {
      return event.proposalEmail.proposalName || "Proposal";
    }
    return "Scheduled Event";
  };

  // Get event badge color
  const getEventBadgeColor = (event) => {
    return event.proposalEmail ? "success" : "primary";
  };

  return (
    <Container fluid className="overview-container p-3">
      <Row>
        {/* Sidebar */}
        <Col xs={12} lg={3} className="mb-4">
          <Card className="shadow-lg border-0 h-100 sidebar-card">
            <Card.Body>
              <h5 className="mb-4 fw-bold text-dark">Calendar</h5>
              <Calendar
                onChange={setValue}
                value={value}
                className="shadow-sm rounded-lg border-0 modern-calendar"
              />
              <div className="mt-4">
                <h6 className="fw-semibold">Summary</h6>
                <div className="small text-muted">
                  Total Events: {scheduleData.length}
                </div>
                <div className="small text-muted">
                  This {viewMode}: {filteredEvents.length}
                </div>
                <div className="mt-2">
                  <Badge bg="primary" className="me-2 mb-1">
                    Event
                  </Badge>
                  <Badge bg="success" className="me-2 mb-1">
                    Proposal
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={12} lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark">
              {viewMode === "week"
                ? formatDateRange(currentWeek.start, currentWeek.end)
                : value.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
            </h4>
            <div className="d-flex gap-2">
              <Button
                variant={viewMode === "day" ? "dark" : "light"}
                size="sm"
                onClick={() => setViewMode("day")}
              >
                Day
              </Button>
              <Button
                variant={viewMode === "week" ? "dark" : "light"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Week
              </Button>
              <Button
                variant={viewMode === "month" ? "dark" : "light"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Month
              </Button>
            </div>
          </div>

          {error ? (
            <div className="alert alert-danger">Error loading: {error}</div>
          ) : loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Month View */}
              {viewMode === "month" && (
                <Card className="shadow-lg border-0">
                  <Card.Body className="p-0">
                    <div className="month-grid">
                      {/* Week days header */}
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="month-header text-center fw-bold"
                          >
                            {day}
                          </div>
                        )
                      )}

                      {/* Calendar cells */}
                      {generateMonthGrid().map((cell, index) => (
                        <div
                          key={index}
                          className={`month-cell ${
                            cell.date
                              ? cell.date.getMonth() === value.getMonth()
                                ? "current-month"
                                : "other-month"
                              : "empty"
                          } ${cell.events.length > 0 ? "has-events" : ""}`}
                        >
                          {cell.date && (
                            <>
                              <div className="date-number">
                                {cell.date.getDate()}
                              </div>

                              {cell.events.length > 0 && (
                                <div className="events-container">
                                  {cell.events
                                    .slice(0, 3)
                                    .map((event, eventIndex) => (
                                      <div
                                        key={eventIndex}
                                        className={`event-item bg-${getEventBadgeColor(
                                          event
                                        )} text-white rounded p-1 mb-1 small`}
                                        title={`${formatTime(
                                          event.time
                                        )} - ${getEventDisplayText(event)}`}
                                      >
                                        <div className="event-time">
                                          {formatTime(event.time)}
                                        </div>
                                        <div className="event-title">
                                          {getEventDisplayText(event)}
                                        </div>
                                      </div>
                                    ))}

                                  {cell.events.length > 3 && (
                                    <div className="more-events text-center small text-muted">
                                      +{cell.events.length - 3} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Week View */}
              {viewMode === "week" && (
                <Card className="shadow-lg border-0">
                  <Card.Body className="p-0">
                    <div className="week-grid">
                      <div className="time-column">
                        <div className="time-header"></div>
                        {Array.from({ length: 14 }, (_, i) => (
                          <div key={i} className="time-slot">
                            {8 + i}:00
                          </div>
                        ))}
                      </div>
                      {daysOfWeek.map((day, dayIndex) => {
                        const dayEvents = getEventsForDate(day);
                        return (
                          <div key={dayIndex} className="day-column">
                            <div className="day-header">
                              {formatDate(day)}
                              {dayEvents.length > 0 && (
                                <Badge bg="primary" className="ms-2">
                                  {dayEvents.length}
                                </Badge>
                              )}
                            </div>
                            {Array.from({ length: 14 }, (_, hourIndex) => {
                              const hour = 8 + hourIndex;
                              const hourEvents = dayEvents.filter(
                                (event) =>
                                  event.time &&
                                  event.time.startsWith(
                                    `${hour.toString().padStart(2, "0")}:`
                                  )
                              );
                              return (
                                <div key={hourIndex} className="time-slot">
                                  {hourEvents.map((event, eventIndex) => (
                                    <div
                                      key={eventIndex}
                                      className={`event-item bg-${getEventBadgeColor(
                                        event
                                      )} text-white p-1 rounded small`}
                                      title={`${formatTime(
                                        event.time
                                      )} - ${getEventDisplayText(event)}`}
                                    >
                                      {formatTime(event.time)}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Day View */}
              {viewMode === "day" && (
                <Card className="shadow-lg border-0">
                  <Card.Body>
                    <h5 className="mb-3">
                      Events for {new Date().toLocaleDateString()}
                    </h5>
                    {filteredEvents.length === 0 ? (
                      <p className="text-muted">
                        No events scheduled for today
                      </p>
                    ) : (
                      <div className="day-events">
                        {filteredEvents.map((event, index) => (
                          <div
                            key={index}
                            className="event-card p-3 mb-3 bg-light rounded border"
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong className="text-primary">
                                  {formatTime(event.time)}
                                </strong>
                                <div className="mt-1">
                                  {getEventDisplayText(event)}
                                </div>
                                {event.proposalEmail?.fromName && (
                                  <small className="text-muted">
                                    From: {event.proposalEmail.fromName}
                                  </small>
                                )}
                                <div>
                                  {event.proposalEmail?.link && (
                                    <small className="text-muted">
                                      Link: {event.proposalEmail.link}
                                    </small>
                                  )}
                                </div>
                                <div>
                                  {event.proposalEmail?.expirationDate && (
                                    <small className="text-muted">
                                      Expiration:{" "}
                                      {new Date(
                                        event.proposalEmail.expirationDate
                                      ).toLocaleDateString()}
                                    </small>
                                  )}
                                </div>
                              </div>
                              <Badge bg={getEventBadgeColor(event)}>
                                {event.proposalEmail ? "Proposal" : "Event"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Styles */}
      <style>{`
        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: #f8f9fa;
        }
        
        .month-header {
          padding: 10px;
          background-color: #e9ecef;
          font-weight: bold;
          border-bottom: 2px solid #dee2e6;
        }
        
        .month-cell {
          min-height: 120px;
          padding: 8px;
          background-color: white;
          border: 1px solid #dee2e6;
          position: relative;
        }
        
        .month-cell.empty {
          background-color: #f8f9fa;
          border: none;
        }
        
        .month-cell.other-month {
          background-color: #f8f9fa;
          color: #6c757d;
        }
        
        .month-cell.has-events {
          background-color: #f0f8ff;
        }
        
        .date-number {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 1.1rem;
        }
        
        .events-container {
          max-height: 80px;
          overflow-y: auto;
        }
        
        .event-item {
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .event-item:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        
        .event-time {
          font-size: 0.7rem;
          opacity: 0.9;
          font-weight: bold;
        }
        
        .event-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.7rem;
        }
        
        .more-events {
          margin-top: 2px;
          font-size: 0.7rem;
        }
        
        .week-grid {
          display: flex;
          width: 100%;
        }
        
        .time-column {
          width: 60px;
          flex-shrink: 0;
        }
        
        .time-header {
          height: 50px;
          border-bottom: 2px solid #dee2e6;
        }
        
        .time-slot {
          height: 60px;
          padding: 2px;
          border-bottom: 1px solid #eee;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .day-column {
          flex: 1;
          border-left: 1px
        .day-header {
          padding: 10px;
          text-align: center;
          font-weight: bold;
          border-bottom: 2px solid #dee2e6;
          background-color: #f8f9fa;
        }
        
        .event-card {
          transition: all 0.2s;
        }
        
        .event-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
      `}</style>
    </Container>
  );
}
