// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { selectedUserId } from "../../store/authSlice";
// import { setScheduleId } from "../../store/scheduleSlice";
// import axios from "axios";
// import {
//   CalendarClock, Clock, Calendar, CheckCircle, Plus, Trash,
//   Loader, ChevronDown, MessageSquare, PlusCircle, X,
//   AlertCircle, ListChecks, CalendarDays, MoreVertical,
//   Clock4, Search
// } from "lucide-react";
// import { toast } from "react-toastify";

// const API_URL = import.meta.env.VITE_API_URL;

// const Schedule = ({ blockId, parentId }) => {
//   const dispatch = useDispatch();
//   const userId = useSelector(selectedUserId);

//   // Modified state to handle multiple services per schedule
//   const [schedules, setSchedules] = useState([{
//     date: "",
//     time: "",
//     services: [], // Changed from single comment to array of services
//     id: null
//   }]);

//   const [loading, setLoading] = useState(false);
//   const [hoverIndex, setHoverIndex] = useState(null);
//   const [deletingIndex, setDeletingIndex] = useState(null);
//   const [allServices, setAllServices] = useState([]); // All available services
//   const [loadingServices, setLoadingServices] = useState(false);
//   const [showAddServiceModal, setShowAddServiceModal] = useState(false);
//   const [currentScheduleIndex, setCurrentScheduleIndex] = useState(null);
//   const [newServiceText, setNewServiceText] = useState("");
//   const [savingNewService, setSavingNewService] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(null);
//   const [showServiceManager, setShowServiceManager] = useState(null);
//   const [serviceSearchTerm, setServiceSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [servicesPerPage] = useState(10);

//   // Create ref for dropdown container
//   const dropdownRef = useRef(null);

//   // Filter services based on search term
//   const filteredServices = useMemo(() => {
//     if (!serviceSearchTerm.trim()) return allServices;
//     return allServices.filter(service =>
//       service.text.toLowerCase().includes(serviceSearchTerm.toLowerCase())
//     );
//   }, [allServices, serviceSearchTerm]);

//   // Get current page services
//   const currentServices = useMemo(() => {
//     const startIndex = currentPage * servicesPerPage;
//     return filteredServices.slice(startIndex, startIndex + servicesPerPage);
//   }, [filteredServices, currentPage, servicesPerPage]);

//   const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

//   // Fetch all services from API
//   useEffect(() => {
//     const fetchServices = async () => {
//       setLoadingServices(true);
//       try {
//         const response = await axios.get(`${API_URL}/service/${userId}`);
//         if (response.data.success) {
//           // Map the data to the expected format {text, createdAt}
//           const mappedServices = response.data.data ? response.data.data.map(s => ({
//             text: s.title,
//             createdAt: s.createdAt
//           })) : [];
//           setAllServices(mappedServices);
//           console.log("Services from API:", mappedServices);

//           if (mappedServices.length > 0) {
//             // toast.success(`${mappedServices.length} services loaded`);
//           } else {
//             toast.info("No services found");
//           }
//         } else {
//           setAllServices([]);
//           toast.info("No services available");
//         }
//       } catch (error) {
//         console.error("Error fetching services:", error);
//         toast.error("Failed to load services");
//         setAllServices([]);
//       } finally {
//         setLoadingServices(false);
//       }
//     };

//     if (userId) {
//       fetchServices();
//     } else {
//       setLoadingServices(false);
//     }
//   }, [userId]);

//   // Reset page when search term changes
//   useEffect(() => {
//     setCurrentPage(0);
//   }, [serviceSearchTerm]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(null);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Prevent body scroll when dropdown is open
//   useEffect(() => {
//     if (dropdownOpen !== null) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }

//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [dropdownOpen]);

//   // Group services by day for better visualization
//   const groupedSchedules = useMemo(() => {
//     const groups = {};
//     schedules.forEach((schedule, index) => {
//       if (schedule.date) {
//         if (!groups[schedule.date]) {
//           groups[schedule.date] = [];
//         }
//         groups[schedule.date].push({ ...schedule, originalIndex: index });
//       }
//     });
//     return groups;
//   }, [schedules]);

//   const handleScheduleChange = (index, field, value) => {
//     const updatedSchedules = schedules.map((schedule, i) =>
//       i === index ? { ...schedule, [field]: value } : schedule
//     );
//     setSchedules(updatedSchedules);
//   };

//   const addSchedule = () => {
//     setSchedules([...schedules, { date: "", time: "", services: [], id: null }]);
//   };

//   const removeSchedule = async (index) => {
//     if (schedules.length === 1) return;
//     const scheduleToRemove = schedules[index];
//     const currentSchedules = [...schedules];

//     if (scheduleToRemove.id) {
//       setDeletingIndex(index);
//       try {
//         const res = await axios.delete(`${API_URL}/schedules/${scheduleToRemove.id}`, {
//           data: { userId, blockId, parentId }
//         });
//         if (res.data.message) {
//           toast.success("Schedule deleted successfully!");
//           const newSchedules = currentSchedules.filter((_, i) => i !== index);
//           setSchedules(newSchedules);
//           const remainingIds = newSchedules
//             .map(s => s.id)
//             .filter(id => id !== null);
//           dispatch(setScheduleId(remainingIds));
//         } else {
//           toast.error(res.data.message || "Failed to delete schedule");
//         }
//       } catch (err) {
//         toast.error("Failed to delete schedule");
//         console.error("Delete schedule error:", err.message);
//       } finally {
//         setDeletingIndex(null);
//       }
//     } else {
//       const newSchedules = currentSchedules.filter((_, i) => i !== index);
//       setSchedules(newSchedules);
//     }
//     setHoverIndex(null);
//     setDropdownOpen(null);
//     setShowServiceManager(null);
//   };

//   const addServiceToSchedule = (scheduleIndex, serviceText) => {
//     const updatedSchedules = schedules.map((schedule, i) => {
//       if (i === scheduleIndex) {
//         // Check if service already exists
//         if (!schedule.services.includes(serviceText)) {
//           return {
//             ...schedule,
//             services: [...schedule.services, serviceText]
//           };
//         }
//       }
//       return schedule;
//     });
//     setSchedules(updatedSchedules);
//     setDropdownOpen(null);
//   };

//   const removeServiceFromSchedule = (scheduleIndex, serviceIndex) => {
//     const updatedSchedules = schedules.map((schedule, i) => {
//       if (i === scheduleIndex) {
//         const newServices = [...schedule.services];
//         newServices.splice(serviceIndex, 1);
//         return { ...schedule, services: newServices };
//       }
//       return schedule;
//     });
//     setSchedules(updatedSchedules);
//   };

//   const openAddServiceModal = (index) => {
//     setCurrentScheduleIndex(index);
//     setNewServiceText("");
//     setShowAddServiceModal(true);
//     setDropdownOpen(null);
//   };

//   const handleSaveNewService = async () => {
//     if (!newServiceText.trim()) return;
//     setSavingNewService(true);
//     try {
//       const response = await axios.post(`${API_URL}/service/Create`, {
//         services: newServiceText.trim(),
//         userId,
//       });
//       if (response.data.success) {
//         const newServiceObj = response.data.comment;
//         setAllServices(prev => [newServiceObj, ...prev]);
//         // Add the new service to the current schedule if applicable
//         if (currentScheduleIndex !== null) {
//           addServiceToSchedule(currentScheduleIndex, newServiceObj.text);
//         }
//         setNewServiceText("");
//         setShowAddServiceModal(false);
//         setCurrentScheduleIndex(null);
//         toast.success("Service saved successfully!");
//       }
//     } catch (error) {
//       console.error("Error saving service:", error);
//       toast.error("Failed to save service");
//     } finally {
//       setSavingNewService(false);
//     }
//   };

//   const handleSave = async () => {
//     const validSchedules = schedules.filter((s) => s.date && s.time && s.services.length > 0);
//     if (!validSchedules.length) return;
//     setLoading(true);
//     try {
//       // Transform services array into string for API
//       const schedulesForAPI = validSchedules.map((s) => ({
//         ...s,
//         comment: s.services.join(" | "), // Combine services with separator
//         userId,
//         blockId,
//         parentId
//       }));
//       const res = await axios.post(`${API_URL}/schedules/save`, {
//         schedules: schedulesForAPI,
//       });
//       if (res.data.success) {
//         const scheduleIds = Array.isArray(res.data.id) ? res.data.id : [res.data.id];
//         dispatch(setScheduleId(scheduleIds));
//         toast.success("Schedules saved successfully!");
//         const updatedSchedules = schedules.map((s, i) => ({
//           ...s,
//           id: scheduleIds[i] || s.id,
//         }));
//         setSchedules(updatedSchedules);
//       }
//     } catch (err) {
//       toast.error("Failed to save schedules");
//       console.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getScheduledTimeString = (date, time) => {
//     if (!date || !time) return "";
//     const scheduledDate = new Date(`${date}T${time}`);
//     return scheduledDate.toLocaleString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const toggleDropdown = (index) => {
//     setDropdownOpen(dropdownOpen === index ? null : index);
//     setServiceSearchTerm("");
//     setCurrentPage(0);
//   };

//   const toggleServiceManager = (index) => {
//     setShowServiceManager(showServiceManager === index ? null : index);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages - 1) {
//       setCurrentPage(prev => prev + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 0) {
//       setCurrentPage(prev => prev - 1);
//     }
//   };

//   return (
//     <div
//       className="position-relative p-4 p-md-5 mx-auto"
//       style={{
//         maxWidth: "1800px",
//         width: "100%",
//         border: "1px solid rgba(255, 255, 255, 0.2)",
//         background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//         overflow: "visible",
//         backdropFilter: "blur(10px)",
//         boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08)",
//       }}
//     >
//       {/* Animated background elements - Enhanced with more subtle orbs */}
//       <div
//         style={{
//           position: "absolute",
//           top: "-10%",
//           right: "-10%",
//           width: "300px",
//           height: "300px",
//           borderRadius: "50%",
//           background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
//           animation: "float 6s ease-in-out infinite",
//           filter: "blur(1px)",
//         }}
//       ></div>
//       <div
//         style={{
//           position: "absolute",
//           bottom: "-15%",
//           left: "-5%",
//           width: "200px",
//           height: "200px",
//           borderRadius: "50%",
//           background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
//           animation: "float 8s ease-in-out infinite 1s reverse",
//           filter: "blur(1px)",
//         }}
//       ></div>
//       <div
//         style={{
//           position: "absolute",
//           top: "50%",
//           left: "10%",
//           width: "150px",
//           height: "150px",
//           borderRadius: "50%",
//           background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)",
//           animation: "float 10s ease-in-out infinite 3s",
//           filter: "blur(2px)",
//         }}
//       ></div>

//       {/* Header - Enhanced with subtle glow */}
//       <div className="d-flex align-items-center mb-4 position-relative">
//         <div
//           className="d-flex justify-content-center align-items-center rounded-3 me-3 shadow-lg"
//           style={{
//             background: "rgba(255, 255, 255, 0.2)",
//             backdropFilter: "blur(10px)",
//             width: "60px",
//             height: "60px",
//             border: "1px solid rgba(255, 255, 255, 0.3)",
//             boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
//           }}
//         >
//           <CalendarClock size={28} color="white" />
//         </div>
//         <div>
//           <h3 className="fw-bold text-white mb-1" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>Schedule Content</h3>
//           <p className="text-white-50 mb-0" style={{ fontSize: "0.9rem", fontWeight: "300" }}>
//             Plan multiple services for each schedule
//           </p>
//         </div>
//       </div>

//       {/* Daily Schedule Overview - Modern card design */}
//       {Object.keys(groupedSchedules).length > 0 && (
//         <div className="mb-4 position-relative">
//           <div className="d-flex align-items-center mb-3">
//             <CalendarDays size={20} className="text-white me-2" />
//             <h5 className="text-white mb-0 fw-semibold">Daily Schedule Overview</h5>
//           </div>
//           <div className="d-flex flex-wrap gap-3">
//             {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
//               <div
//                 key={date}
//                 className="rounded-3 p-3 transition-all duration-300 hover:scale-105"
//                 style={{
//                   background: "rgba(255, 255, 255, 0.15)",
//                   backdropFilter: "blur(10px)",
//                   border: "1px solid rgba(255, 255, 255, 0.2)",
//                   minWidth: "200px",
//                   boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
//                   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.12)";
//                   e.currentTarget.style.transform = "translateY(-2px)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
//                   e.currentTarget.style.transform = "translateY(0)";
//                 }}
//               >
//                 <div className="fw-semibold text-white mb-2">
//                   {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
//                 </div>
//                 <div className="text-white-75" style={{ fontSize: "0.85rem", fontWeight: "400" }}>
//                   {daySchedules.length} schedule{daySchedules.length > 1 ? 's' : ''}
//                 </div>
//                 <div className="mt-2">
//                   <small className="text-white-50 fw-medium">
//                     Total services: {daySchedules.reduce((sum, s) => sum + s.services.length, 0)}
//                   </small>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Schedules - Enhanced card with better hover */}
//       <div className="d-flex flex-column align-items-center gap-4 position-relative" style={{ zIndex: 1 }}>
//         {schedules.map((schedule, index) => {
//           const isActive = showServiceManager === index || dropdownOpen === index;
//           return (
//             <div
//               key={index}
//               className="rounded-4 p-4 w-100 position-relative"
//               style={{
//                 background: "rgba(255, 255, 255, 0.95)",
//                 backdropFilter: "blur(10px)",
//                 border: "1px solid rgba(255, 255, 255, 0.3)",
//                 boxShadow: `
//                   0 8px 32px rgba(0, 0, 0, 0.08),
//                   0 4px 16px rgba(0, 0, 0, 0.04),
//                   ${hoverIndex === index ? "0 0 0 3px rgba(102, 126, 234 0.2)" : "none"}
//                 `,
//                 transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
//                 transform: hoverIndex === index ? "translateY(-4px)" : "translateY(0)",
//                 cursor: "default",
//                 maxWidth: "800px",
//                 overflow: "visible",
//                 borderRadius: "24px",
//                 position: "relative",
//                 zIndex: isActive ? 100 : 1,
//               }}
//               onMouseEnter={() => setHoverIndex(index)}
//               onMouseLeave={() => setHoverIndex(null)}
//             >
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <div className="d-flex align-items-center text-muted">
//                   <div className="d-flex align-items-center me-4">
//                     <Calendar size={16} className="me-2 text-primary" />
//                     <small className="fw-medium">Select date</small>
//                   </div>
//                   <div className="d-flex align-items-center">
//                     <Clock size={16} className="me-2 text-primary" />
//                     <small className="fw-medium">All timezones</small>
//                   </div>
//                 </div>
//                 <div className="d-flex gap-2">
//                   <button
//                     className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1 fw-medium"
//                     onClick={() => toggleServiceManager(index)}
//                     disabled={deletingIndex === index}
//                     style={{
//                       borderColor: "rgba(102, 126, 234, 0.5)",
//                       color: "#667eea",
//                       transition: "all 0.3s ease",
//                     }}
//                   >
//                     <ListChecks size={14} />
//                     <span>Manage Services ({schedule.services.length})</span>
//                   </button>
//                   {schedules.length > 1 && (
//                     <button
//                       className="btn btn-light btn-sm rounded-pill d-flex align-items-center gap-1 fw-medium"
//                       onClick={() => removeSchedule(index)}
//                       disabled={deletingIndex === index}
//                       style={{
//                         transition: "all 0.2s ease",
//                         opacity: hoverIndex === index ? 1 : 0.7,
//                         background: deletingIndex === index ? "#f3f4f6" : "rgba(255,255,255,0.8)",
//                         borderColor: deletingIndex === index ? "#d1d5db" : "rgba(0,0,0,0.1)",
//                       }}
//                     >
//                       {deletingIndex === index ? (
//                         <Loader size={14} className="animate-spin" />
//                       ) : (
//                         <Trash size={14} />
//                       )}
//                       <span>
//                         {deletingIndex === index ? "Deleting..." : "Remove"}
//                       </span>
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Date & Time inputs - Enhanced inputs */}
//               <div className="d-flex flex-column flex-md-row gap-3 mb-3">
//                 <div className="flex-fill">
//                   <label className="form-label text-sm text-muted mb-1 fw-medium">Date</label>
//                   <input
//                     type="date"
//                     className="form-control rounded-3 border-0 shadow-sm"
//                     style={{
//                       background: "rgba(255, 255, 255, 0.8)",
//                       fontSize: "0.95rem",
//                       padding: "0.875rem 1rem",
//                       transition: "all 0.3s ease",
//                       borderRadius: "12px",
//                       border: "1px solid rgba(0,0,0,0.05)",
//                     }}
//                     value={schedule.date}
//                     onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
//                     disabled={deletingIndex === index}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = "#667eea";
//                       e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = "rgba(0,0,0,0.05)";
//                       e.target.style.boxShadow = "none";
//                     }}
//                   />
//                 </div>
//                 <div className="flex-fill">
//                   <label className="form-label text-sm text-muted mb-1 fw-medium">Time</label>
//                   <input
//                     type="time"
//                     className="form-control rounded-3 border-0 shadow-sm"
//                     style={{
//                       background: "rgba(255, 255, 255, 0.8)",
//                       fontSize: "0.95rem",
//                       padding: "0.875rem 1rem",
//                       transition: "all 0.3s ease",
//                       borderRadius: "12px",
//                       border: "1px solid rgba(0,0,0,0.05)",
//                     }}
//                     value={schedule.time}
//                     onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
//                     disabled={deletingIndex === index}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = "#667eea";
//                       e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = "rgba(0,0,0,0.05)";
//                       e.target.style.boxShadow = "none";
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* Service Management Section - Glassmorphic panel */}
//               {showServiceManager === index && (
//                 <div
//                   className="p-4 rounded-3 border position-relative"
//                   style={{
//                     background: "rgba(255, 255, 255, 0.6)",
//                     backdropFilter: "blur(20px)",
//                     borderColor: "rgba(102, 126, 234, 0.2)",
//                     borderRadius: "16px",
//                     boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
//                     marginBottom: dropdownOpen === index ? '520px' : '1rem',
//                   }}>
//                   <div className="d-flex justify-content-between align-items-center mb-3">
//                     <div className="d-flex align-items-center">
//                       <ListChecks size={18} className="text-primary me-2" />
//                       <h6 className="mb-0 fw-semibold">Manage Services for this Schedule</h6>
//                     </div>
//                     <small className="text-muted fw-medium">
//                       {schedule.services.length} service{schedule.services.length !== 1 ? 's' : ''} selected
//                     </small>
//                   </div>

//                   {/* Selected Services List - Chip-like cards */}
//                   {schedule.services.length > 0 ? (
//                     <div className="mb-3">
//                       <div className="row g-2">
//                         {schedule.services.map((service, serviceIndex) => (
//                           <div key={serviceIndex} className="col-md-6 col-sm-12">
//                             <div className="d-flex align-items-center justify-content-between p-3 rounded-3 transition-all duration-300"
//                               style={{
//                                 background: "rgba(255, 255, 255, 0.9)",
//                                 border: "1px solid rgba(102, 126, 234, 0.2)",
//                                 boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
//                               }}
//                               onMouseEnter={(e) => {
//                                 e.currentTarget.style.transform = "translateY(-1px)";
//                                 e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
//                               }}
//                               onMouseLeave={(e) => {
//                                 e.currentTarget.style.transform = "translateY(0)";
//                                 e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
//                               }}
//                             >
//                               <div className="d-flex align-items-center">
//                                 <CheckCircle size={14} className="text-success me-2" />
//                                 <span className="text-truncate fw-medium" style={{ maxWidth: "200px" }}>{service}</span>
//                               </div>
//                               <button
//                                 className="btn btn-sm btn-outline-danger p-1 rounded-circle"
//                                 onClick={() => removeServiceFromSchedule(index, serviceIndex)}
//                                 style={{ width: "28px", height: "28px" }}
//                               >
//                                 <X size={12} />
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-4 mb-3 rounded-3"
//                       style={{
//                         background: "rgba(0, 0, 0, 0.02)",
//                         border: "1px dashed rgba(102, 126, 234, 0.3)",
//                         borderRadius: "12px",
//                       }}>
//                       <AlertCircle size={24} className="text-muted mb-2" />
//                       <p className="text-muted mb-0 fw-medium">No services selected for this schedule</p>
//                     </div>
//                   )}

//                   {/* Add Service Dropdown - Enhanced with better search */}
//                   <div className="position-relative" ref={dropdownRef}>
//                     <label className="form-label text-sm text-muted mb-1 fw-medium">Add Services</label>
//                     <div className="dropdown">
//                       <button
//                         className="form-control rounded-3 border-0 shadow-sm d-flex align-items-center justify-content-between text-start"
//                         onClick={() => toggleDropdown(index)}
//                         disabled={deletingIndex === index}
//                         style={{
//                           background: "rgba(255, 255, 255, 0.8)",
//                           fontSize: "0.95rem",
//                           padding: "0.875rem 1rem",
//                           transition: "all 0.3s ease",
//                           cursor: "pointer",
//                           minHeight: "48px",
//                           borderRadius: "12px",
//                           border: "1px solid rgba(0,0,0,0.05)",
//                         }}
//                       >
//                         <div className="d-flex align-items-center">
//                           <MessageSquare size={16} className="me-2 text-muted" />
//                           <span className="text-muted fw-medium">
//                             Select services to add...
//                           </span>
//                         </div>
//                         <ChevronDown size={16} className="text-muted transition-transform duration-300"
//                           style={{ transform: dropdownOpen === index ? 'rotate(180deg)' : 'rotate(0deg)' }} />
//                       </button>

//                       {dropdownOpen === index && (
//                         <div
//                           className="dropdown-menu show w-100 border-0 shadow-xl rounded-3 p-0"
//                           style={{
//                             position: "absolute",
//                             top: "100%",
//                             left: "0",
//                             marginTop: "8px",
//                             maxHeight: "500px",
//                             background: "rgba(255, 255, 255, 0.98)",
//                             backdropFilter: "blur(20px)",
//                             zIndex: 10001,
//                             overflow: "hidden",
//                             display: "flex",
//                             flexDirection: "column",
//                             width: "100%",
//                             minWidth: "300px",
//                             borderRadius: "16px",
//                             boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
//                           }}
//                         >
//                           {loadingServices ? (
//                             <div className="text-center p-4">
//                               <Loader size={20} className="animate-spin text-primary" />
//                               <p className="text-muted mt-2 mb-0 fw-medium">Loading Services...</p>
//                             </div>
//                           ) : allServices.length === 0 ? (
//                             <div className="text-center p-4">
//                               <MessageSquare size={24} className="text-muted mb-3" />
//                               <p className="text-muted mb-2 fw-medium">No saved Services</p>
//                               <button
//                                 className="btn btn-sm btn-primary rounded-pill px-3 py-2"
//                                 onClick={() => openAddServiceModal(index)}
//                                 style={{ fontWeight: "500" }}
//                               >
//                                 <PlusCircle size={14} className="me-1" />
//                                 Add New Service
//                               </button>
//                             </div>
//                           ) : (
//                             <>
//                               {/* Search Bar - Modern input */}
//                               <div className="position-sticky top-0 bg-white p-3 border-bottom rounded-top-3"
//                                 style={{ zIndex: 1, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
//                                 <div className="input-group input-group-sm">
//                                   <span className="input-group-text bg-transparent border-end-0">
//                                     <Search size={14} className="text-muted" />
//                                   </span>
//                                   <input
//                                     type="text"
//                                     className="form-control border-start-0"
//                                     placeholder="Search services..."
//                                     value={serviceSearchTerm}
//                                     onChange={(e) => setServiceSearchTerm(e.target.value)}
//                                     style={{
//                                       fontSize: "0.85rem",
//                                       borderRadius: "8px 0 0 8px",
//                                     }}
//                                   />
//                                   {serviceSearchTerm && (
//                                     <button
//                                       className="btn btn-outline-secondary rounded-end"
//                                       onClick={() => setServiceSearchTerm("")}
//                                       style={{
//                                         fontSize: "0.85rem",
//                                         borderRadius: "0 8px 8px 0",
//                                       }}
//                                     >
//                                       <X size={12} />
//                                     </button>
//                                   )}
//                                 </div>
//                                 <small className="text-muted d-block mt-1 fw-medium">
//                                   {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
//                                 </small>
//                               </div>

//                               {/* Services List with Scroll - Better item styling */}
//                               <div style={{
//                                 flex: "1",
//                                 maxHeight: "320px",
//                                 overflowY: "auto",
//                                 padding: "1rem",
//                               }}>
//                                 {currentServices.length === 0 ? (
//                                   <div className="text-center p-4">
//                                     <MessageSquare size={32} className="text-muted mb-2" />
//                                     <p className="text-muted mb-0 fw-medium">No services found</p>
//                                     {serviceSearchTerm && (
//                                       <button
//                                         className="btn btn-sm btn-link mt-2 p-0"
//                                         onClick={() => setServiceSearchTerm("")}
//                                         style={{ fontWeight: "500" }}
//                                       >
//                                         Clear search
//                                       </button>
//                                     )}
//                                   </div>
//                                 ) : (
//                                   currentServices.map((service, serviceIndex) => {
//                                     const isSelected = schedule.services.includes(service.text);
//                                     return (
//                                       <button
//                                         key={serviceIndex}
//                                         className={`dropdown-item rounded-2 p-3 mb-2 text-start d-flex align-items-center justify-content-between w-100 ${isSelected ? 'bg-success bg-opacity-10 border-start-success' : 'border-start-primary'}`}
//                                         onClick={() => {
//                                           if (!isSelected) {
//                                             addServiceToSchedule(index, service.text);
//                                           }
//                                         }}
//                                         style={{
//                                           transition: "all 0.3s ease",
//                                           border: "none",
//                                           borderLeft: `4px solid ${isSelected ? '#10b981' : '#667eea'}`,
//                                           fontSize: "0.9rem",
//                                           borderRadius: "12px",
//                                           background: "rgba(255,255,255,0.5)",
//                                         }}
//                                         onMouseEnter={(e) => {
//                                           if (!isSelected) {
//                                             e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
//                                             e.currentTarget.style.transform = "translateX(4px)";
//                                           }
//                                         }}
//                                         onMouseLeave={(e) => {
//                                           if (!isSelected) {
//                                             e.currentTarget.style.background = "rgba(255,255,255,0.5)";
//                                             e.currentTarget.style.transform = "translateX(0)";
//                                           }
//                                         }}
//                                       >
//                                         <div className="d-flex align-items-start" style={{ maxWidth: "80%" }}>
//                                           <MessageSquare size={12} className="mt-1 me-2 text-primary shrink-0" />
//                                           <div className="text-truncate">
//                                             <div className="fw-semibold text-truncate" style={{ maxWidth: "250px" }}>
//                                               {service.text}
//                                             </div>
//                                             <small className="text-muted d-block fw-normal">
//                                               {new Date(service.createdAt).toLocaleDateString()}
//                                             </small>
//                                           </div>
//                                         </div>
//                                         {isSelected && (
//                                           <CheckCircle size={16} className="text-success shrink-0" />
//                                         )}
//                                       </button>
//                                     );
//                                   })
//                                 )}
//                               </div>

//                               {/* Pagination Controls - Modern buttons */}
//                               {totalPages > 1 && (
//                                 <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white rounded-bottom-3"
//                                   style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
//                                   <button
//                                     className="btn btn-sm btn-outline-secondary rounded-pill px-3"
//                                     onClick={handlePrevPage}
//                                     disabled={currentPage === 0}
//                                     style={{
//                                       fontSize: "0.8rem",
//                                       fontWeight: "500",
//                                       minWidth: "80px",
//                                     }}
//                                   >
//                                     Previous
//                                   </button>
//                                   <small className="text-muted fw-medium">
//                                     Page {currentPage + 1} of {totalPages}
//                                   </small>
//                                   <button
//                                     className="btn btn-sm btn-outline-secondary rounded-pill px-3"
//                                     onClick={handleNextPage}
//                                     disabled={currentPage >= totalPages - 1}
//                                     style={{
//                                       fontSize: "0.8rem",
//                                       fontWeight: "500",
//                                       minWidth: "80px",
//                                     }}
//                                   >
//                                     Next
//                                   </button>
//                                 </div>
//                               )}

//                               {/* Add New Service Button - Enhanced hover */}
//                               <div className="border-top p-3 bg-white rounded-bottom-3"
//                                 style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
//                                 <button
//                                   className="dropdown-item rounded-2 p-3 text-primary fw-semibold d-flex align-items-center justify-content-center w-100 transition-all duration-300"
//                                   onClick={() => openAddServiceModal(index)}
//                                   style={{
//                                     background: "rgba(102, 126, 234, 0.05)",
//                                     border: "1px solid rgba(102, 126, 234, 0.2)",
//                                     borderRadius: "12px",
//                                   }}
//                                   onMouseEnter={(e) => {
//                                     e.currentTarget.style.background = "rgba(102, 126, 234, 0.15)";
//                                     e.currentTarget.style.transform = "translateY(-2px)";
//                                     e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
//                                   }}
//                                   onMouseLeave={(e) => {
//                                     e.currentTarget.style.background = "rgba(102, 126, 234, 0.05)";
//                                     e.currentTarget.style.transform = "translateY(0)";
//                                     e.currentTarget.style.boxShadow = "none";
//                                   }}
//                                 >
//                                   <PlusCircle size={16} className="me-2" />
//                                   Add New Service
//                                 </button>
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Quick Add Service (if not showing full manager) */}
//               {showServiceManager !== index && schedule.services.length === 0 && (
//                 <div className="mb-3">
//                   <button
//                     className="btn btn-outline-primary w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2 fw-semibold transition-all duration-300"
//                     onClick={() => toggleServiceManager(index)}
//                     style={{
//                       borderColor: "#667eea",
//                       color: "#667eea",
//                       borderWidth: "2px",
//                       borderRadius: "16px",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
//                       e.currentTarget.style.transform = "translateY(-2px)";
//                       e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = "transparent";
//                       e.currentTarget.style.transform = "translateY(0)";
//                       e.currentTarget.style.boxShadow = "none";
//                     }}
//                   >
//                     <Plus size={16} />
//                     <span>Add Services to this Schedule</span>
//                   </button>
//                 </div>
//               )}

//               {/* Services Preview - Enhanced badges */}
//               {schedule.services.length > 0 && showServiceManager !== index && (
//                 <div className="mb-3">
//                   <div className="d-flex align-items-center mb-2">
//                     <ListChecks size={16} className="text-primary me-2" />
//                     <small className="text-muted fw-medium">Selected Services:</small>
//                     <button
//                       className="btn btn-sm btn-link ms-2 p-0 fw-normal"
//                       onClick={() => toggleServiceManager(index)}
//                     >
//                       <MoreVertical size={14} />
//                     </button>
//                   </div>
//                   <div className="d-flex flex-wrap gap-2">
//                     {schedule.services.map((service, serviceIndex) => (
//                       <span
//                         key={serviceIndex}
//                         className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1 fw-medium transition-all duration-300"
//                         style={{
//                           maxWidth: "200px",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           border: "1px solid rgba(102, 126, 234, 0.2)",
//                           borderRadius: "20px",
//                         }}
//                       >
//                         <CheckCircle size={12} />
//                         <span className="text-truncate">{service}</span>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Scheduled time display - Enhanced gradient */}
//               {schedule.date && schedule.time ? (
//                 <div
//                   className="p-4 rounded-3 d-flex flex-column align-items-center position-relative overflow-hidden"
//                   style={{
//                     background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//                     color: "white",
//                     transition: "all 0.4s ease",
//                     borderRadius: "16px",
//                     boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
//                     position: "relative",
//                   }}
//                 >
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: 0,
//                       left: 0,
//                       right: 0,
//                       height: "2px",
//                       background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
//                     }}
//                   />
//                   <div className="d-flex align-items-center gap-2 mb-1 position-relative z-1">
//                     <Clock4 size={20} />
//                     <span className="fw-semibold">Scheduled</span>
//                     {schedule.id && (
//                       <span className="badge bg-light text-dark ms-2 fw-medium">Saved</span>
//                     )}
//                   </div>
//                   <div className="text-center position-relative z-1">
//                     <div className="fw-bold fs-5">{getScheduledTimeString(schedule.date, schedule.time)}</div>
//                     {schedule.services.length > 0 && (
//                       <div className="mt-2">
//                         <small className="opacity-90 fw-medium">
//                           Services: {schedule.services.length} scheduled
//                         </small>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div
//                   className="p-4 rounded-3 text-center text-muted d-flex align-items-center justify-content-center gap-2 transition-all duration-300"
//                   style={{
//                     background: "rgba(255, 255, 255, 0.5)",
//                     border: "2px dashed rgba(102, 126, 234, 0.3)",
//                     borderRadius: "16px",
//                     cursor: "pointer",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = "rgba(102, 126, 234, 0.05)";
//                     e.currentTarget.style.transform = "scale(1.02)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
//                     e.currentTarget.style.transform = "scale(1)";
//                   }}
//                 >
//                   <Clock size={16} />
//                   <span className="fw-medium">Select a date and time to schedule</span>
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {/* Buttons - Enhanced with better spacing and effects */}
//         <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: "800px", zIndex: 10 }}>
//           <button
//             className="btn rounded-pill d-flex align-items-center justify-content-center gap-2 py-3 fw-semibold transition-all duration-300"
//             onClick={addSchedule}
//             disabled={loading || deletingIndex !== null}
//             style={{
//               background: "rgba(255, 255, 255, 0.9)",
//               border: "2px solid rgba(255, 255, 255, 0.3)",
//               backdropFilter: "blur(10px)",
//               color: "#667eea",
//               borderRadius: "50px",
//               fontSize: "1rem",
//             }}
//             onMouseEnter={(e) => {
//               if (!e.currentTarget.disabled) {
//                 e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
//                 e.currentTarget.style.transform = "translateY(-2px)";
//                 e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.2)";
//               }
//             }}
//             onMouseLeave={(e) => {
//               if (!e.currentTarget.disabled) {
//                 e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
//                 e.currentTarget.style.transform = "translateY(0)";
//                 e.currentTarget.style.boxShadow = "none";
//               }
//             }}
//           >
//             <Plus size={18} />
//             <span>Add Another Schedule</span>
//           </button>
//           <button
//             className={`btn fw-bold text-white rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 fs-6 ${loading || !schedules.some((s) => s.date && s.time && s.services.length > 0)
//               ? "opacity-50 cursor-not-allowed"
//               : ""
//               }`}
//             onClick={handleSave}
//             disabled={loading || !schedules.some((s) => s.date && s.time && s.services.length > 0) || deletingIndex !== null}
//             style={{
//               background: loading || !schedules.some((s) => s.date && s.time && s.services.length > 0)
//                 ? "#9ca3af"
//                 : "linear-gradient(135deg, #10b981, #059669)",
//               border: "none",
//               transition: "all 0.4s ease",
//               transform: loading ? "scale(0.98)" : "scale(1)",
//               borderRadius: "50px",
//               minHeight: "56px",
//               boxShadow: loading || !schedules.some((s) => s.date && s.time && s.services.length > 0) ? "none" : "0 8px 20px rgba(16, 185, 129, 0.3)",
//             }}
//             onMouseEnter={(e) => {
//               if (!e.currentTarget.disabled) {
//                 e.currentTarget.style.transform = "translateY(-2px)";
//                 e.currentTarget.style.boxShadow = "0 12px 30px rgba(16, 185, 129, 0.4)";
//               }
//             }}
//             onMouseLeave={(e) => {
//               if (!e.currentTarget.disabled) {
//                 e.currentTarget.style.transform = "translateY(0)";
//                 e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
//               }
//             }}
//           >
//             {loading ? (
//               <>
//                 <Loader size={18} className="animate-spin" />
//                 <span>Saving Schedules...</span>
//               </>
//             ) : (
//               <span>Save All Schedules</span>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Enhanced Add New Service Modal - Further polished */}
//       {showAddServiceModal && (
//         <>
//           {/* Backdrop - Enhanced blur */}
//           <div
//             className="position-fixed top-0 start-0 w-100 h-100"
//             style={{
//               backgroundColor: "rgba(0, 0, 0, 0.6)",
//               backdropFilter: "blur(8px)",
//               zIndex: 1040,
//               animation: "backdropFadeIn 0.3s ease-out",
//             }}
//           />
//           {/* Modal */}
//           <div
//             className="modal show d-block"
//             tabIndex="-1"
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               zIndex: 1050,
//               overflowY: "auto",
//               padding: "1rem",
//             }}
//           >
//             <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: "600px" }}>
//               <div
//                 className="modal-content rounded-4 overflow-hidden border-0 shadow-2xl"
//                 style={{
//                   background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
//                   border: "1px solid rgba(255, 255, 255, 0.4)",
//                   boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
//                   animation: "modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
//                   transformOrigin: "center",
//                   borderRadius: "24px",
//                 }}
//               >
//                 {/* Modal Header with gradient - Enhanced decoration */}
//                 <div
//                   className="modal-header position-relative border-0 pb-4 pt-5"
//                   style={{
//                     background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//                     color: "white",
//                   }}
//                 >
//                   {/* Decorative elements - More subtle */}
//                   <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden opacity-5">
//                     <div style={{
//                       position: "absolute",
//                       top: "-30%",
//                       right: "-15%",
//                       width: "150px",
//                       height: "150px",
//                       borderRadius: "50%",
//                       background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
//                       filter: "blur(2px)",
//                     }}></div>
//                     <div style={{
//                       position: "absolute",
//                       bottom: "-20%",
//                       left: "-10%",
//                       width: "100px",
//                       height: "100px",
//                       borderRadius: "50%",
//                       background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
//                       filter: "blur(1px)",
//                     }}></div>
//                   </div>
//                   <div className="position-relative z-1 d-flex align-items-center w-100">
//                     <div
//                       className="d-flex align-items-center justify-content-center rounded-3 me-3"
//                       style={{
//                         background: "rgba(255, 255, 255, 0.2)",
//                         backdropFilter: "blur(10px)",
//                         width: "52px",
//                         height: "52px",
//                         border: "1px solid rgba(255, 255, 255, 0.3)",
//                         boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//                       }}
//                     >
//                       <PlusCircle size={26} color="white" />
//                     </div>
//                     <div className="grow">
//                       <h4 className="modal-title fw-bold mb-0" style={{ letterSpacing: "0.5px", fontSize: "1.5rem" }}>
//                         New Service
//                       </h4>
//                       <p className="text-white-75 mb-0 mt-1" style={{ fontSize: "0.95rem", fontWeight: "300" }}>
//                         Add a service that you can reuse across multiple schedules
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       className="btn-close btn-close-white position-relative"
//                       onClick={() => {
//                         setShowAddServiceModal(false);
//                         setCurrentScheduleIndex(null);
//                         setNewServiceText("");
//                       }}
//                       style={{
//                         background: "transparent",
//                         border: "none",
//                         fontSize: "1.5rem",
//                         opacity: 0.8,
//                         transition: "all 0.3s ease",
//                         width: "32px",
//                         height: "32px",
//                         borderRadius: "50%",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.opacity = "1";
//                         e.currentTarget.style.background = "rgba(255,255,255,0.1)";
//                         e.currentTarget.style.transform = "scale(1.1)";
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.opacity = "0.8";
//                         e.currentTarget.style.background = "transparent";
//                         e.currentTarget.style.transform = "scale(1)";
//                       }}
//                     >
//                       <X size={20} />
//                     </button>
//                   </div>
//                 </div>
//                 {/* Modal Body - Enhanced textarea */}
//                 <div className="modal-body p-4 p-md-5">
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold mb-3 d-flex align-items-center text-primary fs-6">
//                       <MessageSquare size={18} className="me-2" />
//                       Service Description
//                     </label>
//                     <div className="position-relative">
//                       <textarea
//                         className="form-control rounded-3 border"
//                         placeholder="Describe your service here..."
//                         rows={4}
//                         value={newServiceText}
//                         onChange={(e) => setNewServiceText(e.target.value)}
//                         style={{
//                           fontSize: "1rem",
//                           padding: "1.25rem",
//                           borderColor: "rgba(102, 126, 234, 0.3)",
//                           background: "rgba(102, 126, 234, 0.02)",
//                           transition: "all 0.4s ease",
//                           resize: "vertical",
//                           minHeight: "140px",
//                           borderRadius: "16px",
//                           borderWidth: "2px",
//                           fontFamily: "inherit",
//                           lineHeight: "1.6",
//                         }}
//                         maxLength={500}
//                         onFocus={(e) => {
//                           e.target.style.borderColor = "#667eea";
//                           e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1), inset 0 1px 2px rgba(0,0,0,0.05)";
//                           e.target.style.background = "rgba(102, 126, 234, 0.05)";
//                           e.target.style.transform = "scale(1.02)";
//                         }}
//                         onBlur={(e) => {
//                           e.target.style.borderColor = "rgba(102, 126, 234, 0.3)";
//                           e.target.style.boxShadow = "none";
//                           e.target.style.background = "rgba(102, 126, 234, 0.02)";
//                           e.target.style.transform = "scale(1)";
//                         }}
//                       />
//                       <div className="text-end mt-2">
//                         <small className="text-muted fw-medium">
//                           {newServiceText.length}/500 characters
//                         </small>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 {/* Modal Footer - Enhanced buttons */}
//                 <div className="modal-footer border-top-0 bg-light bg-opacity-50 p-4 rounded-bottom-4">
//                   <div className="d-flex justify-content-end w-100 gap-3">
//                     <button
//                       type="button"
//                       className="btn btn-outline-secondary rounded-pill px-4 py-2.5 d-flex align-items-center fw-medium transition-all duration-300"
//                       onClick={() => {
//                         setShowAddServiceModal(false);
//                         setCurrentScheduleIndex(null);
//                         setNewServiceText("");
//                       }}
//                       style={{
//                         borderWidth: "2px",
//                         borderRadius: "50px",
//                         minWidth: "120px",
//                         fontSize: "0.95rem",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.transform = "translateY(-2px)";
//                         e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.transform = "translateY(0)";
//                         e.currentTarget.style.boxShadow = "none";
//                       }}
//                     >
//                       <X size={16} className="me-2" />
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       className="btn btn-primary rounded-pill px-4 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-semibold transition-all duration-300"
//                       onClick={handleSaveNewService}
//                       disabled={!newServiceText.trim() || savingNewService}
//                       style={{
//                         background: "linear-gradient(135deg, #10b981, #059669)",
//                         border: "none",
//                         minWidth: "160px",
//                         borderRadius: "50px",
//                         fontSize: "0.95rem",
//                         boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
//                       }}
//                       onMouseEnter={(e) => {
//                         if (!e.currentTarget.disabled) {
//                           e.currentTarget.style.transform = "translateY(-2px)";
//                           e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.4)";
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (!e.currentTarget.disabled) {
//                           e.currentTarget.style.transform = "translateY(0)";
//                           e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
//                         }
//                       }}
//                     >
//                       {savingNewService ? (
//                         <>
//                           <Loader size={16} className="animate-spin me-2" />
//                           <span>Saving...</span>
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle size={16} className="me-2" />
//                           <span>Save Service</span>
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Enhanced CSS animations and styles */}
//       <style>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           50% { transform: translateY(-15px) rotate(2deg); }
//         }
//         @keyframes backdropFadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes modalSlideIn {
//           from {
//             opacity: 0;
//             transform: translateY(40px) scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0) scale(1);
//           }
//         }
//         .shadow-xl {
//           box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12);
//         }
//         .shadow-2xl {
//           box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.15);
//         }
//         .btn-close-white {
//           filter: invert(1) grayscale(100%) brightness(200%);
//         }
//         .modal.show {
//           display: block !important;
//           overflow-y: auto;
//         }
//         .modal-dialog {
//           margin: 1.75rem auto;
//         }
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         .form-control:focus {
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//           border-color: #667eea;
//           transform: scale(1.02);
//         }
//         .dropdown-item:hover {
//           background-color: rgba(102, 126, 234, 0.1) !important;
//           transform: translateX(8px);
//         }
//         .dropdown-menu::-webkit-scrollbar {
//           width: 6px;
//         }
//         .dropdown-menu::-webkit-scrollbar-track {
//           background: rgba(0, 0, 0, 0.02);
//           border-radius: 10px;
//         }
//         .dropdown-menu::-webkit-scrollbar-thumb {
//           background: rgba(102, 126, 234, 0.4);
//           border-radius: 10px;
//         }
//         .dropdown-menu::-webkit-scrollbar-thumb:hover {
//           background: rgba(102, 126, 234, 0.6);
//         }
//         .text-truncate {
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//         }
//         .sticky-bottom {
//           position: -webkit-sticky;
//           position: sticky;
//           bottom: 0;
//         }
//         /* Fix for dropdown positioning */
//         .dropdown {
//           position: static !important;
//         }
//         .dropdown-menu.show {
//           position: fixed !important;
//           z-index: 10002 !important;
//         }
//         /* Responsive enhancements */
//         @media (max-width: 768px) {
//           .schedule-card {
//             margin: 0 -1rem;
//             border-radius: 0;
//           }
//           .modal-dialog {
//             margin: 0.5rem;
//             max-width: calc(100% - 1rem);
//           }
//           .dropdown-menu.show {
//             width: 95vw !important;
//             left: 2.5vw !important;
//             transform: none !important;
//           }
//         }
//         /* Smooth transitions for all interactive elements */
//         * {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }
//         .border-start-primary {
//           border-left-color: #667eea !important;
//         }
//         .border-start-success {
//           border-left-color: #10b981 !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Schedule;


import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectedUserId } from "../../store/authSlice";
import { setScheduleId } from "../../store/scheduleSlice";
import axios from "axios";
import {
  CalendarClock, Clock, Calendar, CheckCircle, Plus, Trash,
  Loader, ChevronDown, MessageSquare, PlusCircle, X,
  AlertCircle, ListChecks, CalendarDays, MoreVertical,
  Clock4, Search
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const Schedule = ({ blockId, parentId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);

  const [schedules, setSchedules] = useState([{
    date: "",
    time: "",
    services: [],
    id: null
  }]);

  const [loading, setLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(null);
  const [newServiceText, setNewServiceText] = useState("");
  const [savingNewService, setSavingNewService] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showServiceManager, setShowServiceManager] = useState(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [servicesPerPage] = useState(10);

  const dropdownRef = useRef(null);

  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm.trim()) return allServices;
    return allServices.filter(service =>
      service.text.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );
  }, [allServices, serviceSearchTerm]);

  const currentServices = useMemo(() => {
    const startIndex = currentPage * servicesPerPage;
    return filteredServices.slice(startIndex, startIndex + servicesPerPage);
  }, [filteredServices, currentPage, servicesPerPage]);

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await axios.get(`${API_URL}/service/${userId}`);
        if (response.data.success) {
          const mappedServices = response.data.data ? response.data.data.map(s => ({
            text: s.title,
            createdAt: s.createdAt
          })) : [];
          setAllServices(mappedServices);
        } else {
          setAllServices([]);
          toast.info("No services available");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
        setAllServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    if (userId) {
      fetchServices();
    } else {
      setLoadingServices(false);
    }
  }, [userId]);

  useEffect(() => {
    setCurrentPage(0);
  }, [serviceSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (dropdownOpen !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [dropdownOpen]);

  const groupedSchedules = useMemo(() => {
    const groups = {};
    schedules.forEach((schedule, index) => {
      if (schedule.date) {
        if (!groups[schedule.date]) {
          groups[schedule.date] = [];
        }
        groups[schedule.date].push({ ...schedule, originalIndex: index });
      }
    });
    return groups;
  }, [schedules]);

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = schedules.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    );
    setSchedules(updatedSchedules);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { date: "", time: "", services: [], id: null }]);
  };

  const removeSchedule = async (index) => {
    if (schedules.length === 1) return;
    const scheduleToRemove = schedules[index];
    const currentSchedules = [...schedules];

    if (scheduleToRemove.id) {
      setDeletingIndex(index);
      try {
        const res = await axios.delete(`${API_URL}/schedules/${scheduleToRemove.id}`, {
          data: { userId, blockId, parentId }
        });
        if (res.data.message) {
          toast.success("Schedule deleted successfully!");
          const newSchedules = currentSchedules.filter((_, i) => i !== index);
          setSchedules(newSchedules);
          const remainingIds = newSchedules
            .map(s => s.id)
            .filter(id => id !== null);
          dispatch(setScheduleId(remainingIds));
        } else {
          toast.error(res.data.message || "Failed to delete schedule");
        }
      } catch (err) {
        toast.error("Failed to delete schedule");
        console.error("Delete schedule error:", err.message);
      } finally {
        setDeletingIndex(null);
      }
    } else {
      const newSchedules = currentSchedules.filter((_, i) => i !== index);
      setSchedules(newSchedules);
    }
    setHoverIndex(null);
    setDropdownOpen(null);
    setShowServiceManager(null);
  };

  const addServiceToSchedule = (scheduleIndex, serviceText) => {
    const updatedSchedules = schedules.map((schedule, i) => {
      if (i === scheduleIndex) {
        if (!schedule.services.includes(serviceText)) {
          return {
            ...schedule,
            services: [...schedule.services, serviceText]
          };
        }
      }
      return schedule;
    });
    setSchedules(updatedSchedules);
    setDropdownOpen(null);
  };

  const removeServiceFromSchedule = (scheduleIndex, serviceIndex) => {
    const updatedSchedules = schedules.map((schedule, i) => {
      if (i === scheduleIndex) {
        const newServices = [...schedule.services];
        newServices.splice(serviceIndex, 1);
        return { ...schedule, services: newServices };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);
  };

  const openAddServiceModal = (index) => {
    setCurrentScheduleIndex(index);
    setNewServiceText("");
    setShowAddServiceModal(true);
    setDropdownOpen(null);
  };

  const handleSaveNewService = async () => {
    if (!newServiceText.trim()) return;
    setSavingNewService(true);
    try {
      const response = await axios.post(`${API_URL}/service/Create`, {
        services: newServiceText.trim(),
        userId,
      });
      if (response.data.success) {
        const newServiceObj = response.data.comment;
        setAllServices(prev => [newServiceObj, ...prev]);
        if (currentScheduleIndex !== null) {
          addServiceToSchedule(currentScheduleIndex, newServiceObj.text);
        }
        setNewServiceText("");
        setShowAddServiceModal(false);
        setCurrentScheduleIndex(null);
        toast.success("Service saved successfully!");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setSavingNewService(false);
    }
  };

  const handleSave = async () => {
    const validSchedules = schedules.filter((s) => s.date && s.time && s.services.length > 0);
    if (!validSchedules.length) return;
    setLoading(true);
    try {
      const schedulesForAPI = validSchedules.map((s) => ({
        ...s,
        comment: s.services.join(" | "),
        userId,
        blockId,
        parentId
      }));
      const res = await axios.post(`${API_URL}/schedules/save`, {
        schedules: schedulesForAPI,
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

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
    setServiceSearchTerm("");
    setCurrentPage(0);
  };

  const toggleServiceManager = (index) => {
    setShowServiceManager(showServiceManager === index ? null : index);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="relative p-4 md:p-8 mx-auto max-w-7xl w-full border border-white/20 bg-linear-to-br from-indigo-500 to-purple-600 overflow-visible backdrop-blur-lg shadow-2xl rounded-3xl">
      {/* Animated background elements */}
      <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%) animate-float blur-sm"></div>
      <div className="absolute -bottom-15 -left-5 w-48 h-48 rounded-full bg-radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%) animate-float-delayed blur-sm"></div>
      <div className="absolute top-1/2 left-10 w-36 h-36 rounded-full bg-radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%) animate-float-slow blur"></div>

      {/* Header */}
      <div className="flex items-center mb-8 relative">
        <div className="flex justify-center items-center rounded-2xl mr-4 shadow-xl bg-white/20 backdrop-blur-lg w-14 h-14 border border-white/30 shadow-white/10">
          <CalendarClock size={28} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white mb-2 text-shadow-lg">Schedule Content</h3>
          <p className="text-white/80 text-sm font-light">
            Plan multiple services for each schedule
          </p>
        </div>
      </div>

      {/* Daily Schedule Overview */}
      {Object.keys(groupedSchedules).length > 0 && (
        <div className="mb-8 relative">
          <div className="flex items-center mb-4">
            <CalendarDays size={20} className="text-white mr-2" />
            <h5 className="text-white font-semibold">Daily Schedule Overview</h5>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
              <div
                key={date}
                className="rounded-2xl p-4 transition-all duration-300 hover:scale-105 bg-white/15 backdrop-blur-lg border border-white/20 min-w-[200px] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="font-semibold text-white mb-2">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-white/75 text-sm font-normal">
                  {daySchedules.length} schedule{daySchedules.length > 1 ? 's' : ''}
                </div>
                <div className="mt-2">
                  <small className="text-white/50 font-medium">
                    Total services: {daySchedules.reduce((sum, s) => sum + s.services.length, 0)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedules */}
      <div className="flex flex-col items-center gap-6 relative z-10">
        {schedules.map((schedule, index) => {
          const isActive = showServiceManager === index || dropdownOpen === index;
          return (
            <div
              key={index}
              className={`rounded-3xl p-6 w-full relative bg-white/95 backdrop-blur-lg border border-white/30 shadow-2xl transition-all duration-400 cursor-default max-w-2xl overflow-visible ${hoverIndex === index ? 'shadow-indigo-200/20 -translate-y-1' : ''
                } ${isActive ? 'z-50' : 'z-10'}`}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center text-gray-600">
                  <div className="flex items-center mr-6">
                    <Calendar size={16} className="mr-2 text-indigo-600" />
                    <small className="font-medium">Select date</small>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-indigo-600" />
                    <small className="font-medium">All timezones</small>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="btn-outline-indigo rounded-full flex items-center gap-2 font-medium px-4 py-2 text-sm border border-indigo-500/50 text-indigo-600 transition-all hover:bg-indigo-50"
                    onClick={() => toggleServiceManager(index)}
                    disabled={deletingIndex === index}
                  >
                    <ListChecks size={14} />
                    <span>Manage Services ({schedule.services.length})</span>
                  </button>
                  {schedules.length > 1 && (
                    <button
                      className="btn-light rounded-full flex items-center gap-2 font-medium px-4 py-2 text-sm bg-white/80 border border-gray-200 transition-all hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:opacity-70"
                      onClick={() => removeSchedule(index)}
                      disabled={deletingIndex === index}
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
              </div>

              {/* Date & Time inputs */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border shadow-sm bg-white/80 text-sm px-4 py-3 transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 border border-gray-100"
                    value={schedule.date}
                    onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                    disabled={deletingIndex === index}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2 font-medium">Time</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border shadow-sm bg-white/80 text-sm px-4 py-3 transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 border border-gray-100"
                    value={schedule.time}
                    onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
                    disabled={deletingIndex === index}
                  />
                </div>
              </div>

              {/* Service Management Section */}
              {showServiceManager === index && (
                <div
                  className="p-6 rounded-2xl border relative bg-white/60 backdrop-blur-xl border-indigo-500/20 shadow-lg mb-4"
                  style={{ marginBottom: dropdownOpen === index ? '520px' : '1rem' }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <ListChecks size={18} className="text-indigo-600 mr-2" />
                      <h6 className="font-semibold">Manage Services for this Schedule</h6>
                    </div>
                    <small className="text-gray-600 font-medium">
                      {schedule.services.length} service{schedule.services.length !== 1 ? 's' : ''} selected
                    </small>
                  </div>

                  {/* Selected Services List */}
                  {schedule.services.length > 0 ? (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {schedule.services.map((service, serviceIndex) => (
                          <div
                            key={serviceIndex}
                            className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 bg-white/90 border border-indigo-500/20 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            <div className="flex items-center">
                              <CheckCircle size={14} className="text-emerald-500 mr-2" />
                              <span className="font-medium truncate max-w-[200px]">{service}</span>
                            </div>
                            <button
                              className="btn-outline-danger rounded-full p-1.5 w-7 h-7 flex items-center justify-center"
                              onClick={() => removeServiceFromSchedule(index, serviceIndex)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 mb-6 rounded-xl bg-black/5 border border-dashed border-indigo-500/30">
                      <AlertCircle size={24} className="text-gray-400 mb-3 mx-auto" />
                      <p className="text-gray-600 font-medium">No services selected for this schedule</p>
                    </div>
                  )}

                  {/* Add Service Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Add Services</label>
                    <div className="dropdown">
                      <button
                        className="w-full rounded-xl border shadow-sm bg-white/80 text-sm px-4 py-3 flex items-center justify-between text-left transition-all cursor-pointer min-h-[48px] border border-gray-100 hover:border-indigo-500/50"
                        onClick={() => toggleDropdown(index)}
                        disabled={deletingIndex === index}
                      >
                        <div className="flex items-center">
                          <MessageSquare size={16} className="mr-2 text-gray-400" />
                          <span className="text-gray-400 font-medium">
                            Select services to add...
                          </span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`text-gray-400 transition-transform duration-300 ${dropdownOpen === index ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {dropdownOpen === index && (
                        <div
                          className="dropdown-menu absolute top-full left-0 w-full mt-2 border-0 shadow-2xl rounded-2xl p-0 max-h-[500px] bg-white/98 backdrop-blur-xl z-[10001] overflow-hidden flex flex-col"
                          style={{ width: '100%', minWidth: '300px' }}
                        >
                          {loadingServices ? (
                            <div className="text-center p-8">
                              <Loader size={20} className="animate-spin text-indigo-600 mx-auto" />
                              <p className="text-gray-600 mt-3 font-medium">Loading Services...</p>
                            </div>
                          ) : allServices.length === 0 ? (
                            <div className="text-center p-8">
                              <MessageSquare size={24} className="text-gray-400 mb-4 mx-auto" />
                              <p className="text-gray-600 mb-3 font-medium">No saved Services</p>
                              <button
                                className="btn-primary rounded-full px-4 py-2 text-sm font-medium"
                                onClick={() => openAddServiceModal(index)}
                              >
                                <PlusCircle size={14} className="mr-1 inline" />
                                Add New Service
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Search Bar */}
                              <div className="sticky top-0 bg-white p-4 border-b border-gray-100 rounded-t-2xl z-10">
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                      type="text"
                                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                      placeholder="Search services..."
                                      value={serviceSearchTerm}
                                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                                    />
                                    {serviceSearchTerm && (
                                      <button
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setServiceSearchTerm("")}
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <small className="text-gray-500 block mt-2 font-medium">
                                  {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                                </small>
                              </div>

                              {/* Services List */}
                              <div className="flex-1 max-h-80 overflow-y-auto p-4">
                                {currentServices.length === 0 ? (
                                  <div className="text-center p-8">
                                    <MessageSquare size={32} className="text-gray-400 mb-4 mx-auto" />
                                    <p className="text-gray-600 font-medium mb-3">No services found</p>
                                    {serviceSearchTerm && (
                                      <button
                                        className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                                        onClick={() => setServiceSearchTerm("")}
                                      >
                                        Clear search
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  currentServices.map((service, serviceIndex) => {
                                    const isSelected = schedule.services.includes(service.text);
                                    return (
                                      <button
                                        key={serviceIndex}
                                        className={`dropdown-item w-full text-left p-4 mb-3 rounded-xl flex items-center justify-between transition-all ${isSelected
                                            ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                            : 'bg-white/50 border-l-4 border-indigo-500 hover:bg-indigo-50 hover:translate-x-1'
                                          }`}
                                        onClick={() => {
                                          if (!isSelected) {
                                            addServiceToSchedule(index, service.text);
                                          }
                                        }}
                                      >
                                        <div className="flex items-start" style={{ maxWidth: '80%' }}>
                                          <MessageSquare size={12} className="mt-1 mr-2 text-indigo-600 shrink-0" />
                                          <div className="truncate">
                                            <div className="font-semibold truncate" style={{ maxWidth: '250px' }}>
                                              {service.text}
                                            </div>
                                            <small className="text-gray-500 block font-normal">
                                              {new Date(service.createdAt).toLocaleDateString()}
                                            </small>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })
                                )}
                              </div>

                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                                  <button
                                    className="btn-outline-gray rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 0}
                                  >
                                    Previous
                                  </button>
                                  <small className="text-gray-600 font-medium">
                                    Page {currentPage + 1} of {totalPages}
                                  </small>
                                  <button
                                    className="btn-outline-gray rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages - 1}
                                  >
                                    Next
                                  </button>
                                </div>
                              )}

                              {/* Add New Service Button */}
                              <div className="border-t border-gray-100 p-4 bg-white rounded-b-2xl">
                                <button
                                  className="w-full p-4 text-indigo-600 font-semibold flex items-center justify-center rounded-xl transition-all hover:bg-indigo-50 hover:-translate-y-0.5 hover:shadow-md bg-indigo-50/50 border border-indigo-500/20"
                                  onClick={() => openAddServiceModal(index)}
                                >
                                  <PlusCircle size={16} className="mr-2" />
                                  Add New Service
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Add Service */}
              {showServiceManager !== index && schedule.services.length === 0 && (
                <div className="mb-6">
                  <button
                    className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-semibold border-2 border-indigo-500 text-indigo-600 transition-all hover:bg-indigo-50 hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => toggleServiceManager(index)}
                  >
                    <Plus size={16} />
                    <span>Add Services to this Schedule</span>
                  </button>
                </div>
              )}

              {/* Services Preview */}
              {schedule.services.length > 0 && showServiceManager !== index && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <ListChecks size={16} className="text-indigo-600 mr-2" />
                    <small className="text-gray-600 font-medium">Selected Services:</small>
                    <button
                      className="btn-link ml-2 p-0 font-normal text-gray-400 hover:text-gray-600"
                      onClick={() => toggleServiceManager(index)}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {schedule.services.map((service, serviceIndex) => (
                      <span
                        key={serviceIndex}
                        className="badge bg-indigo-100 text-indigo-700 rounded-full px-4 py-2 flex items-center gap-2 font-medium border border-indigo-500/20 max-w-[200px] truncate"
                      >
                        <CheckCircle size={12} />
                        <span className="truncate">{service}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled time display */}
              {schedule.date && schedule.time ? (
                <div className="p-6 rounded-2xl flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <Clock4 size={20} />
                    <span className="font-semibold">Scheduled</span>
                    {schedule.id && (
                      <span className="badge bg-white text-gray-800 ml-2 font-medium px-3 py-1">Saved</span>
                    )}
                  </div>
                  <div className="text-center relative z-10">
                    <div className="font-bold text-lg">
                      {getScheduledTimeString(schedule.date, schedule.time)}
                    </div>
                    {schedule.services.length > 0 && (
                      <div className="mt-3">
                        <small className="opacity-90 font-medium">
                          Services: {schedule.services.length} scheduled
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl text-center text-gray-500 flex items-center justify-center gap-3 transition-all bg-white/50 border-2 border-dashed border-indigo-500/30 cursor-pointer hover:bg-indigo-50/50 hover:scale-[1.02]">
                  <Clock size={16} />
                  <span className="font-medium">Select a date and time to schedule</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-2xl z-50">
          <button
            className="btn-glass rounded-full flex items-center justify-center gap-3 py-4 font-semibold text-indigo-600 transition-all hover:bg-indigo-50 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addSchedule}
            disabled={loading || deletingIndex !== null}
          >
            <Plus size={18} />
            <span>Add Another Schedule</span>
          </button>
          <button
            className={`btn rounded-full py-4 flex items-center justify-center gap-3 font-bold text-white text-lg transition-all ${loading || !schedules.some((s) => s.date && s.time && s.services.length > 0) || deletingIndex !== null
                ? 'opacity-50 cursor-not-allowed bg-gray-400'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:-translate-y-0.5 hover:shadow-xl'
              }`}
            onClick={handleSave}
            disabled={loading || !schedules.some((s) => s.date && s.time && s.services.length > 0) || deletingIndex !== null}
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

      {/* Add New Service Modal */}
      {showAddServiceModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1040] animate-backdrop-fade-in"
          />
          <div
            className="modal fixed inset-0 z-[1050] overflow-y-auto p-4"
          >
            <div className="modal-dialog min-h-screen flex items-center justify-center">
              <div
                className="modal-content w-full max-w-2xl rounded-3xl overflow-hidden border-0 shadow-3xl bg-gradient-to-b from-white to-gray-50/50 border border-white/40 animate-modal-slide-in"
              >
                {/* Modal Header */}
                <div
                  className="modal-header relative border-0 pb-6 pt-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                >
                  <div className="absolute inset-0 overflow-hidden opacity-5">
                    <div className="absolute -top-12 -right-8 w-36 h-36 rounded-full bg-radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%) blur"></div>
                    <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%) blur"></div>
                  </div>
                  <div className="relative z-10 flex items-center w-full">
                    <div className="flex items-center justify-center rounded-xl mr-4 bg-white/20 backdrop-blur-lg w-13 h-13 border border-white/30 shadow-lg">
                      <PlusCircle size={26} className="text-white" />
                    </div>
                    <div className="grow">
                      <h4 className="modal-title font-bold mb-1 text-xl tracking-wide">
                        New Service
                      </h4>
                      <p className="text-white/80 text-sm font-light">
                        Add a service that you can reuse across multiple schedules
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-close relative bg-transparent border-none text-2xl opacity-80 transition-all w-8 h-8 rounded-full flex items-center justify-center hover:opacity-100 hover:bg-white/10 hover:scale-110"
                      onClick={() => {
                        setShowAddServiceModal(false);
                        setCurrentScheduleIndex(null);
                        setNewServiceText("");
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                {/* Modal Body */}
                <div className="modal-body p-6 md:p-8">
                  <div className="mb-6">
                    <label className="form-label font-semibold mb-4 flex items-center text-indigo-600 text-base">
                      <MessageSquare size={18} className="mr-2" />
                      Service Description
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/5 text-base px-5 py-4 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-indigo-50/10 focus:scale-[1.02] resize-y min-h-[140px] font-sans leading-relaxed"
                        placeholder="Describe your service here..."
                        rows={4}
                        value={newServiceText}
                        onChange={(e) => setNewServiceText(e.target.value)}
                        maxLength={500}
                      />
                      <div className="text-right mt-3">
                        <small className="text-gray-600 font-medium">
                          {newServiceText.length}/500 characters
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Modal Footer */}
                <div className="modal-footer border-t-0 bg-gray-50/50 p-6 rounded-b-3xl">
                  <div className="flex justify-end w-full gap-4">
                    <button
                      type="button"
                      className="btn-outline-gray rounded-full px-6 py-3 flex items-center font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg border-2 min-w-[120px] text-sm"
                      onClick={() => {
                        setShowAddServiceModal(false);
                        setCurrentScheduleIndex(null);
                        setNewServiceText("");
                      }}
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary rounded-full px-6 py-3 flex items-center justify-center gap-2 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] text-sm bg-gradient-to-br from-emerald-500 to-emerald-600"
                      onClick={handleSaveNewService}
                      disabled={!newServiceText.trim() || savingNewService}
                    >
                      {savingNewService ? (
                        <>
                          <Loader size={16} className="animate-spin mr-2" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          <span>Save Service</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`/* Add these styles to your Tailwind CSS file */

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
}

@keyframes backdrop-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 8s ease-in-out infinite 1s reverse;
}

.animate-float-slow {
  animation: float 10s ease-in-out infinite 3s;
}

.animate-backdrop-fade-in {
  animation: backdrop-fade-in 0.3s ease-out;
}

.animate-modal-slide-in {
  animation: modal-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Button Styles */
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300;
}

.btn-primary {
  @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500;
}

.btn-outline-indigo {
  @apply border border-indigo-500 text-indigo-600 bg-transparent hover:bg-indigo-50 focus:ring-indigo-500;
}

.btn-outline-gray {
  @apply border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50 focus:ring-gray-500;
}

.btn-outline-danger {
  @apply border border-red-500 text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500;
}

.btn-light {
  @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500;
}

.btn-glass {
  @apply bg-white/90 backdrop-blur-lg border border-white/30 text-indigo-600 hover:bg-indigo-50/80;
}

.btn-link {
  @apply text-indigo-600 hover:text-indigo-800 bg-transparent focus:ring-0;
}

/* Badge Styles */
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
}

/* Form Controls */
.form-control {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

/* Modal Styles */
.modal-dialog {
  @apply relative;
}

.modal-content {
  @apply relative bg-white rounded-lg shadow-xl;
}

.modal-header {
  @apply flex items-start justify-between p-4 border-b rounded-t;
}

.modal-body {
  @apply relative p-4;
}

.modal-footer {
  @apply flex items-center p-4 border-t border-gray-200 rounded-b;
}

/* Dropdown Styles */
.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1;
}

.dropdown-item {
  @apply block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100;
}

/* Shadow Utilities */
.shadow-2xl {
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12);
}

.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.15);
}

.text-shadow-lg {
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Scrollbar Styles */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded-full;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  @apply bg-indigo-400 rounded-full hover:bg-indigo-500;
}

/* Responsive Utilities */
@media (max-width: 768px) {
  .modal-dialog {
    @apply m-2 max-w-[calc(100%-1rem)];
  }
  
  .dropdown-menu {
    @apply w-[95vw] left-[2.5vw] transform-none;
  }
}

/* Transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`}</style>
    </div>
  );
};

export default Schedule;