// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { selectedUserId } from "../../store/authSlice";
// import { setScheduleId } from "../../store/scheduleSlice";
// import axios from "axios";
// import { CalendarClock, Clock, Calendar, CheckCircle, Plus, Trash } from "lucide-react";
// import { toast } from "react-toastify";
// const API_URL = import.meta.env.VITE_API_URL;

// const Schedule = ({ blockId, parentId }) => {
//   const dispatch = useDispatch();
//   const userId = useSelector(selectedUserId);

//   const [schedules, setSchedules] = useState([{ date: "", time: "", comment: "", id: null }]);
//   const [loading, setLoading] = useState(false);

//   const handleScheduleChange = (index, field, value) => {
//     const updatedSchedules = [...schedules];
//     updatedSchedules[index][field] = value;
//     setSchedules(updatedSchedules);
//   };

//   const addSchedule = () => {
//     setSchedules([...schedules, { date: "", time: "", comment: "", id: null }]);
//   };

//   const removeSchedule = (index) => {
//     setSchedules(schedules.filter((_, i) => i !== index));
//   };

//   const handleSave = async () => {
//     const validSchedules = schedules.filter((s) => s.date && s.time);
//     if (!validSchedules.length) return;

//     setLoading(true);
//     try {
//       const res = await axios.post(`${API_URL}/schedules/save`, {
//         schedules: validSchedules.map((s) => ({ ...s, userId, blockId, parentId })),
//       });

//       if (res.data.success) {
//         const scheduleIds = Array.isArray(res.data.id) ? res.data.id : [res.data.id];
//         dispatch(setScheduleId(scheduleIds));
//         toast.success("✅ Schedules saved successfully!");
//         const updatedSchedules = schedules.map((s, i) => ({ ...s, id: scheduleIds[i] || s.id }));
//         setSchedules(updatedSchedules);
//       }
//     } catch (err) {
//       toast.error("❌ Failed to save schedules");
//       console.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="position-relative shadow-lg p-5"
//       style={{
//         maxWidth: "1800px",
//         width: "100%",
//         minHeight: "450px",
//         border: "1px solid #e0e7ff",
//         background: "linear-gradient(135deg, #e0f2ff, #e0e7ff)",
//         overflow: "hidden",
//       }}
//     >
//       {/* Decorative circles */}
//       <div
//         style={{
//           position: "absolute",
//           top: "-60px",
//           right: "-60px",
//           width: "120px",
//           height: "120px",
//           borderRadius: "50%",
//           backgroundColor: "#93c5fd",
//           opacity: 0.3,
//         }}
//       ></div>
//       <div
//         style={{
//           position: "absolute",
//           bottom: "-40px",
//           left: "-40px",
//           width: "80px",
//           height: "80px",
//           borderRadius: "50%",
//           backgroundColor: "#818cf8",
//           opacity: 0.35,
//         }}
//       ></div>

//       {/* Header */}
//       <div className="d-flex align-items-center mb-5">
//         <div
//           className="d-flex justify-content-center align-items-center rounded-circle shadow-sm me-3"
//           style={{ backgroundColor: "#4f46e5", width: "50px", height: "50px" }}
//         >
//           <CalendarClock size={24} color="white" />
//         </div>
//         <h3 className="fw-bold text-dark mb-0">Schedule Content</h3>
//       </div>

//       {/* Schedules */}
//       <div className="d-flex flex-column align-items-center gap-4">
//         {schedules.map((schedule, index) => (
//           <div
//             key={index}
//             className="bg-white rounded-3 shadow-sm p-4 w-100"
//             style={{
//               maxWidth: "500px",
//               transition: "all 0.2s",
//               cursor: "default",
//             }}
//           >
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <div className="d-flex align-items-center text-muted">
//                 <Calendar size={18} className="me-2" />
//                 <span>Select date & time</span>
//                 <Clock size={18} className="ms-3 me-2" />
//                 <span>All timezones supported</span>
//               </div>
//               {index > 0 && (
//                 <button
//                   className="btn btn-outline-danger btn-sm"
//                   onClick={() => removeSchedule(index)}
//                 >
//                   <Trash size={16} />
//                 </button>
//               )}
//             </div>

//             {/* Date & Time inputs */}
//             <div className="d-flex flex-column flex-md-row gap-3 mb-3">
//               <input
//                 type="date"
//                 className="form-control border-0 text-center fw-bold rounded"
//                 value={schedule.date}
//                 onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
//               />
//               <input
//                 type="time"
//                 className="form-control border-0 text-center fw-bold rounded"
//                 value={schedule.time}
//                 onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
//               />
//             </div>

//             {/* Comment */}
//             <textarea
//               className="form-control rounded"
//               placeholder="Add a comment (e.g., 'For this work')"
//               rows={2}
//               value={schedule.comment}
//               onChange={(e) => handleScheduleChange(index, "comment", e.target.value)}
//             />

//             {/* Scheduled time display */}
//             {schedule.date && schedule.time ? (
//               <div className="mt-3 p-3 rounded border border-success bg-success bg-opacity-10 d-flex flex-column align-items-center">
//                 <div className="d-flex align-items-center gap-2">
//                   <CheckCircle size={20} className="text-success" />
//                   <span className="fw-bold text-success">
//                     Scheduled for: {new Date(`${schedule.date}T${schedule.time}`).toLocaleString()}
//                   </span>
//                 </div>
//                 {schedule.comment && <small className="text-muted">Comment: {schedule.comment}</small>}
//               </div>
//             ) : (
//               <div className="mt-3 p-3 bg-light rounded text-center text-muted d-flex align-items-center justify-content-center gap-2">
//                 <Clock size={16} /> Select a date and time to schedule
//               </div>
//             )}
//           </div>
//         ))}

//         {/* Buttons */}
//         <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: "500px" }}>
//           <button
//             className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
//             onClick={addSchedule}
//             disabled={loading}
//           >
//             <Plus size={16} /> Add Another Schedule
//           </button>

//           <button
//             className={`btn fw-bold text-white ${
//               loading || !schedules.some((s) => s.date && s.time)
//                 ? "btn-secondary"
//                 : "btn-primary"
//             }`}
//             onClick={handleSave}
//             disabled={loading || !schedules.some((s) => s.date && s.time)}
//           >
//             {loading ? "Saving..." : "Save Schedules"}
//           </button>
//         </div>

//         <small className="text-muted mt-2 text-center">Times are displayed in your local timezone</small>
//       </div>
//     </div>
//   );
// };

// export default Schedule;

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectedUserId } from "../../store/authSlice";
import { setScheduleId } from "../../store/scheduleSlice";
import axios from "axios";
import { CalendarClock, Clock, Calendar, CheckCircle, Plus, Trash, Loader } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const Schedule = ({ blockId, parentId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);

  const [schedules, setSchedules] = useState([{ date: "", time: "", comment: "", id: null }]);
  const [loading, setLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = schedules.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    );
    setSchedules(updatedSchedules);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { date: "", time: "", comment: "", id: null }]);
  };

  const removeSchedule = async (index) => {
    if (schedules.length === 1) return;

    const scheduleToRemove = schedules[index];

    // Store current schedules in a variable to avoid closure issues
    const currentSchedules = [...schedules];

    // If the schedule is saved in DB (has an ID), call API to delete
    if (scheduleToRemove.id) {
      setDeletingIndex(index);
      try {
        const res = await axios.delete(`${API_URL}/schedules/${scheduleToRemove.id}`, {
          data: {
            userId,
            blockId,
            parentId
          }
        });

        if (res.data.message) {
          toast.success("Schedule deleted successfully!");

          // Remove from local state using the stored currentSchedules
          const newSchedules = currentSchedules.filter((_, i) => i !== index);
          setSchedules(newSchedules);

          // Update Redux state with remaining IDs
          const remainingIds = newSchedules
            .map(s => s.id)
            .filter(id => id !== null);
          dispatch(setScheduleId(remainingIds));
        } else {
          toast.error(res.data.message || " Failed to delete schedule");
        }
      } catch (err) {
        toast.error(" Failed to delete schedule");
        console.error("Delete schedule error:", err.message);
      } finally {
        setDeletingIndex(null);
      }
    } else {
      // If not saved in DB, just remove from local state
      const newSchedules = currentSchedules.filter((_, i) => i !== index);
      setSchedules(newSchedules);
    }

    setHoverIndex(null);
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
        toast.success("Schedules saved successfully!");

        const updatedSchedules = schedules.map((s, i) => ({
          ...s,
          id: scheduleIds[i] || s.id,
        }));
        setSchedules(updatedSchedules);
      }
    } catch (err) {
      toast.error("Failed to save schedules");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScheduledTimeString = (date, time) => {
    if (!date || !time) return "";
    const scheduledDate = new Date(`${date}T${time}`);
    return scheduledDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="position-relative p-4 p-md-5 mx-auto"
      style={{
        maxWidth: "1800px",
        width: "100%",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          animation: "float 6s ease-in-out infinite",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
          animation: "float 8s ease-in-out infinite 1s",
        }}
      ></div>

      {/* Header */}
      <div className="d-flex align-items-center mb-4 position-relative">
        <div
          className="d-flex justify-content-center align-items-center rounded-3 me-3 shadow-lg"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            width: "60px",
            height: "60px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <CalendarClock size={28} color="white" />
        </div>
        <div>
          <h3 className="fw-bold text-white mb-1">Schedule Content</h3>
          <p className="text-white-50 mb-0" style={{ fontSize: "0.9rem" }}>
            Plan your content with multiple schedules
          </p>
        </div>
      </div>

      {/* Schedules */}
      <div className="d-flex flex-column align-items-center gap-4 position-relative">
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className="rounded-4 p-4 w-100"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: `
                0 4px 20px rgba(0, 0, 0, 0.08),
                0 2px 8px rgba(0, 0, 0, 0.04),
                ${hoverIndex === index ? "0 0 0 2px rgba(102, 126, 234, 0.3)" : "none"}
              `,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: hoverIndex === index ? "translateY(-2px)" : "translateY(0)",
              cursor: "default",
              maxWidth: "600px",
            }}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center text-muted">
                <div className="d-flex align-items-center me-4">
                  <Calendar size={16} className="me-2" />
                  <small>Select date</small>
                </div>
                <div className="d-flex align-items-center">
                  <Clock size={16} className="me-2" />
                  <small>All timezones</small>
                </div>
              </div>
              {schedules.length > 1 && (
                <button
                  className="btn btn-light btn-sm rounded-pill d-flex align-items-center gap-1"
                  onClick={() => removeSchedule(index)}
                  disabled={deletingIndex === index}
                  style={{
                    transition: "all 0.2s ease",
                    opacity: hoverIndex === index ? 1 : 0.7,
                    background: deletingIndex === index ? "#f3f4f6" : "",
                    borderColor: deletingIndex === index ? "#d1d5db" : "",
                  }}
                >
                  {deletingIndex === index ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Trash size={14} />
                  )}
                  <span>
                    {deletingIndex === index ? "Deleting..." : "Remove"}
                  </span>
                </button>
              )}
            </div>

            {/* Date & Time inputs */}
            <div className="d-flex flex-column flex-md-row gap-3 mb-3">
              <div className="flex-fill">
                <label className="form-label text-sm text-muted mb-1">Date</label>
                <input
                  type="date"
                  className="form-control rounded-3 border-0 shadow-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.95rem",
                    padding: "0.75rem 1rem",
                    transition: "all 0.2s ease",
                  }}
                  value={schedule.date}
                  onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                  disabled={deletingIndex === index}
                />
              </div>
              <div className="flex-fill">
                <label className="form-label text-sm text-muted mb-1">Time</label>
                <input
                  type="time"
                  className="form-control rounded-3 border-0 shadow-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.95rem",
                    padding: "0.75rem 1rem",
                    transition: "all 0.2s ease",
                  }}
                  value={schedule.time}
                  onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
                  disabled={deletingIndex === index}
                />
              </div>
            </div>

            {/* Comment */}
            <div className="mb-3">
              <label className="form-label text-sm text-muted mb-1">Comment (Optional)</label>
              <textarea
                className="form-control rounded-3 border-0 shadow-sm"
                placeholder="Add a comment for this schedule..."
                rows={2}
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.95rem",
                  padding: "0.75rem 1rem",
                  resize: "vertical",
                  transition: "all 0.2s ease",
                }}
                value={schedule.comment}
                onChange={(e) => handleScheduleChange(index, "comment", e.target.value)}
                disabled={deletingIndex === index}
              />
            </div>

            {/* Scheduled time display */}
            {schedule.date && schedule.time ? (
              <div
                className="p-3 rounded-3 d-flex flex-column align-items-center"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  transition: "all 0.3s ease",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <CheckCircle size={20} />
                  <span className="fw-semibold">Scheduled</span>
                  {schedule.id && (
                    <span className="badge bg-light text-dark ms-2">Saved</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="fw-bold">{getScheduledTimeString(schedule.date, schedule.time)}</div>
                  {schedule.comment && (
                    <small className="opacity-90 mt-1">Note: {schedule.comment}</small>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="p-3 rounded-3 text-center text-muted d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "rgba(0, 0, 0, 0.03)",
                  border: "1px dashed rgba(0, 0, 0, 0.1)",
                }}
              >
                <Clock size={16} />
                <span>Select a date and time to schedule</span>
              </div>
            )}
          </div>
        ))}

        {/* Buttons */}
        <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: "600px" }}>
          <button
            className="btn btn-light rounded-pill d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={addSchedule}
            disabled={loading || deletingIndex !== null}
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
            }}
          >
            <Plus size={18} />
            <span>Add Another Schedule</span>
          </button>

          <button
            className={`btn fw-bold text-white rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 ${loading || !schedules.some((s) => s.date && s.time)
                ? "btn-secondary"
                : "shadow"
              }`}
            onClick={handleSave}
            disabled={loading || !schedules.some((s) => s.date && s.time) || deletingIndex !== null}
            style={{
              background: loading || !schedules.some((s) => s.date && s.time)
                ? "#9ca3af"
                : "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              transition: "all 0.3s ease",
              transform: loading ? "scale(0.98)" : "scale(1)",
            }}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Saving Schedules...</span>
              </>
            ) : (
              <span>Save All Schedules</span>
            )}
          </button>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .form-control:focus {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }
      `}</style>
    </div>
  );
};

export default Schedule;