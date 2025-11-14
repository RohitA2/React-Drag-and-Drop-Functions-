// src/components/ScheduleView.jsx
import React from "react";
import { CalendarClock, Clock, Calendar, CheckCircle, AlertCircle, Zap } from "lucide-react";

const ScheduleView = ({ schedules = [], name }) => {
  return (
    <div
      className="position-relative p-5 overflow-hidden bg-white "
      style={{
        maxWidth: "1400px",
        width: "100%",
        minHeight: "500px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
        border: "1px solid rgba(99, 102, 241, 0.15)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(79, 70, 229, 0.03)"
      }}
    >
      {/* Modern gradient background elements */}
      <div
        className="position-absolute top-0 end-0 w-64 h-64 rounded-circle blur-xl opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)"
        }}
      ></div>
      <div
        className="position-absolute bottom-0 start-0 w-48 h-48 rounded-circle blur-xl opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)"
        }}
      ></div>

      {/* Subtle grid pattern */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: "20px 20px"
        }}
      ></div>

      {/* Header */}
      <div className="d-flex align-items-center mb-6 position-relative z-2">
        <div
          className="d-flex justify-content-center align-items-center rounded-3 me-4 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            width: "56px",
            height: "56px",
          }}
        >
          <CalendarClock size={26} color="white" />
        </div>
        <div>
          <h3 className="fw-bold text-dark mb-1" style={{ fontSize: "1.5rem" }}>
            Scheduled {name}
          </h3>
          <p className="text-muted mb-0 small">
            Manage and view all scheduled tasks
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="position-relative z-2">
        <div
          className="bg-white rounded-3 p-4 shadow-sm border-0"
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)"
          }}
        >
          {/* Info header */}
          <div className="d-flex align-items-center justify-content-center mb-5 p-3 rounded-2 bg-light">
            <div className="d-flex align-items-center me-4">
              <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-2">
                <Calendar size={16} className="text-primary" />
              </div>
              <span className="text-dark fw-medium small">Scheduled Dates</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-2 rounded-2 me-2">
                <Clock size={16} className="text-warning" />
              </div>
              <span className="text-dark fw-medium small">Local Timezone</span>
            </div>
          </div>

          {/* Schedules list */}
          {schedules.length > 0 ? (
            <div className="d-flex flex-column gap-4">
              {schedules.map((s, index) => {
                const dateTime = `${s.date}T${s.time}`;
                const scheduleDate = new Date(dateTime);
                const isUpcoming = scheduleDate > new Date();

                return (
                  <div
                    key={index}
                    className="p-4 rounded-3 border-0 position-relative overflow-hidden"
                    style={{
                      background: isUpcoming
                        ? "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
                        : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                      borderLeft: `4px solid ${isUpcoming ? '#0ea5e9' : '#10b981'}`,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    {/* Accent dot */}
                    <div
                      className="position-absolute top-50 start-0 translate-middle-y rounded-circle"
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: isUpcoming ? '#0ea5e9' : '#10b981',
                        left: "-2px"
                      }}
                    ></div>

                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        {isUpcoming ? (
                          <Zap size={20} className="text-blue-500 me-3" />
                        ) : (
                          <CheckCircle size={20} className="text-green-500 me-3" />
                        )}
                        <h5 className="fw-bold text-dark mb-0">
                          {scheduleDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h5>
                      </div>
                      <div
                        className="px-3 py-1 rounded-pill small fw-medium"
                        style={{
                          backgroundColor: isUpcoming ? 'rgba(14, 165, 233, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: isUpcoming ? '#0ea5e9' : '#10b981'
                        }}
                      >
                        {scheduleDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <p className="text-muted mb-0 small">
                        <span className="fw-medium">#{String(index + 1).padStart(2, '0')}</span> - {s.comment}
                      </p>
                      <span
                        className="badge px-2 py-1 small"
                        style={{
                          backgroundColor: isUpcoming ? 'rgba(14, 165, 233, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: isUpcoming ? '#0ea5e9' : '#10b981'
                        }}
                      >
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="bg-light bg-opacity-50 p-4 rounded-3 d-inline-flex flex-column align-items-center border-0">
                <div className="bg-secondary bg-opacity-10 p-3 rounded-circle mb-3">
                  <AlertCircle size={32} className="text-secondary opacity-75" />
                </div>
                <h5 className="text-dark mb-2">No schedules found</h5>
                <p className="text-muted mb-0 small">
                  There are no scheduled tasks for {name} at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;