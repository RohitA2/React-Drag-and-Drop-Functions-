import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Badge,
  Modal,
  OverlayTrigger,
  Tooltip,
  Form,
  Spinner,
  Alert,
  ListGroup,
} from "react-bootstrap";
import { Check, Copy, AlertCircle } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { selectedUserId } from "../../../store/authSlice";
import ProjectDetails from "../../ProjectDetails";
import {
  ArrowLeft, Plus, StickyNote, Calendar as CalendarIcon,
  Clock, X, Trash2, ChevronLeft, ChevronRight,
  Edit, MoreVertical, Eye, EyeOff
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function OverView({ schedules = [], onBackToProjects }) {
  const userId = useSelector(selectedUserId);
  const [value, setValue] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState({
    start: null,
    end: null,
    weekNumber: null,
  });
  const [proposalData, setProposalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState(null);
  const [notesError, setNotesError] = useState(null);
  const [viewMode, setViewMode] = useState("month");
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showNotesListModal, setShowNotesListModal] = useState(false);
  const [selectedDateForNote, setSelectedDateForNote] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteTime, setNoteTime] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  // Fetch proposal data from API
  useEffect(() => {
    const fetchProposalData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(
          `${API_URL}/schedules/user/${userId}`
        );

        if (data.success && Array.isArray(data.data)) {
          const proposals = data.data.filter(item => item.proposalEmail);
          setProposalData(proposals);
        } else {
          setProposalData([]);
        }
      } catch (error) {
        console.error("Error fetching proposal data:", error);
        setError(error.response?.data?.message || "Failed to fetch proposals");
        toast.error("Failed to load proposals");
        setProposalData([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProposalData();
      fetchNotes();
    }
  }, [userId]);

  // Fetch notes from API with useCallback
  const fetchNotes = useCallback(async () => {
    if (!userId) return;

    try {
      setLoadingNotes(true);
      setNotesError(null);

      const { data } = await axios.get(
        `${API_URL}/notes/all`,
        { params: { userId } }
      );

      if (data.success) {
        setNotes(data.data || []);
      } else {
        setNotes([]);
        setNotesError(data.message || "Failed to load notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
      setNotesError("Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  }, [userId]);

  // Week calculations with useMemo
  const getWeekRange = useCallback((date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const firstDayOfYear = new Date(startOfWeek.getFullYear(), 0, 1);
    const pastDaysOfYear = (startOfWeek - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );

    return { start: startOfWeek, end: endOfWeek, weekNumber };
  }, []);

  const generateDaysOfWeek = useCallback((startDate) => {
    const days = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDate);
      days.push(day);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, []);

  // Initialize week and days
  useEffect(() => {
    const weekRange = getWeekRange(value);
    setCurrentWeek(weekRange);
  }, [value, getWeekRange]);

  const daysOfWeek = useMemo(() => {
    return currentWeek.start ? generateDaysOfWeek(currentWeek.start) : [];
  }, [currentWeek.start, generateDaysOfWeek]);

  // Formatters with useMemo
  const formatDate = useCallback((date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[date.getDay()]} ${date.getDate()}`;
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return "No time";

    // Handle both string format (from proposals) and object format (from notes)
    if (typeof timeString === 'string') {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } else if (typeof timeString === 'object' && timeString !== null) {
      // Handle time object format {hours, minutes, period}
      const { hours, minutes, period } = timeString;
      if (!hours || !minutes || !period) return "No time";
      const hourNum = parseInt(hours);
      const displayHour = hourNum || 12; // Handle 00 as 12
      return `${displayHour}:${minutes} ${period}`;
    }

    return "No time";
  }, []);

  const formatNoteTime = useCallback((timeData) => {
    if (!timeData) return "";

    // Handle both string and object formats
    if (typeof timeData === 'string') {
      const [hours, minutes] = timeData.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } else if (typeof timeData === 'object' && timeData !== null) {
      // Handle time object format
      const { hours, minutes, period } = timeData;
      if (!hours || !minutes || !period) return "";
      const hourNum = parseInt(hours);
      const displayHour = hourNum || 12; // Handle 00 as 12
      return `${displayHour}:${minutes} ${period}`;
    }

    return "";
  }, []);

  const formatDateRange = useCallback((start, end) => {
    if (!start || !end) return "Loading...";
    const startMonth = start.toLocaleString("default", { month: "short" });
    const endMonth = end.toLocaleString("default", { month: "short" });

    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth}, ${start.getFullYear()} (Week ${currentWeek.weekNumber})`;
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}, ${start.getFullYear()} (Week ${currentWeek.weekNumber})`;
  }, [currentWeek.weekNumber]);

  // Get proposals for specific date
  const getProposalsForDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return proposalData.filter((proposal) => proposal.date === dateStr);
  }, [proposalData]);

  // Get notes for specific date
  const getNotesForDate = useCallback((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return notes
      .filter(note => note.date === dateStr)
      .sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;

        // Handle both string and object formats for time comparison
        const timeA = typeof a.time === 'object' ?
          `${a.time.hours}:${a.time.minutes} ${a.time.period}` : a.time;
        const timeB = typeof b.time === 'object' ?
          `${b.time.hours}:${b.time.minutes} ${b.time.period}` : b.time;

        return timeA.localeCompare(timeB);
      });
  }, [notes]);

  // Check if date has notes
  const dateHasNotes = useCallback((date) => {
    const notesForDate = getNotesForDate(date);
    return notesForDate.length > 0;
  }, [getNotesForDate]);

  // Get notes count for date
  const getNotesCountForDate = useCallback((date) => {
    const notesForDate = getNotesForDate(date);
    return notesForDate.length;
  }, [getNotesForDate]);

  // Get proposals for current view
  const getFilteredProposals = useCallback(() => {
    if (!proposalData.length) return [];

    if (viewMode === "day") {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      return proposalData.filter((proposal) => proposal.date === todayStr);
    } else if (viewMode === "week") {
      const { start, end } = currentWeek;
      return proposalData.filter((proposal) => {
        const proposalDate = new Date(proposal.date);
        return proposalDate >= start && proposalDate <= end;
      });
    } else {
      const month = value.getMonth();
      const year = value.getFullYear();
      return proposalData.filter((proposal) => {
        const proposalDate = new Date(proposal.date);
        return (
          proposalDate.getMonth() === month && proposalDate.getFullYear() === year
        );
      });
    }
  }, [proposalData, viewMode, currentWeek, value]);

  // Get filtered notes for current view
  const getFilteredNotes = useCallback(() => {
    if (!notes.length) return [];

    if (viewMode === "day") {
      const today = new Date();
      return getNotesForDate(today);
    } else if (viewMode === "week") {
      const { start, end } = currentWeek;
      return notes.filter((note) => {
        const noteDate = new Date(note.date);
        return noteDate >= start && noteDate <= end;
      }).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;

        // Handle both string and object formats
        const timeA = typeof a.time === 'object' ?
          `${a.time.hours}:${a.time.minutes} ${a.time.period}` : a.time;
        const timeB = typeof b.time === 'object' ?
          `${b.time.hours}:${b.time.minutes} ${b.time.period}` : b.time;

        return timeA.localeCompare(timeB);
      });
    } else {
      const month = value.getMonth();
      const year = value.getFullYear();
      return notes.filter((note) => {
        const noteDate = new Date(note.date);
        return (
          noteDate.getMonth() === month && noteDate.getFullYear() === year
        );
      }).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    }
  }, [notes, viewMode, currentWeek, value, getNotesForDate]);

  const filteredProposals = useMemo(() => getFilteredProposals(), [getFilteredProposals]);
  const filteredNotes = useMemo(() => getFilteredNotes(), [getFilteredNotes]);

  // Function to convert proposal to project format
  const convertProposalToProject = useCallback((proposal) => {
    if (!proposal.proposalEmail) return null;

    return {
      id: proposal.proposalEmail.id,
      proposalName: proposal.proposalEmail.proposalName || "Proposal",
      expirationDate: proposal.proposalEmail.expirationDate,
      description: proposal.proposalEmail.description,
      recipients: proposal.proposalEmail.recipients || [],
      signatures: proposal.proposalEmail.signatures || [],
      parentId: proposal.proposalEmail.parentId,
      schedules: proposal.proposalEmail.schedules || [],
      ...proposal.proposalEmail,
    };
  }, []);

  // Handle proposal click
  const handleProposalClick = useCallback((proposals, cellDate) => {
    if (!Array.isArray(proposals)) {
      proposals = [proposals];
    }

    const projectProposals = proposals.filter((proposal) => proposal.proposalEmail);
    if (projectProposals.length > 0) {
      const project = convertProposalToProject(projectProposals[0]);
      setSelectedProject(project);
    } else {
      setSelectedProposals(
        proposals.map((proposal) => ({ ...proposal, fullDate: cellDate }))
      );
      setShowProposalModal(true);
    }
  }, [convertProposalToProject]);

  // Handle date click for viewing/adding notes
  const handleDateClick = useCallback((date) => {
    setSelectedDateForNote(date);
    const notesForDate = getNotesForDate(date);

    if (notesForDate.length > 0) {
      setShowNotesListModal(true);
    } else {
      // No notes for this date, open new note modal
      setEditingNoteId(null);
      setNoteTitle("");
      setNoteContent("");
      setNoteTime(null);
      setShowNoteModal(true);
    }
  }, [getNotesForDate]);

  // Handle add new note for date
  const handleAddNewNoteForDate = useCallback((date) => {
    setSelectedDateForNote(date);
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteTime(null);
    setShowNoteModal(true);
  }, []);

  // Handle edit note
  const handleEditNote = useCallback((note) => {
    setSelectedDateForNote(new Date(note.date));
    setEditingNoteId(note.id);
    setNoteTitle(note.title || "");
    setNoteContent(note.content || "");
    setNoteTime(note.time || null);
    setShowNoteModal(true);
    setShowNotesListModal(false);
  }, []);

  // Handle delete note
  const handleDeleteNote = useCallback(async (noteId) => {
    if (!noteId) return;

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await axios.delete(`${API_URL}/notes/${noteId}`);
      toast.success("Note deleted successfully");

      await fetchNotes();
      if (showNotesListModal) {
        const notesForDate = getNotesForDate(selectedDateForNote);
        if (notesForDate.length === 0) {
          setShowNotesListModal(false);
        }
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete note"
      );
    }
  }, [selectedDateForNote, fetchNotes, showNotesListModal, getNotesForDate]);

  // Handle save note (create or update)
  const handleSaveNote = useCallback(async () => {
    if (!selectedDateForNote || !noteContent.trim()) {
      toast.warning("Note content is required");
      return;
    }

    if (!noteTitle.trim()) {
      toast.warning("Note title is required");
      return;
    }

    setIsSavingNote(true);

    try {
      const dateStr = format(selectedDateForNote, "yyyy-MM-dd");

      const payload = {
        userId,
        date: dateStr,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        time: noteTime || null,
      };

      if (editingNoteId) {
        await axios.put(`${API_URL}/notes/${editingNoteId}`, payload);
        toast.success("Note updated successfully");
      } else {
        await axios.post(`${API_URL}/notes/new`, payload);
        toast.success("Note added successfully");
      }

      await fetchNotes();
      setShowNoteModal(false);
      resetNoteForm();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(
        error.response?.data?.message || "Failed to save note"
      );
    } finally {
      setIsSavingNote(false);
    }
  }, [selectedDateForNote, noteContent, noteTitle, noteTime, editingNoteId, userId, fetchNotes]);

  // Reset note form
  const resetNoteForm = useCallback(() => {
    setSelectedDateForNote(null);
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteTime(null);
  }, []);

  // Generate month grid cells
  const generateMonthGrid = useMemo(() => {
    const firstDay = new Date(value.getFullYear(), value.getMonth(), 1);
    const lastDay = new Date(value.getFullYear(), value.getMonth() + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const grid = [];
    for (let i = 0; i < startDay; i++) {
      grid.push({ date: null, proposals: [], notesCount: 0 });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(value.getFullYear(), value.getMonth(), day);
      const proposals = getProposalsForDate(currentDate);
      const notesCount = getNotesCountForDate(currentDate);
      grid.push({ date: currentDate, proposals, notesCount });
    }
    while (grid.length < 42) {
      grid.push({ date: null, proposals: [], notesCount: 0 });
    }
    return grid;
  }, [value, getProposalsForDate, getNotesCountForDate]);

  // Get proposal display text
  const getProposalDisplayText = useCallback((proposal) => {
    return proposal.proposalEmail?.proposalName || "Proposal";
  }, []);

  // Note Modal Content Component
  const NoteModalContent = useMemo(() => {
    if (!selectedDateForNote) return null;

    const existingNote = editingNoteId ? notes.find(note => note.id === editingNoteId) : null;
    const isEditing = !!existingNote;

    return (
     <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl shadow-amber-200/10 overflow-hidden w-full max-w-2xl mx-auto border border-white/50">
  {/* Header with gradient background */}
  <Modal.Header className="border-0 px-8 pt-8 pb-6 bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50/30 relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/5 rounded-full -translate-y-32 translate-x-32" />
    <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-400/5 rounded-full translate-y-24 -translate-x-24" />
    
    <div className="relative z-10 flex items-start justify-between w-full">
      <div className="flex items-center gap-4">
        {/* Animated icon container */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-orange-500/20 blur-xl rounded-3xl group-hover:animate-pulse" />
          <div className="relative p-3 bg-gradient-to-br from-white to-amber-50/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
              <StickyNote className="text-white" size={28} />
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            {isEditing ? (
              <Edit size={12} className="text-white" />
            ) : (
              <Plus size={12} className="text-white" />
            )}
          </div>
        </div>
        
        {/* Title section */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Modal.Title className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {isEditing ? "Edit Note" : "Create New Note"}
            </Modal.Title>
            <div className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/60 rounded-lg">
              <span className="text-xs font-semibold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                {isEditing ? "Editing" : "Draft"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full">
              <CalendarIcon size={16} className="text-amber-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedDateForNote.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            {isEditing && (
              <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <Clock size={12} />
                <span>Editing existing note</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Close button */}
      <button
        className="group p-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
        onClick={() => {
          setShowNoteModal(false);
          resetNoteForm();
        }}
      >
        <X size={22} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
      </button>
    </div>
  </Modal.Header>

  {/* Body */}
  <Modal.Body className="px-8 py-6 max-h-[65vh] overflow-y-auto">
    <Form>
      {/* Note Title Field */}
      <div className="mb-6 group">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            Note Title
          </label>
          <span className="text-xs text-amber-600 font-medium px-2 py-1 bg-amber-50/50 rounded">
            Required
          </span>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/10 to-orange-400/10 blur rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title..."
            className="relative w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 rounded-xl text-base font-medium transition-all duration-300 focus:border-amber-400 focus:bg-white focus:shadow-lg focus:shadow-amber-200/30 hover:border-gray-300"
            required
            autoFocus
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`w-2 h-2 rounded-full ${noteTitle.trim() ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-1">Give your note a meaningful title for easy reference</p>
      </div>

      {/* Time Selection */}
      <div className="mb-6 group">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            Time (Optional)
          </label>
          {noteTime && (
            <button
              type="button"
              onClick={() => setNoteTime(null)}
              className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline transition-colors"
            >
              Clear time
            </button>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/5 to-orange-400/5 blur rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          
          <div className="relative flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 rounded-xl transition-all duration-300 hover:border-gray-300 focus-within:border-amber-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-amber-200/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                <Clock size={20} className="text-amber-600" />
              </div>
              
              <div className="flex items-center gap-2">
                {/* Hour Select */}
                <div className="relative">
                  <select
                    value={noteTime?.hours || ""}
                    onChange={(e) => {
                      const hours = e.target.value;
                      if (hours) {
                        setNoteTime(prev => ({
                          ...prev,
                          hours,
                          minutes: prev?.minutes || "00"
                        }));
                      } else {
                        setNoteTime(null);
                      }
                    }}
                    className="appearance-none w-20 px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                  >
                    <option value="">Hour</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = i + 1;
                      return (
                        <option key={hour} value={hour.toString().padStart(2, '0')}>
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <span className="text-gray-400 font-medium">:</span>
                
                {/* Minute Select */}
                <div className="relative">
                  <select
                    value={noteTime?.minutes || ""}
                    onChange={(e) => {
                      const minutes = e.target.value;
                      if (minutes && noteTime?.hours) {
                        setNoteTime(prev => ({ ...prev, minutes }));
                      }
                    }}
                    className="appearance-none w-20 px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!noteTime?.hours}
                  >
                    <option value="">Min</option>
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* AM/PM Select */}
                <div className="relative">
                  <select
                    value={noteTime?.period || ""}
                    onChange={(e) => {
                      const period = e.target.value;
                      if (period && noteTime?.hours) {
                        setNoteTime(prev => ({ ...prev, period }));
                      }
                    }}
                    className="appearance-none w-20 px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!noteTime?.hours}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {noteTime?.hours && (
              <div className="ml-auto">
                <div className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <span className="text-sm font-semibold text-amber-700">
                    {parseInt(noteTime.hours)}:{noteTime.minutes} {noteTime.period}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-1">Add a time for better organization (optional)</p>
      </div>

      {/* Note Content Field */}
      <div className="mb-6 group">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            Note Content
          </label>
          <span className="text-xs text-amber-600 font-medium px-2 py-1 bg-amber-50/50 rounded">
            Required
          </span>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/10 to-orange-400/10 blur rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note here. Be as detailed as needed..."
              rows={6}
              className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 rounded-xl text-base font-medium transition-all duration-300 focus:border-amber-400 focus:bg-white focus:shadow-lg focus:shadow-amber-200/30 hover:border-gray-300 resize-none min-h-[180px]"
              required
            />
            
            {/* Character counter */}
            <div className="absolute bottom-3 right-3">
              <div className={`text-xs font-medium px-2 py-1 rounded ${
                noteContent.length > 1900 ? 'bg-red-50 text-red-600' :
                noteContent.length > 1500 ? 'bg-amber-50 text-amber-600' :
                'bg-gray-50 text-gray-500'
              }`}>
                {noteContent.length}/2000
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 ml-1">Maximum 2000 characters</p>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = now.toLocaleDateString();
              setNoteContent(prev => `[${dateStr} ${timeStr}]\n${prev}`);
            }}
            className="text-xs font-medium bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            <Clock size={12} />
            Add timestamp
          </button>
        </div>
      </div>

      {/* Editing Information */}
      {isEditing && (
        <div className="mb-6 p-4 bg-gradient-to-br from-gray-50/50 to-white/30 border border-gray-200/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Note Information</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={12} />
                  <span>Created: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Edit size={12} />
                  <span>Last edited: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                // Duplicate note functionality
                const duplicateNote = {
                  title: `${noteTitle} (Copy)`,
                  content: noteContent,
                  time: noteTime
                };
                // Handle duplicate logic here
              }}
              className="text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-1"
            >
              <Copy size={12} />
              Duplicate
            </button>
          </div>
        </div>
      )}
    </Form>
  </Modal.Body>

  {/* Footer */}
  <Modal.Footer className="border-0 px-8 py-6 bg-gradient-to-t from-gray-50/90 via-white/50 to-transparent rounded-b-3xl">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      {/* Left side - Delete button for editing */}
      {isEditing && (
        <div>
          <button
            onClick={() => handleDeleteNote(editingNoteId)}
            disabled={isSavingNote}
            className="group flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Delete Note</span>
          </button>
        </div>
      )}
      
      {/* Right side - Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={() => {
            setShowNoteModal(false);
            resetNoteForm();
          }}
          disabled={isSavingNote}
          className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-white hover:border-gray-400 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <button
          onClick={handleSaveNote}
          disabled={isSavingNote || !noteContent.trim() || !noteTitle.trim()}
          className="group relative px-7 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="relative flex items-center justify-center gap-2">
            {isSavingNote ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                {isEditing ? (
                  <>
                    <Check size={20} className="group-hover:scale-110 transition-transform" />
                    <span>Update Note</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Save Note</span>
                  </>
                )}
              </>
            )}
          </div>
        </button>
      </div>
    </div>
    
    {/* Validation message */}
    {(!noteContent.trim() || !noteTitle.trim()) && (
      <div className="mt-4 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50/80 to-orange-50/60 border border-amber-200/60 rounded-xl">
          <AlertCircle size={16} className="text-amber-600" />
          <span className="text-sm text-amber-700 font-medium">
            Please fill in all required fields
          </span>
        </div>
      </div>
    )}
  </Modal.Footer>
</div>
    );
  }, [
    selectedDateForNote,
    noteTitle,
    noteContent,
    noteTime,
    isSavingNote,
    editingNoteId,
    notes,
    handleDeleteNote,
    handleSaveNote,
    resetNoteForm,
    setShowNoteModal,
    setNoteTitle,
    setNoteContent,
    setNoteTime
  ]);

  // Notes List Modal Content
  const NotesListModalContent = useMemo(() => {
    if (!selectedDateForNote) return null;

    const notesForDate = getNotesForDate(selectedDateForNote);
    const formattedDate = selectedDateForNote.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
     <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl shadow-blue-200/20 overflow-hidden w-full max-w-4xl mx-auto border border-white/40">
  {/* Header with gradient background */}
  <Modal.Header className="border-0 px-8 pt-8 pb-6 bg-gradient-to-br from-blue-50/60 via-white/50 to-indigo-50/40 relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full -translate-y-32 translate-x-32" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/5 rounded-full translate-y-24 -translate-x-24" />
    
    <div className="relative z-10 flex items-start justify-between w-full">
      <div className="flex items-center gap-4">
        {/* Animated icon container */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 blur-xl rounded-3xl animate-pulse" />
          <div className="relative p-4 bg-gradient-to-br from-white to-blue-50/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <StickyNote className="text-white" size={28} />
            </div>
          </div>
          {/* Notification badge */}
          {notesForDate.length > 0 && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-xs font-bold text-white">{notesForDate.length}</span>
            </div>
          )}
        </div>
        
        {/* Title section */}
        <div>
          <Modal.Title className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Notes for {formattedDate}
          </Modal.Title>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full">
              <div className={`w-2 h-2 rounded-full ${notesForDate.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">
                {notesForDate.length} note{notesForDate.length !== 1 ? 's' : ''}
              </span>
            </div>
            {notesForDate.length > 0 && (
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Clock size={14} />
                <span>Sorted by time</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Close button */}
      <button
        className="group p-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
        onClick={() => {
          setShowNotesListModal(false);
          setSelectedDateForNote(null);
          setExpandedNoteId(null);
        }}
      >
        <X size={22} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
      </button>
    </div>
  </Modal.Header>

  {/* Body */}
  <Modal.Body className="px-8 py-6 max-h-[70vh] overflow-y-auto">
    {notesForDate.length === 0 ? (
      // Empty state
      <div className="text-center py-12">
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-xl" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-white to-blue-50/80 border border-blue-100 rounded-full flex items-center justify-center shadow-lg">
            <StickyNote className="text-blue-400/60" size={36} />
          </div>
        </div>
        <h6 className="text-xl font-semibold text-gray-800 mb-2">
          No notes for {formattedDate}
        </h6>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          This date doesn't have any notes yet. Start organizing your thoughts by adding your first note.
        </p>
        <button
          onClick={() => handleAddNewNoteForDate(selectedDateForNote)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group"
        >
          <div className="relative">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <div className="absolute -inset-2 bg-blue-400/30 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          Create First Note
        </button>
      </div>
    ) : (
      // Notes list
      <div className="space-y-4">
        {notesForDate.map((note, index) => (
          <div
            key={note.id}
            className={`group relative transition-all duration-300 ${
              expandedNoteId === note.id ? 'transform scale-[1.02]' : ''
            }`}
          >
            {/* Note card */}
            <div className={`
              relative overflow-hidden rounded-2xl border transition-all duration-300
              ${expandedNoteId === note.id 
                ? 'bg-gradient-to-br from-white to-blue-50/50 border-blue-300/80 shadow-lg' 
                : 'bg-white border-gray-200/80 hover:border-blue-200 hover:shadow-md'
              }
            `}>
              {/* Note header */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  {/* Left side: Title and metadata */}
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                        <h6 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {note.title}
                        </h6>
                      </div>
                      {note.time && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full">
                          <Clock size={12} className="text-blue-500" />
                          <span className="text-xs font-semibold text-blue-600">
                            {formatNoteTime(note.time)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={14} />
                        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      {note.updatedAt !== note.createdAt && (
                        <>
                          <div className="w-1 h-1 bg-gray-300 rounded-full" />
                          <div className="flex items-center gap-1.5">
                            <Edit size={14} />
                            <span>Edited: {new Date(note.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side: Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2 bg-white/80 border border-gray-200/60 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 group/btn"
                      title="Edit note"
                    >
                      <Edit size={18} className="text-gray-500 group-hover/btn:text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 bg-white/80 border border-gray-200/60 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 group/btn"
                      title="Delete note"
                    >
                      <Trash2 size={18} className="text-gray-500 group-hover/btn:text-red-600" />
                    </button>
                    <button
                      onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                      className="p-2 bg-white/80 border border-gray-200/60 rounded-lg hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 group/btn"
                      title={expandedNoteId === note.id ? "Collapse" : "Expand"}
                    >
                      {expandedNoteId === note.id ? (
                        <EyeOff size={18} className="text-gray-500 group-hover/btn:text-gray-700" />
                      ) : (
                        <Eye size={18} className="text-gray-500 group-hover/btn:text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Note content */}
                {expandedNoteId === note.id ? (
                  <div className="mt-4 p-4 bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-xl border border-gray-200/50">
                    <div className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full" />
                      <p className="text-gray-700 whitespace-pre-wrap pl-3 font-medium leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 relative">
                    <p className="text-gray-600 line-clamp-2 leading-relaxed">
                      {note.content.length > 120 
                        ? `${note.content.substring(0, 120)}...` 
                        : note.content
                      }
                    </p>
                    {note.content.length > 120 && (
                      <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent w-16 h-6" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Card bottom border gradient */}
              <div className="h-1 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0" />
            </div>
            
            {/* Interaction hint */}
            {!expandedNoteId && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="px-3 py-1 bg-gray-800 text-white text-xs rounded-lg">
                  Click to expand
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </Modal.Body>

  {/* Footer */}
  <Modal.Footer className="border-0 px-8 py-6 bg-gradient-to-t from-gray-50/90 via-white/50 to-transparent rounded-b-3xl">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span>Click on notes to expand/collapse • Hover for quick actions</span>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => setShowNotesListModal(false)}
          className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-white hover:border-gray-400 hover:shadow-md transition-all duration-300"
        >
          Close
        </button>
        <button
          onClick={() => handleAddNewNoteForDate(selectedDateForNote)}
          className="group relative px-7 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          {/* Background shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="relative flex items-center justify-center gap-2">
            <div className="relative">
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <div className="absolute -inset-2 bg-blue-400/30 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span>Add New Note</span>
          </div>
        </button>
      </div>
    </div>
  </Modal.Footer>
</div>
    );
  }, [
    selectedDateForNote,
    getNotesForDate,
    formatNoteTime,
    expandedNoteId,
    handleEditNote,
    handleDeleteNote,
    handleAddNewNoteForDate,
    setShowNotesListModal
  ]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Project Details Sidebar */}
      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Main content */}
      <div className={`transition-all duration-500 ease-in-out ${selectedProject ? "mr-[950px] overflow-hidden" : ""}`}>
        <Container fluid className="p-0 max-w-10xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            {onBackToProjects && (
              <button
                onClick={onBackToProjects}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 font-medium mb-4"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Projects
              </button>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                <div className="pl-3">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Proposal Calendar
                    </h1>
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full">
                      <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {proposalData.length + notes.length} Total
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg font-medium max-w-2xl">
                    Manage and view all your proposals and notes in one unified workspace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center p-1.5 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg shadow-blue-100/30">
                  {["day", "week", "month"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`relative px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${viewMode === mode
                          ? 'text-blue-700 bg-white/80 shadow-lg shadow-blue-200/50'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
                        }`}
                    >
                      {viewMode === mode && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/50 rounded-xl" />
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur opacity-0 group-hover:opacity-100 rounded-xl" />
                        </>
                      )}
                      <span className="relative z-10">
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </span>
                      {viewMode === mode && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-lg flex items-center justify-center border border-emerald-100">
                        <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full" />
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">{proposalData.length}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Proposals</div>
                      <div className="text-xs text-gray-500">Active contracts</div>
                    </div>
                  </div>

                  <div className="w-px h-6 bg-gray-200" />

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-lg flex items-center justify-center border border-blue-100">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full" />
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">{notes.length}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Notes</div>
                      <div className="text-xs text-gray-500">Personal records</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Row className="g-4">
            {/* Calendar Sidebar */}
            <Col xs={12} lg={4} xl={3}>
              <Card className="shadow-lg border-0 rounded-2xl overflow-hidden h-full backdrop-blur-sm bg-white/80">
                <Card.Body className="p-2">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <CalendarIcon className="text-blue-600" size={24} />
                    </div>
                    <h5 className="font-bold text-gray-800 text-lg">Calendar</h5>
                  </div>

                  <div className="mb-5">
                    <Calendar
                      onChange={setValue}
                      value={value}
                      className="shadow-sm rounded-xl border-0 w-full bg-white/50"
                      tileContent={({ date, view }) => {
                        if (view === 'month') {
                          const notesCount = getNotesCountForDate(date);
                          if (notesCount > 0) {
                            return (
                              <div className="absolute top-1 right-1">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow"></div>
                                  {notesCount > 1 && (
                                    <span className="text-xs font-bold text-blue-600 ml-0.5">
                                      {notesCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        }
                        return null;
                      }}
                      onClickDay={handleDateClick}
                      tileClassName={({ date, view }) =>
                        view === 'month' ? 'hover:bg-blue-50 transition-colors duration-200' : ''
                      }
                      prevLabel={<ChevronLeft size={20} />}
                      nextLabel={<ChevronRight size={20} />}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <h6 className="font-semibold text-gray-800 mb-3">Summary</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Proposals</span>
                          <Badge bg="success" className="px-3 py-1 rounded-full">
                            {proposalData.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Current View</span>
                          <Badge bg="primary" className="px-3 py-1 rounded-full">
                            {filteredProposals.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Date Notes</span>
                          <Badge bg="info" className="px-3 py-1 rounded-full">
                            {notes.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Notes in View</span>
                          <Badge bg="warning" className="px-3 py-1 rounded-full">
                            {filteredNotes.length}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <h6 className="font-medium text-gray-700 mb-2 text-sm">Legend</h6>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Proposal</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow"></div>
                          <span className="text-sm text-gray-600">Has Note(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Note Button */}
                    <button
                      className="group relative w-full px-6 py-4 bg-gradient-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-200/80 rounded-2xl text-blue-700 hover:text-blue-800 hover:border-blue-300/90 hover:shadow-xl transition-all duration-500 ease-out overflow-hidden"
                      onClick={() => handleAddNewNoteForDate(new Date())}
                    >
                      {/* Background shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                      {/* Decorative elements */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Content */}
                      <div className="relative flex items-center justify-center gap-3">
                        {/* Animated plus icon */}
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl transform group-hover:rotate-90 transition-transform duration-500 ease-out shadow-lg" />
                          <Plus
                            size={24}
                            className="absolute inset-0 m-auto text-white transform group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Pulsing effect */}
                          <div className="absolute inset-0 border-2 border-blue-400/30 rounded-xl animate-ping opacity-0 group-hover:opacity-100" />
                        </div>

                        {/* Text content */}
                        <div className="text-left">
                          <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                            Add Note for Today
                          </div>
                          <div className="text-xs text-blue-500/80 font-medium mt-1 flex items-center gap-1">
                            <Clock size={12} />
                            Click to add a new note
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300">
                          <svg
                            className="w-5 h-5 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100/30 to-indigo-100/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Main Content */}
            <Col xs={12} lg={8} xl={9}>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xl font-bold text-gray-800">
                    {viewMode === "week"
                      ? formatDateRange(currentWeek.start, currentWeek.end)
                      : value.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                  </h4>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 ">
                      Click on any date to view/add notes
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <Alert variant="danger" className="rounded-xl">
                  Error loading data: {error}
                </Alert>
              ) : loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Month View */}
                  {viewMode === "month" && (
                    <>
                      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden mb-4">
                        <Card.Body className="p-0">
                          <div className="grid grid-cols-7 gap-px bg-gray-100">
                            {[
                              "Sun",
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                            ].map((day) => (
                              <div
                                key={day}
                                className="text-center font-semibold p-3.5 bg-white border-b border-gray-200 text-gray-700"
                              >
                                {day}
                              </div>
                            ))}

                            {generateMonthGrid.map((cell, index) => (
                              <div
                                key={index}
                                className={`min-h-[160px] p-3 border border-gray-100 relative transition-all duration-200 group ${cell.date
                                  ? cell.date.getMonth() === value.getMonth()
                                    ? "bg-white hover:bg-blue-50/30"
                                    : "bg-gray-50/50 text-gray-400"
                                  : "bg-gray-100/50"
                                  } ${cell.notesCount > 0 ? 'bg-gradient-to-br from-blue-50/30 to-indigo-50/20 border-blue-200/30' : ''}`}
                                onClick={() => cell.date && handleDateClick(cell.date)}
                              >
                                {cell.date && (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className={`font-bold text-lg ${cell.date.getMonth() === value.getMonth()
                                        ? 'text-gray-800'
                                        : 'text-gray-400'
                                        }`}>
                                        {cell.date.getDate()}
                                      </div>

                                      <div className="flex items-center gap-1">
                                        {cell.notesCount > 0 && (
                                          <div className="p-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200">
                                            <Badge bg="info" className="rounded-full px-2 py-1 text-xs">
                                              {cell.notesCount} note{cell.notesCount !== 1 ? 's' : ''}
                                            </Badge>
                                          </div>
                                        )}

                                        {cell.date.getMonth() === value.getMonth() && (
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
                                            <Plus size={14} className="text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Proposals */}
                                    <div className="space-y-2 max-h-20 overflow-y-auto pr-1 mb-2">
                                      {cell.proposals
                                        .slice(0, 2)
                                        .map((proposal, proposalIndex) => (
                                          <OverlayTrigger
                                            key={proposalIndex}
                                            placement="top"
                                            overlay={
                                              <Tooltip
                                                id={`tooltip-${index}-${proposalIndex}`}
                                                className="rounded-lg shadow-lg"
                                              >
                                                <div className="text-start p-2">
                                                  <div className="font-medium">{formatTime(proposal.time)}</div>
                                                  <div>{getProposalDisplayText(proposal)}</div>
                                                </div>
                                              </Tooltip>
                                            }
                                          >
                                            <div
                                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-2 cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleProposalClick(proposal, cell.date);
                                              }}
                                            >
                                              <div className="text-xs font-semibold opacity-90 mb-1">
                                                {formatTime(proposal.time)}
                                              </div>
                                              <div className="text-xs font-medium truncate">
                                                {getProposalDisplayText(proposal)}
                                              </div>
                                            </div>
                                          </OverlayTrigger>
                                        ))}
                                    </div>

                                    {/* Notes Preview */}
                                    {cell.notesCount > 0 && (
                                      <div className="space-y-1 max-h-16 overflow-y-auto pr-1">
                                        {getNotesForDate(cell.date)
                                          .slice(0, 2)
                                          .map((note, noteIndex) => (
                                            <div
                                              key={note.id}
                                              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-1.5 cursor-pointer hover:shadow-sm transition-all duration-200"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditNote(note);
                                              }}
                                            >
                                              <div className="flex items-center gap-1">
                                                <StickyNote size={10} className="text-blue-500" />
                                                <span className="text-xs font-medium text-blue-700 truncate">
                                                  {note.title}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        {cell.notesCount > 2 && (
                                          <div className="text-center text-xs text-blue-500 cursor-pointer hover:underline transition-colors">
                                            +{cell.notesCount - 2} more notes
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
                    </>
                  )}

                  {/* Week View */}
                  {viewMode === "week" && (
                    <>
                      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden mb-4">
                        <Card.Body className="p-0">
                          <div className="flex w-full">
                            {/* Time Column */}
                            <div className="w-16 shrink-0">
                              <div className="h-14 border-b border-gray-200 bg-gray-50"></div>
                              {Array.from({ length: 14 }, (_, i) => (
                                <div key={i} className="h-16 p-2 border-b border-gray-100 text-xs flex items-center justify-center text-gray-500">
                                  {8 + i}:00
                                </div>
                              ))}
                            </div>

                            {/* Days Columns */}
                            {daysOfWeek.map((day, dayIndex) => {
                              const dayProposals = getProposalsForDate(day);
                              const dayNotes = getNotesForDate(day);
                              const hasNotes = dayNotes.length > 0;
                              return (
                                <div key={dayIndex} className="flex-1 border-l border-gray-100">
                                  {/* Day Header */}
                                  <div
                                    className={`p-3 text-center font-bold border-b border-gray-200 transition-all duration-200 cursor-pointer ${hasNotes
                                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50'
                                      : 'bg-gray-50'
                                      } hover:bg-gray-100`}
                                    onClick={() => handleDateClick(day)}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="text-gray-700">{formatDate(day)}</span>
                                      {hasNotes && (
                                        <Badge bg="info" className="rounded-full px-2 py-1">
                                          {dayNotes.length}
                                        </Badge>
                                      )}
                                      {dayProposals.length > 0 && (
                                        <Badge bg="success" className="rounded-full px-2 py-1">
                                          {dayProposals.length}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Hour Cells */}
                                  {Array.from({ length: 14 }, (_, hourIndex) => {
                                    const hour = 8 + hourIndex;
                                    const hourStr = hour.toString().padStart(2, '0');

                                    const hourProposals = dayProposals.filter(
                                      (proposal) =>
                                        proposal.time &&
                                        proposal.time.startsWith(`${hourStr}:`)
                                    );

                                    const hourNotes = dayNotes.filter((note) => {
                                      if (!note.time) return false;

                                      // Handle both string and object formats
                                      if (typeof note.time === 'string') {
                                        return note.time.startsWith(`${hourStr}:`);
                                      } else if (typeof note.time === 'object' && note.time !== null) {
                                        // Extract hour from note time object
                                        const noteHour = note.time.hours;
                                        // Convert to 24-hour format for comparison if needed
                                        let hourNum = parseInt(noteHour);
                                        if (note.time.period === 'PM' && hourNum < 12) {
                                          hourNum += 12;
                                        } else if (note.time.period === 'AM' && hourNum === 12) {
                                          hourNum = 0;
                                        }
                                        const noteHourStr = hourNum.toString().padStart(2, '0');
                                        return noteHourStr === hourStr;
                                      }
                                      return false;
                                    });

                                    return (
                                      <div key={hourIndex} className="h-16 p-1 border-b border-gray-100 relative group">
                                        {/* Hour content */}
                                        <div className="h-full flex flex-col gap-1 overflow-y-auto">
                                          {/* Notes for this hour */}
                                          {hourNotes.map((note, noteIndex) => (
                                            <div
                                              key={note.id}
                                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-1.5 rounded-lg text-xs cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditNote(note);
                                              }}
                                            >
                                              <div className="flex items-center gap-1">
                                                <StickyNote size={10} />
                                                <span className="truncate">{note.title}</span>
                                              </div>
                                            </div>
                                          ))}

                                          {/* Proposals for this hour */}
                                          {hourProposals.map((proposal, proposalIndex) => (
                                            <OverlayTrigger
                                              key={proposalIndex}
                                              placement="top"
                                              overlay={
                                                <Tooltip
                                                  id={`tooltip-week-${dayIndex}-${hourIndex}-${proposalIndex}`}
                                                >
                                                  {getProposalDisplayText(proposal)}
                                                </Tooltip>
                                              }
                                            >
                                              <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-1.5 rounded-lg text-xs cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleProposalClick(proposal, day);
                                                }}
                                              >
                                                <div className="truncate">{formatTime(proposal.time)}</div>
                                                <div className="truncate text-xs">{getProposalDisplayText(proposal)}</div>
                                              </div>
                                            </OverlayTrigger>
                                          ))}
                                        </div>

                                        {/* Empty cell add note button */}
                                        {hourNotes.length === 0 && hourProposals.length === 0 && (
                                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              className="text-xs text-gray-400 hover:text-blue-500 transition-colors bg-white/80 backdrop-blur-sm px-2 py-1 rounded"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const newDate = new Date(day);
                                                newDate.setHours(hour, 0, 0, 0);
                                                handleAddNewNoteForDate(newDate);
                                              }}
                                            >
                                              <Plus size={12} className="inline mr-1" />
                                              Add note
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </Card.Body>
                      </Card>
                    </>
                  )}

                  {/* Day View */}
                  {viewMode === "day" && (
                    <>
                      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden mb-4">
                        <Card.Body className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <div>
                              <h5 className="text-xl font-bold text-gray-800 mb-1">
                                Today's Proposals & Notes
                              </h5>
                              <p className="text-gray-600">
                                {new Date().toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>

                            {dateHasNotes(new Date()) && (
                              <Badge bg="info" className="flex items-center gap-2 px-4 py-2 rounded-full self-start cursor-pointer hover:bg-blue-600 transition-colors" onClick={() => handleDateClick(new Date())}>
                                <StickyNote size={14} />
                                {getNotesCountForDate(new Date())} Note{getNotesCountForDate(new Date()) !== 1 ? 's' : ''} - Click to view
                              </Badge>
                            )}
                          </div>

                          {filteredProposals.length === 0 && filteredNotes.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <CalendarIcon className="text-gray-400" size={24} />
                              </div>
                              <h6 className="text-gray-700 font-medium mb-2">No proposals or notes today</h6>
                              <p className="text-gray-500 text-sm mb-4">
                                You have no proposals or notes scheduled for today.
                              </p>
                              <button
                                onClick={() => handleAddNewNoteForDate(new Date())}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-md transition-all duration-200"
                              >
                                <StickyNote size={16} />
                                Add Note for Today
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Today's Notes */}
                              {filteredNotes.length > 0 && (
                                <div className="mb-6">
                                  <h6 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <StickyNote size={18} className="text-blue-500" />
                                    Today's Notes ({filteredNotes.length})
                                  </h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredNotes.slice(0, 4).map((note) => (
                                      <div
                                        key={note.id}
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300"
                                        onClick={() => handleEditNote(note)}
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <h6 className="font-semibold text-gray-800">
                                            {note.title}
                                          </h6>
                                          {note.time && (
                                            <Badge bg="info" className="rounded-full px-2 py-1 text-xs">
                                              <Clock size={10} className="mr-1" />
                                              {formatNoteTime(note.time)}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                          {note.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  {filteredNotes.length > 4 && (
                                    <div className="text-center mt-4">
                                      <Button
                                        variant="outline"
                                        className="rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
                                        onClick={() => handleDateClick(new Date())}
                                      >
                                        View All {filteredNotes.length} Notes
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Today's Proposals */}
                              {filteredProposals.length > 0 && (
                                <div>
                                  <h6 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Clock size={18} className="text-green-500" />
                                    Today's Proposals ({filteredProposals.length})
                                  </h6>
                                  <div className="space-y-4">
                                    {filteredProposals.map((proposal, index) => (
                                      <div
                                        key={index}
                                        className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 group"
                                        onClick={() => handleProposalClick(proposal, new Date(proposal.date))}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                              <Clock className="text-green-600" size={20} />
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="text-green-600 font-semibold">
                                                  {formatTime(proposal.time)}
                                                </span>
                                                <Badge bg="success" className="rounded-full px-2 py-0.5 text-xs">
                                                  Proposal
                                                </Badge>
                                              </div>
                                              <h6 className="font-semibold text-gray-800 text-lg mb-1">
                                                {getProposalDisplayText(proposal)}
                                              </h6>
                                              {proposal.proposalEmail?.fromName && (
                                                <p className="text-gray-600 text-sm">
                                                  From: {proposal.proposalEmail.fromName}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-2 hover:bg-gray-100 rounded-lg">
                                              <ArrowLeft size={18} className="text-gray-400 rotate-180" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </>
                  )}
                </>
              )}
            </Col>
          </Row>

          {/* Proposal Detail Modal */}
          <Modal
            show={showProposalModal}
            onHide={() => setShowProposalModal(false)}
            centered
            size={selectedProposals.length > 1 ? "lg" : "md"}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedProposals.length > 1 ? "Multiple Proposals" : "Proposal Details"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedProposals.map((proposal, index) => (
                <div
                  key={index}
                  className="proposal-detail-item mb-4"
                  style={{
                    borderBottom:
                      selectedProposals.length > 1 && index < selectedProposals.length - 1
                        ? "1px solid #dee2e6"
                        : "none",
                    paddingBottom: "10px",
                  }}
                >
                  {selectedProposals.length > 1 && <h5>Proposal {index + 1}</h5>}
                  <div className="mb-3">
                    <strong>Date: </strong>
                    {proposal.fullDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mb-3">
                    <strong>Time: </strong>
                    {formatTime(proposal.time)}
                  </div>
                  <div className="mb-3">
                    <strong>Title: </strong>
                    {getProposalDisplayText(proposal)}
                  </div>

                  {proposal.proposalEmail && (
                    <>
                      {proposal.proposalEmail.fromName && (
                        <div className="mb-2">
                          <strong>From: </strong>
                          {proposal.proposalEmail.fromName}
                        </div>
                      )}
                      {proposal.proposalEmail.link && (
                        <div className="mb-2">
                          <strong>Link: </strong>
                          <a
                            href={proposal.proposalEmail.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            {proposal.proposalEmail.link}
                          </a>
                        </div>
                      )}
                      {proposal.proposalEmail.expirationDate && (
                        <div className="mb-2">
                          <strong>Expiration Date: </strong>
                          {new Date(
                            proposal.proposalEmail.expirationDate
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {proposal.proposalEmail.description && (
                        <div className="mb-2">
                          <strong>Description: </strong>
                          {proposal.proposalEmail.description}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowProposalModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>

      {/* Note Modal */}
      <Modal
        show={showNoteModal}
        onHide={() => {
          setShowNoteModal(false);
          resetNoteForm();
        }}
        centered
        backdrop="static"
        keyboard={false}
        animation={true}
        size="lg"
        className="note-modal"
        onEntered={() => {
          setTimeout(() => {
            const firstInput = document.querySelector('.note-modal input, .note-modal textarea');
            if (firstInput) firstInput.focus();
          }, 100);
        }}
      >
        {NoteModalContent}
      </Modal>

      {/* Notes List Modal */}
      <Modal
        show={showNotesListModal}
        onHide={() => {
          setShowNotesListModal(false);
          setSelectedDateForNote(null);
          setExpandedNoteId(null);
        }}
        centered
        backdrop="static"
        keyboard={false}
        animation={true}
        size="lg"
        className="notes-list-modal"
      >
        {NotesListModalContent}
      </Modal>
    </div>
  );
}