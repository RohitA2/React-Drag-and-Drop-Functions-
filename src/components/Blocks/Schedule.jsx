// src/components/Schedule.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectedUserId } from "../../store/authSlice";
import { setScheduleId } from "../../store/scheduleSlice";
import axios from "axios";
import { CalendarClock, Clock, Calendar, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL;

const Schedule = ({ blockId, parentId }) => {
  const dispatch = useDispatch();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isTimeFocused, setIsTimeFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // get userId from Redux
  const userId = useSelector(selectedUserId);
  console.log("parentId", parentId);
  // Combine date and time for display
  const dateTime = date && time ? `${date}T${time}` : "";

  // Handle API call
  const handleSave = async () => {
    if (!date || !time) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/schedules/save`, {
        date,
        time,
        userId, // send userId to backend
        blockId,
        parentId,
      });
      if (res.data.success) {
        // ✅ Save ID globally
        dispatch(setScheduleId(res.data.id));
        toast.success("✅ Schedule saved successfully!");
      }
      setSaved(true);
    } catch (err) {
      toast.error("❌ Failed to save schedule");
      console.error("Error saving schedule:", err.message);
      setSaved(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-relative bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg p-6 rounded-2xl overflow-hidden"
      style={{
        maxWidth: "1800px",
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
          className="d-flex justify-content-center align-items-center rounded-circle shadow-sm me-3"
          style={{
            backgroundColor: "#4f46e5",
            width: "50px",
            height: "50px",
          }}
        >
          <CalendarClock size={24} color="white" />
        </div>
        <h3 className="fw-bold text-dark mb-0">Schedule Content</h3>
      </div>

      {/* Main content */}
      <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center gap-4 position-relative z-1">
        <div
          className="bg-white p-5 rounded-2xl shadow-sm border border-light"
          style={{ width: "100%", maxWidth: "500px" }}
        >
          <div className="d-flex align-items-center justify-content-center mb-4 text-muted">
            <Calendar size={18} className="me-2" />
            <span>Select date and time</span>
            <Clock size={18} className="ms-3 me-2" />
            <span>All timezones supported</span>
          </div>

          {/* Date + Time Inputs */}
          <div className="d-flex flex-column flex-md-row gap-3 mb-4">
            {/* Date Input */}
            <div className="flex-fill">
              <div
                className={`position-relative border ${
                  isDateFocused ? "border-primary shadow-sm" : "border-light"
                } rounded-2 px-2 py-3 bg-white transition-all`}
              >
                <label
                  className="position-absolute top-0 start-0 px-2 mt-1 bg-white text-muted small"
                  style={{ transform: "translate(10px, -50%)" }}
                >
                  Date
                </label>
                <input
                  type="date"
                  className="form-control border-0 text-center fw-bold"
                  style={{ fontSize: "1rem" }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onFocus={() => setIsDateFocused(true)}
                  onBlur={() => setIsDateFocused(false)}
                />
              </div>
            </div>

            {/* Time Input */}
            <div className="flex-fill">
              <div
                className={`position-relative border ${
                  isTimeFocused ? "border-primary shadow-sm" : "border-light"
                } rounded-2 px-2 py-3 bg-white transition-all`}
              >
                <label
                  className="position-absolute top-0 start-0 px-2 mt-1 bg-white text-muted small"
                  style={{ transform: "translate(10px, -50%)" }}
                >
                  Time
                </label>
                <input
                  type="time"
                  className="form-control border-0 text-center fw-bold"
                  style={{ fontSize: "1rem" }}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onFocus={() => setIsTimeFocused(true)}
                  onBlur={() => setIsTimeFocused(false)}
                />
              </div>
            </div>
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
                Your content will be published at this time
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-light rounded-2">
              <p className="text-muted mb-0">
                <Clock size={16} className="me-2" />
                Select a date and time to schedule your content
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            className="btn btn-primary mt-4 w-100 fw-bold"
            onClick={handleSave}
            disabled={!dateTime || loading}
          >
            {loading ? "Saving..." : "Save Schedule"}
          </button>
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

export default Schedule;
