// src/components/ScheduleView.jsx
import React from "react";
import { CalendarClock, Clock, Calendar, CheckCircle } from "lucide-react";

const ScheduleView = ({ schedule,name  }) => {
  if (!schedule) return null;

  const { date, time } = schedule;
  const dateTime = date && time ? `${date}T${time}` : "";

  return (
    <div
      className="position-relative p-4 overflow-hidden top-0 start-0 bg-white shadow-sm"
      style={{
        maxWidth: "1400px",
        width: "100%",
        minHeight: "450px",
        border: "1px solid #e0e7ff",
      }}
    >
      {/* Decorative elements */}
      <div className="position-absolute top-0 end-0 w-32 h-32 bg-blue-200 opacity-20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="position-absolute bottom-0 start-0 w-24 h-24 bg-indigo-300 opacity-30 rounded-full -translate-x-12 translate-y-12"></div>

      {/* Header */}
      <div className="d-flex align-items-center mb-5">
        <div
          className="d-flex justify-content-center align-items-center rounded-circle me-3"
          style={{
            backgroundColor: "#4f46e5",
            width: "50px",
            height: "50px",
          }}
        >
          <CalendarClock size={24} color="white" />
        </div>
        <h3 className="fw-bold text-dark mb-0">Scheduled { name }</h3>
      </div>

      {/* Main content */}
      <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center gap-4 position-relative z-1">
        <div
          className="bg-white p-5 rounded-2xl border border-light"
          style={{ width: "100%", maxWidth: "500px" }}
        >
          <div className="d-flex align-items-center justify-content-center mb-4 text-muted">
            <Calendar size={18} className="me-2" />
            <span>Scheduled date and time</span>
            <Clock size={18} className="ms-3 me-2" />
            <span>All timezones supported</span>
          </div>

          {/* Display Scheduled Time */}
          {dateTime ? (
            <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-2 border border-success border-opacity-25">
              <div className="d-flex align-items-center justify-content-center">
                <CheckCircle size={20} className="text-success me-2" />
                <h4 className="fw-bold text-dark mb-0">
                  Scheduled for:{" "}
                  <span className="text-primary">
                    {new Date(dateTime).toLocaleString()}
                  </span>
                </h4>
              </div>
              <p className="text-muted mt-2 mb-0">
                This content is set to publish at the scheduled time
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-light rounded-2">
              <p className="text-muted mb-0">
                <Clock size={16} className="me-2" />
                No schedule set
              </p>
            </div>
          )}
        </div>

        <div className="mt-3">
          <small className="text-muted">
            Times are displayed in your local timezone
          </small>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
