import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectedUserId } from "../../store/authSlice";
import { setScheduleId } from "../../store/scheduleSlice";
import axios from "axios";
import { CalendarClock, Clock, Calendar, CheckCircle, Plus, Trash } from "lucide-react";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL;

const Schedule = ({ blockId, parentId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);

  const [schedules, setSchedules] = useState([{ date: "", time: "", comment: "", id: null }]);
  const [loading, setLoading] = useState(false);

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][field] = value;
    setSchedules(updatedSchedules);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { date: "", time: "", comment: "", id: null }]);
  };

  const removeSchedule = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const validSchedules = schedules.filter((s) => s.date && s.time);
    if (!validSchedules.length) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/schedules/save`, {
        schedules: validSchedules.map((s) => ({ ...s, userId, blockId, parentId })),
      });

      if (res.data.success) {
        const scheduleIds = Array.isArray(res.data.id) ? res.data.id : [res.data.id];
        dispatch(setScheduleId(scheduleIds));
        toast.success("✅ Schedules saved successfully!");
        const updatedSchedules = schedules.map((s, i) => ({ ...s, id: scheduleIds[i] || s.id }));
        setSchedules(updatedSchedules);
      }
    } catch (err) {
      toast.error("❌ Failed to save schedules");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-relative shadow-lg p-5"
      style={{
        maxWidth: "1800px",
        width: "100%",
        minHeight: "450px",
        border: "1px solid #e0e7ff",
        background: "linear-gradient(135deg, #e0f2ff, #e0e7ff)",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          backgroundColor: "#93c5fd",
          opacity: 0.3,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "-40px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#818cf8",
          opacity: 0.35,
        }}
      ></div>

      {/* Header */}
      <div className="d-flex align-items-center mb-5">
        <div
          className="d-flex justify-content-center align-items-center rounded-circle shadow-sm me-3"
          style={{ backgroundColor: "#4f46e5", width: "50px", height: "50px" }}
        >
          <CalendarClock size={24} color="white" />
        </div>
        <h3 className="fw-bold text-dark mb-0">Schedule Content</h3>
      </div>

      {/* Schedules */}
      <div className="d-flex flex-column align-items-center gap-4">
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className="bg-white rounded-3 shadow-sm p-4 w-100"
            style={{
              maxWidth: "500px",
              transition: "all 0.2s",
              cursor: "default",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center text-muted">
                <Calendar size={18} className="me-2" />
                <span>Select date & time</span>
                <Clock size={18} className="ms-3 me-2" />
                <span>All timezones supported</span>
              </div>
              {index > 0 && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeSchedule(index)}
                >
                  <Trash size={16} />
                </button>
              )}
            </div>

            {/* Date & Time inputs */}
            <div className="d-flex flex-column flex-md-row gap-3 mb-3">
              <input
                type="date"
                className="form-control border-0 text-center fw-bold rounded"
                value={schedule.date}
                onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
              />
              <input
                type="time"
                className="form-control border-0 text-center fw-bold rounded"
                value={schedule.time}
                onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
              />
            </div>

            {/* Comment */}
            <textarea
              className="form-control rounded"
              placeholder="Add a comment (e.g., 'For this work')"
              rows={2}
              value={schedule.comment}
              onChange={(e) => handleScheduleChange(index, "comment", e.target.value)}
            />

            {/* Scheduled time display */}
            {schedule.date && schedule.time ? (
              <div className="mt-3 p-3 rounded border border-success bg-success bg-opacity-10 d-flex flex-column align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle size={20} className="text-success" />
                  <span className="fw-bold text-success">
                    Scheduled for: {new Date(`${schedule.date}T${schedule.time}`).toLocaleString()}
                  </span>
                </div>
                {schedule.comment && <small className="text-muted">Comment: {schedule.comment}</small>}
              </div>
            ) : (
              <div className="mt-3 p-3 bg-light rounded text-center text-muted d-flex align-items-center justify-content-center gap-2">
                <Clock size={16} /> Select a date and time to schedule
              </div>
            )}
          </div>
        ))}

        {/* Buttons */}
        <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: "500px" }}>
          <button
            className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
            onClick={addSchedule}
            disabled={loading}
          >
            <Plus size={16} /> Add Another Schedule
          </button>

          <button
            className={`btn fw-bold text-white ${
              loading || !schedules.some((s) => s.date && s.time)
                ? "btn-secondary"
                : "btn-primary"
            }`}
            onClick={handleSave}
            disabled={loading || !schedules.some((s) => s.date && s.time)}
          >
            {loading ? "Saving..." : "Save Schedules"}
          </button>
        </div>

        <small className="text-muted mt-2 text-center">Times are displayed in your local timezone</small>
      </div>
    </div>
  );
};

export default Schedule;
