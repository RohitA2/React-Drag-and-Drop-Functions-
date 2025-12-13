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
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceContent, setNewServiceContent] = useState("");
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
      service.title.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      service.content.toLowerCase().includes(serviceSearchTerm.toLowerCase())
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
            title: s.title,
            content: s.content,
            createdAt: s.createdAt
          })) : [];
          setAllServices(mappedServices);
          if (mappedServices.length === 0) {
            toast.info("No services found");
          }
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

  const addServiceToSchedule = (scheduleIndex, serviceTitle) => {
    const updatedSchedules = schedules.map((schedule, i) => {
      if (i === scheduleIndex) {
        if (!schedule.services.includes(serviceTitle)) {
          return {
            ...schedule,
            services: [...schedule.services, serviceTitle]
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
    setNewServiceTitle("");
    setNewServiceContent("");
    setShowAddServiceModal(true);
    setDropdownOpen(null);
  };

  const handleSaveNewService = async () => {
    if (!newServiceTitle.trim() || !newServiceContent.trim()) return;
    setSavingNewService(true);
    try {
      const response = await axios.post(`${API_URL}/service/Create`, {
        title: newServiceTitle.trim(),
        content: newServiceContent.trim(),
        userId,
      });
      if (response.data.success) {
        const newServiceObj = response.data.comment;
        if (newServiceObj) {
          setAllServices(prev => [newServiceObj, ...prev]);
          if (currentScheduleIndex !== null) {
            addServiceToSchedule(currentScheduleIndex, newServiceObj.title);
          }
          setNewServiceTitle("");
          setNewServiceContent("");
          setShowAddServiceModal(false);
          setCurrentScheduleIndex(null);
          toast.success("Service saved successfully!");
        }
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
    <div className="relative max-w-10xl mx-auto p-4 md:p-8 w-full border border-gray-200 bg-linear-to-br from-blue-500 via-purple-600 to-pink-500 shadow-2xl overflow-visible backdrop-blur-sm">
      {/* Animated background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-radial-gradient from-white/10 to-transparent animate-float blur-sm"></div>
      <div className="absolute bottom-[-15%] left-[-5%] w-48 h-48 rounded-full bg-radial-gradient from-white/8 to-transparent animate-float-reverse blur-sm"></div>
      <div className="absolute top-1/2 left-10% w-36 h-36 rounded-full bg-radial-gradient from-white/5 to-transparent animate-float-slow blur-sm"></div>

      {/* Header */}
      <div className="flex items-center mb-8 relative">
        <div className="flex justify-center items-center rounded-2xl mr-4 shadow-lg w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 shadow-white/10">
          <CalendarClock size={28} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-2xl mb-1 drop-shadow-lg">Schedule Content</h3>
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
            <h5 className="text-white font-semibold text-lg">Daily Schedule Overview</h5>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
              <div
                key={date}
                className="rounded-2xl p-4 transition-all duration-300 hover:scale-105 min-w-[200px] bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
              >
                <div className="font-semibold text-white mb-2">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
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
              className={`rounded-3xl p-6 w-full max-w-4xl bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl transition-all duration-300 ${hoverIndex === index ? 'transform -translate-y-1 border-blue-300 shadow-[0_0_0_3px_rgba(102,126,234,0.2)]' : ''
                } ${isActive ? 'z-50' : 'z-10'}`}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-blue-500" />
                    <small className="font-medium">Select date</small>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-blue-500" />
                    <small className="font-medium">All timezones</small>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-2 disabled:opacity-50"
                    onClick={() => toggleServiceManager(index)}
                    disabled={deletingIndex === index}
                  >
                    <ListChecks size={14} />
                    <span>Manage Services ({schedule.services.length})</span>
                  </button>
                  {schedules.length > 1 && (
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:bg-gray-100"
                      onClick={() => removeSchedule(index)}
                      disabled={deletingIndex === index}
                    >
                      {deletingIndex === index ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Trash size={14} />
                      )}
                      <span>{deletingIndex === index ? "Deleting..." : "Remove"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Date & Time inputs */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                    value={schedule.date}
                    onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                    disabled={deletingIndex === index}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1 font-medium">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                    value={schedule.time}
                    onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
                    disabled={deletingIndex === index}
                  />
                </div>
              </div>

              {/* Service Management Section */}
              {showServiceManager === index && (
                <div className="mb-4 p-6 rounded-2xl border border-blue-200 bg-white/60 backdrop-blur-xl shadow-lg">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                    <div className="flex items-center">
                      <ListChecks size={18} className="text-blue-500 mr-2" />
                      <h6 className="font-semibold text-gray-800">Manage Services for this Schedule</h6>
                    </div>
                    <small className="text-gray-600 font-medium">
                      {schedule.services.length} service{schedule.services.length !== 1 ? 's' : ''} selected
                    </small>
                  </div>

                  {/* Selected Services List */}
                  {schedule.services.length > 0 ? (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {schedule.services.map((serviceTitle, serviceIndex) => {
                          const serviceObj = allServices.find(s => s && s.title === serviceTitle);
                          return (
                            <div
                              key={serviceIndex}
                              className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center min-w-0">
                                <CheckCircle size={14} className="text-green-500 mr-2 shrink-0" />
                                <div className="truncate min-w-0">
                                  <div className="font-medium truncate">{serviceTitle}</div>
                                  {serviceObj && serviceObj.content && (
                                    <small className="text-gray-500 truncate block">
                                      {serviceObj.content}
                                    </small>
                                  )}
                                </div>
                              </div>
                              <button
                                className="p-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50 ml-2 shrink-0"
                                onClick={() => removeServiceFromSchedule(index, serviceIndex)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 py-4 rounded-xl bg-gray-50/50 border border-dashed border-blue-300 text-center">
                      <AlertCircle size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">No services selected for this schedule</p>
                    </div>
                  )}

                  {/* Add Service Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">Add Services</label>
                    <div className="relative">
                      <button
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 hover:bg-white flex items-center justify-between text-left transition-all duration-300"
                        onClick={() => toggleDropdown(index)}
                        disabled={deletingIndex === index}
                      >
                        <div className="flex items-center">
                          <MessageSquare size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-500 font-medium">Select services to add...</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`text-gray-400 transition-transform duration-300 ${dropdownOpen === index ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {dropdownOpen === index && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white/98 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-50">
                          {loadingServices ? (
                            <div className="p-8 text-center">
                              <Loader size={20} className="animate-spin text-blue-500 mx-auto" />
                              <p className="text-gray-600 mt-2 font-medium">Loading Services...</p>
                            </div>
                          ) : allServices.length === 0 ? (
                            <div className="p-8 text-center">
                              <MessageSquare size={24} className="text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-600 mb-2 font-medium">No saved Services</p>
                              <button
                                className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                                onClick={() => openAddServiceModal(index)}
                              >
                                <PlusCircle size={14} className="inline mr-1" />
                                Add New Service
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Search Bar */}
                              <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <div className="relative">
                                  <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="text"
                                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
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
                                <small className="text-gray-500 font-medium block mt-1">
                                  {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                                </small>
                              </div>

                              {/* Services List */}
                              <div className="max-h-80 overflow-y-auto p-2">
                                {currentServices.length === 0 ? (
                                  <div className="p-8 text-center">
                                    <MessageSquare size={32} className="text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 font-medium">No services found</p>
                                    {serviceSearchTerm && (
                                      <button
                                        className="text-blue-500 hover:text-blue-600 font-medium text-sm mt-2"
                                        onClick={() => setServiceSearchTerm("")}
                                      >
                                        Clear search
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  currentServices.map((service, serviceIndex) => {
                                    if (!service || !service.title) return null;
                                    const isSelected = schedule.services.includes(service.title);
                                    return (
                                      <button
                                        key={serviceIndex}
                                        className={`w-full text-left p-3 rounded-xl mb-2 flex items-center justify-between transition-all duration-300 ${isSelected
                                          ? 'bg-green-50 border-l-4 border-green-500'
                                          : 'bg-white hover:bg-blue-50 border-l-4 border-blue-500'
                                          }`}
                                        onClick={() => {
                                          if (!isSelected) {
                                            addServiceToSchedule(index, service.title);
                                          }
                                        }}
                                      >
                                        <div className="flex items-start min-w-0">
                                          <MessageSquare size={12} className="text-blue-500 mt-1 mr-2 shrink-0" />
                                          <div className="truncate min-w-0">
                                            <div className="font-semibold truncate">{service.title}</div>
                                            <small className="text-gray-500 truncate block">{service.content}</small>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })
                                )}
                              </div>

                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                                  <button
                                    className="px-3 py-1 text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 0}
                                  >
                                    Previous
                                  </button>
                                  <small className="text-gray-600 font-medium">
                                    Page {currentPage + 1} of {totalPages}
                                  </small>
                                  <button
                                    className="px-3 py-1 text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages - 1}
                                  >
                                    Next
                                  </button>
                                </div>
                              )}

                              {/* Add New Service Button */}
                              <div className="p-4 border-t border-gray-100 bg-white">
                                <button
                                  className="w-full p-3 rounded-xl text-blue-600 font-semibold border border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition-all duration-300 flex items-center justify-center"
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
                <div className="mb-4">
                  <button
                    className="w-full px-6 py-4 rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                    onClick={() => toggleServiceManager(index)}
                  >
                    <Plus size={16} />
                    <span>Add Services to this Schedule</span>
                  </button>
                </div>
              )}

              {/* Services Preview */}
              {schedule.services.length > 0 && showServiceManager !== index && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <ListChecks size={16} className="text-blue-500 mr-2" />
                    <small className="text-gray-600 font-medium">Selected Services:</small>
                    <button
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      onClick={() => toggleServiceManager(index)}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {schedule.services.map((serviceTitle, serviceIndex) => {
                      const serviceObj = allServices.find(s => s && s.title === serviceTitle);
                      return (
                        <span
                          key={serviceIndex}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-blue-50/10 text-blue-600 border border-blue-200 font-medium max-w-xs overflow-hidden"
                        >
                          <CheckCircle size={12} />
                          <span className="truncate">
                            <span className="font-semibold truncate block">{serviceTitle}</span>
                            {serviceObj && serviceObj.content && (
                              <small className="text-blue-400 truncate block">{serviceObj.content}</small>
                            )}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scheduled time display */}
              {schedule.date && schedule.time ? (
                <div className="p-6 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg overflow-hidden">
                  {/* Top decorative line */}
                  <div className="h-0.5 w-full bg-linear-to-r from-transparent via-white/30 to-transparent mb-4"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock4 size={20} />
                    <span className="font-semibold">Scheduled</span>
                    {schedule.id && (
                      <span className="ml-2 px-2 py-0.5 bg-white text-gray-800 text-xs font-medium rounded-full">Saved</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{getScheduledTimeString(schedule.date, schedule.time)}</div>
                    {schedule.services.length > 0 && (
                      <div className="mt-2">
                        <small className="opacity-90 font-medium">
                          Services: {schedule.services.length} scheduled
                        </small>
                      </div>
                    )}
                  </div>
                  {/* Bottom decorative line */}
                  <div className="h-0.5 w-full bg-linear-to-r from-transparent via-white/30 to-transparent mt-4"></div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl text-center text-gray-500 bg-white/50 border-2 border-dashed border-blue-300 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2">
                  <Clock size={16} />
                  <span className="font-medium">Select a date and time to schedule</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-4xl">
          <button
            className="px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white/30 text-blue-600 hover:bg-blue-50 font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
            onClick={addSchedule}
            disabled={loading || deletingIndex !== null}
          >
            <Plus size={18} />
            <span>Add Another Schedule</span>
          </button>
          <button
            className={`px-6 py-4 rounded-full text-white font-bold flex items-center justify-center gap-2 text-lg transition-all duration-300 ${loading || !schedules.some((s) => s.date && s.time && s.services.length > 0) || deletingIndex !== null
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-linear-to-r from-green-500 to-emerald-600 hover:shadow-xl'
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
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <div className="relative w-full max-w-lg">
                <div className="bg-linear-to-b from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden border border-white/40 animate-modalIn">
                  {/* Modal Header */}
                  <div className="relative bg-linear-to-r from-blue-500 to-purple-600 text-white pb-6 pt-8 px-8">
                    <div className="absolute inset-0 overflow-hidden opacity-5">
                      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-radial-gradient from-white/40 to-transparent blur-sm"></div>
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-radial-gradient from-white/20 to-transparent blur-sm"></div>
                    </div>
                    <div className="relative z-10 flex items-center">
                      <div className="flex items-center justify-center rounded-2xl mr-4 w-13 h-13 bg-white/20 backdrop-blur-sm border border-white/30">
                        <PlusCircle size={26} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-1">New Service</h4>
                        <p className="text-white/75 text-sm font-light">
                          Add a service that you can reuse across multiple schedules
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all duration-300"
                        onClick={() => {
                          setShowAddServiceModal(false);
                          setCurrentScheduleIndex(null);
                          setNewServiceTitle("");
                          setNewServiceContent("");
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 md:p-8">
                    <div className="mb-6">
                      <label className=" font-semibold text-blue-600 mb-3 text-sm flex items-center">
                        <MessageSquare size={18} className="mr-2" />
                        Service Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-5 py-3 rounded-xl border-2 border-blue-300 bg-blue-50/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                        placeholder="Enter service title..."
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        maxLength={100}
                      />
                      <div className="text-right mt-2">
                        <small className="text-gray-500 font-medium">
                          {newServiceTitle.length}/100 characters
                        </small>
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="font-semibold text-blue-600 mb-3 text-sm flex items-center">
                        <MessageSquare size={18} className="mr-2" />
                        Service Content
                      </label>
                      <textarea
                        className="w-full px-5 py-3 rounded-xl border-2 border-blue-300 bg-blue-50/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 resize-y min-h-[140px]"
                        placeholder="Describe your service here..."
                        rows={4}
                        value={newServiceContent}
                        onChange={(e) => setNewServiceContent(e.target.value)}
                        maxLength={500}
                      />
                      <div className="text-right mt-2">
                        <small className="text-gray-500 font-medium">
                          {newServiceContent.length}/500 characters
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-8 py-6 bg-gray-50/50">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all duration-300 flex items-center"
                        onClick={() => {
                          setShowAddServiceModal(false);
                          setCurrentScheduleIndex(null);
                          setNewServiceTitle("");
                          setNewServiceContent("");
                        }}
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        onClick={handleSaveNewService}
                        disabled={!newServiceTitle.trim() || !newServiceContent.trim() || savingNewService}
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
          </div>
        </>
      )}
    </div>
  );
};

export default Schedule;
