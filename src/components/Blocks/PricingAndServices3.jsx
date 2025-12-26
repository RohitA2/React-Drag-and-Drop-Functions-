import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Spinner,
  Badge,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  X,
  PlusCircle,
  Search,
  Settings,
  Zap,
  TrendingDown,
  ChevronDown,
  MessageSquare,
  Loader,
  CheckCircle,
} from "lucide-react";
import Select from "react-select";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import { useDispatch, useSelector } from "react-redux";
import { createPricingBlock } from "../../store/pricingSlice";
import { selectedUserId } from "../../store/authSlice";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Enhanced currency list with symbols
const currencyOptions = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "CA$" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "SEK", label: "SEK - Swedish Krona", symbol: "kr" },
];

const vatOptions = [
  { value: "inclusive", label: "VAT Inclusive", badge: "primary" },
  { value: "exclusive", label: "VAT Exclusive", badge: "secondary" },
  { value: "none", label: "No VAT", badge: "outline-secondary" },
  { value: "reverse", label: "Reverse Charge (RUT)", badge: "success" },
];

// VAT Rate dropdown options
const vatRateOptions = [
  { value: 25, label: "25%" },
  { value: 12, label: "12%" },
  { value: 6, label: "6%" },
  { value: 0, label: "0%" },
];

const rutOptions = [
  { value: "apply", label: "Apply RUT Discount", badge: "success" },
  { value: "none", label: "No RUT Discount", badge: "secondary" },
];

const rotOptions = [
  { value: "apply", label: "Apply ROT Discount", badge: "success" },
  { value: "none", label: "No ROT Discount", badge: "secondary" },
];

const envTaxOptions = [
  { value: "exclusive", label: "Env Tax Exclusive", badge: "warning" },
  { value: "inclusive", label: "Env Tax Inclusive", badge: "info" },
  { value: "none", label: "No Env Tax", badge: "secondary" },
];

const emptyItem = () => ({
  name: "",
  quantity: 1,
  unitPrice: "",
  description: "",
  vatRate: 25,
  vatType: "exclusive",
  rutDiscount: 0,
  rutType: "apply",
  rotDiscount: 0,
  rotType: "apply",
  envTaxRate: 0,
  envType: "exclusive",
});

const PricingAndServices3 = ({ isPreview = false, blockId, parentId, data, isExisting }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);

  // Initialize from existing data if in edit mode
  const getInitialTitle = () => data?.title || "Scope of Work";
  const getInitialCurrency = () => {
    if (data?.currency) {
      const found = currencyOptions.find(c => c.value === data.currency?.value || c.value === data.currency);
      return found || currencyOptions[0];
    }
    return currencyOptions[0];
  };
  const getInitialItems = () => {
    if (isExisting && data?.items && Array.isArray(data.items)) {
      return data.items.map(item => ({
        ...emptyItem(),
        name: item.name || "",
        price: item.price || 0,
        description: item.description || "",
        quantity: item.quantity || 1,
        vatRate: item.vatRate ?? 25,
        vatType: item.vatType || "exclusive",
        rutDiscount: item.rutDiscount || 0,
        rutType: item.rutType || "apply",
        rotDiscount: item.rotDiscount || 0,
        rotType: item.rotType || "apply",
        envTaxRate: item.envTaxRate || 0,
        envType: item.envType || "exclusive",
      }));
    }
    return [emptyItem()];
  };
  const getInitialNotes = () => data?.notes || "<p>Add optional notes or terms here.</p>";

  const [title, setTitle] = useState(getInitialTitle);
  const [currency, setCurrency] = useState(getInitialCurrency);
  const [items, setItems] = useState(getInitialItems);
  const [notes, setNotes] = useState(getInitialNotes);

  const [globalVatRate, setGlobalVatRate] = useState(data?.globalVatRate ?? 25);
  const [globalVatType, setGlobalVatType] = useState(data?.globalVatType || "exclusive");
  const [globalRutDiscount, setGlobalRutDiscount] = useState(data?.globalRutDiscount || 0);
  const [globalRutType, setGlobalRutType] = useState(data?.globalRutType || "apply");
  const [globalRotDiscount, setGlobalRotDiscount] = useState(data?.globalRotDiscount || 0);
  const [globalRotType, setGlobalRotType] = useState(data?.globalRotType || "apply");
  const [globalEnvTaxRate, setGlobalEnvTaxRate] = useState(data?.globalEnvTaxRate || 0);
  const [globalEnvType, setGlobalEnvType] = useState(data?.globalEnvType || "exclusive");

  // Service Management State
  const [allServices, setAllServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceVatRate, setNewServiceVatRate] = useState(25);
  const [savingNewService, setSavingNewService] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");

  // Refs for auto-save and dropdown
  const lastSaveDataRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch existing services
  const fetchServices = useCallback(async () => {
    if (!userId) return;
    setLoadingServices(true);
    try {
      const response = await axios.get(`${API_URL}/service/${userId}`);
      if (response.data.success) {
        const formattedServices = (response.data.data || [])
          .filter(service => service && service.title)
          .map(service => ({
            id: service.id || service._id || `service-${Date.now()}-${Math.random()}`,
            _id: service._id || service.id,
            title: service.title,
            description: service.description || service.content || "",
            content: service.content || service.description || "",
            price: service.price ?? 0,
            vat_rate: service.vat_rate ?? 25,
            userId: service.userId || userId,
          }));
        console.log('Fetched services:', formattedServices);
        setAllServices(formattedServices);
      } else {
        toast.error(response.data.message || "Failed to load services");
        setAllServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
      setAllServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filter services based on search term
  const filteredServices = allServices.filter(service => {
    if (!service || !service.title) return false;
    if (!serviceSearchTerm.trim()) return true;
    const searchLower = serviceSearchTerm.toLowerCase();
    const title = (service.title || "").toLowerCase();
    const description = (service.description || "").toLowerCase();
    return title.includes(searchLower) || description.includes(searchLower);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen !== null && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on the dropdown toggle button
        const toggleButton = document.querySelector(`button[data-index="${dropdownOpen}"]`);
        if (!toggleButton || !toggleButton.contains(event.target)) {
          setDropdownOpen(null);
          setServiceSearchTerm("");
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const updateItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleProductSettings = (index) => {
    setCurrentItemIndex(index);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    setShowSettingsModal(false);
  };

  // Service template handlers
  const toggleDropdown = (index) => {
    if (dropdownOpen === index) {
      setDropdownOpen(null);
      setServiceSearchTerm("");
    } else {
      setDropdownOpen(index);
      setServiceSearchTerm("");
    }
  };

  const selectService = (service, index) => {
    console.log('Selecting service:', service, 'for index:', index);
    if (!service || !service.title) {
      console.error('Invalid service object:', service);
      toast.error("Cannot select service - invalid data");
      return;
    }
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      name: service.title,
      description: service.description || service.content || "",
      unitPrice: service.price || 0,
      vatRate: service.vat_rate || globalVatRate,
    };
    console.log('Updated item:', newItems[index]);
    setItems(newItems);
    setDropdownOpen(null);
    setServiceSearchTerm("");
    // Trigger auto-save after selection
    setTimeout(() => {
      autoSave();
    }, 100);
  };

  const handleSaveNewService = async () => {
    if (!newServiceTitle.trim()) {
      toast.error("Please enter a service title");
      return;
    }
    if (!userId) {
      toast.error("User ID is missing. Please refresh the page.");
      return;
    }

    setSavingNewService(true);
    try {
      const serviceData = {
        userId,
        title: newServiceTitle.trim(),
        content: newServiceDescription.trim(),
        description: newServiceDescription.trim(),
        price: parseFloat(newServicePrice) || 0,
        vat_rate: newServiceVatRate,
      };

      const response = await axios.post(`${API_URL}/service/create`, serviceData);
      if (response.data && response.data.success) {
        const newService = response.data.data || {};
        const formattedService = {
          id: newService.id || newService._id || `service-${Date.now()}-${Math.random()}`,
          _id: newService._id || newService.id,
          title: newService.title || newServiceTitle.trim(),
          description: newService.description || newService.content || newServiceDescription.trim() || "",
          content: newService.content || newServiceDescription.trim() || "",
          price: (newService.price ?? (parseFloat(newServicePrice) || 0)),
          vat_rate: newService.vat_rate || newServiceVatRate || globalVatRate,
          userId: newService.userId || userId,
        };

        // prepend to services list (avoid duplicates)
        setAllServices(prev => {
          const exists = prev.some(s => s.id === formattedService.id || s._id === formattedService._id || s.title === formattedService.title);
          if (!exists) return [formattedService, ...prev];
          return prev;
        });

        // Reset form fields
        setNewServiceTitle("");
        setNewServiceDescription("");
        setNewServicePrice("");
        setNewServiceVatRate(25);

        // Auto-select into the current item if valid index exists
        if (currentItemIndex !== null && currentItemIndex >= 0 && currentItemIndex < items.length) {
          setItems(prevItems => {
            const copied = [...prevItems];
            copied[currentItemIndex] = {
              ...copied[currentItemIndex],
              name: formattedService.title,
              description: formattedService.description,
              unitPrice: formattedService.price,
              vatRate: formattedService.vat_rate,
            };
            return copied;
          });

          // trigger autosave quickly
          setTimeout(() => autoSave(), 150);
        }

        toast.success("Service template saved successfully!");
        setShowAddServiceModal(false);
        setCurrentItemIndex(null);

        // refresh services from server to ensure canonical state
        setTimeout(() => {
          fetchServices();
        }, 300);
      } else {
        toast.error(response.data?.message || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save service");
    } finally {
      setSavingNewService(false);
    }
  };

  // Enhanced calculation with VAT, RUT, ROT, and Environment Tax
  const calculateItemTotals = (item) => {
    const price = parseFloat(item.unitPrice) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const vatRate = parseFloat(item.vatRate) || globalVatRate;
    const rutDiscount = parseFloat(item.rutDiscount) || globalRutDiscount;
    const rotDiscount = parseFloat(item.rotDiscount) || globalRotDiscount;
    const envTaxRate = parseFloat(item.envTaxRate) || globalEnvTaxRate;

    const subtotal = price * quantity;
    let vatAmount = 0;
    let rutDiscountAmount = 0;
    let rotDiscountAmount = 0;
    let envTaxAmount = 0;
    let total = subtotal;

    const rutType = item.rutType || globalRutType;
    // Calculate RUT discount
    if (rutType === "apply" && rutDiscount > 0) {
      rutDiscountAmount = subtotal * (rutDiscount / 100);
      total -= rutDiscountAmount;
    }

    const rotType = item.rotType || globalRotType;
    // Calculate ROT discount
    if (rotType === "apply" && rotDiscount > 0) {
      rotDiscountAmount = total * (rotDiscount / 100);
      total -= rotDiscountAmount;
    }

    // Calculate Environment Tax
    const envType = item.envType || globalEnvType;
    let envBase = total;
    if (envType === "none") {
      envTaxAmount = 0;
    } else if (envType === "exclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
      total += envTaxAmount;
    } else if (envType === "inclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
      // For inclusive, do not add to total (assuming price includes it)
    }

    // Calculate VAT based on type
    const vatType = item.vatType || globalVatType;
    if ((vatType === "exclusive" || vatType === "inclusive") && vatRate > 0) {
      vatAmount = total * (vatRate / 100);
      if (vatType !== "reverse") {
        total += vatAmount;
      }
    } else if (vatType === "reverse" && vatRate > 0) {
      vatAmount = total * (vatRate / 100);
    }

    return {
      subtotal,
      vatAmount,
      rutDiscountAmount,
      rotDiscountAmount,
      envTaxAmount,
      total: vatType === "reverse" ? total : total + (vatType === "exclusive" ? vatAmount : 0),
    };
  };

  const itemTotals = useMemo(
    () => items.map((item) => calculateItemTotals(item)),
    [items, globalVatRate, globalVatType, globalRutDiscount, globalRutType, globalRotDiscount, globalRotType, globalEnvTaxRate, globalEnvType]
  );

  const netTotal = useMemo(
    () => itemTotals.reduce((sum, item) => sum + item.subtotal, 0),
    [itemTotals]
  );

  const vatTotal = useMemo(
    () => itemTotals.reduce((sum, item) => sum + item.vatAmount, 0),
    [itemTotals]
  );

  const rutDiscountTotal = useMemo(
    () => itemTotals.reduce((sum, item) => sum + item.rutDiscountAmount, 0),
    [itemTotals]
  );

  const rotDiscountTotal = useMemo(
    () => itemTotals.reduce((sum, item) => sum + item.rotDiscountAmount, 0),
    [itemTotals]
  );

  const envTaxTotal = useMemo(
    () => itemTotals.reduce((sum, item) => sum + item.envTaxAmount, 0),
    [itemTotals]
  );

  const rounding = 0;
  const grandTotal = netTotal + vatTotal + envTaxTotal + rounding - rutDiscountTotal - rotDiscountTotal;

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (isSaving || isPreview) return;

    const currentData = {
      blockId,
      userId,
      parentId,
      title,
      packageName: "Table-based Pricing",
      packageDescription: notes,
      currency: currency.value,
      pricingType: "fixed",
      netTotal,
      vat: vatTotal,
      rutDiscount: rutDiscountTotal,
      rotDiscount: rotDiscountTotal,
      envTax: envTaxTotal,
      rounding,
      total: grandTotal,
      items: items.map((item, index) => ({
        ...item,
        ...itemTotals[index],
      })),
      globalVatRate,
      globalVatType,
      globalRutDiscount,
      globalRutType,
      globalRotDiscount,
      globalRotType,
      globalEnvTaxRate,
      globalEnvType,
    };

    // Skip if no changes
    if (JSON.stringify(currentData) === JSON.stringify(lastSaveDataRef.current)) {
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      await dispatch(createPricingBlock(currentData)).unwrap();
      lastSaveDataRef.current = currentData;
      setLastSaveTime(new Date());
      setSaveStatus("saved");

      // Show saved notification briefly
      setTimeout(() => {
        if (saveStatus === "saved") {
          setSaveStatus("saved");
        }
      }, 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [
    dispatch,
    blockId,
    userId,
    parentId,
    title,
    notes,
    currency,
    items,
    netTotal,
    vatTotal,
    rutDiscountTotal,
    rotDiscountTotal,
    envTaxTotal,
    grandTotal,
    itemTotals,
    globalVatRate,
    globalVatType,
    globalRutDiscount,
    globalRutType,
    globalRotDiscount,
    globalRotType,
    globalEnvTaxRate,
    globalEnvType,
    isSaving,
    saveStatus,
    isPreview,
  ]);

  // Debounced auto-save effect
  useEffect(() => {
    if (isPreview || isSaving) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a timeout for auto-save (1.5 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    title,
    currency,
    items,
    notes,
    globalVatRate,
    globalVatType,
    globalRutDiscount,
    globalRutType,
    globalRotDiscount,
    globalRotType,
    globalEnvTaxRate,
    globalEnvType,
    autoSave,
    isPreview,
    isSaving,
  ]);

  // Initialize last saved data on mount
  useEffect(() => {
    if (isPreview) return;

    const currentData = {
      blockId,
      userId,
      parentId,
      title,
      packageName: "Table-based Pricing",
      packageDescription: notes,
      currency: currency.value,
      pricingType: "fixed",
      netTotal,
      vat: vatTotal,
      rutDiscount: rutDiscountTotal,
      rotDiscount: rotDiscountTotal,
      envTax: envTaxTotal,
      rounding,
      total: grandTotal,
      items: items.map((item, index) => ({
        ...item,
        ...itemTotals[index],
      })),
      globalVatRate,
      globalVatType,
      globalRutDiscount,
      globalRutType,
      globalRotDiscount,
      globalRotType,
      globalEnvTaxRate,
      globalEnvType,
    };
    lastSaveDataRef.current = currentData;
  }, []);

  const handleManualSave = () => {
    autoSave();
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? "2px solid #6366f1" : "1px solid #e2e8f0",
      borderRadius: "12px",
      minWidth: "140px",
      fontSize: "0.875rem",
      backgroundColor: "white",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.1)" : "none",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: state.isFocused ? "#6366f1" : "#cbd5e1",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      maxHeight: "300px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      padding: "12px 16px",
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
          ? "#f8fafc"
          : "white",
      color: state.isSelected ? "white" : "inherit",
      "&:active": {
        backgroundColor: state.isSelected ? "#6366f1" : "#f1f5f9",
      },
    }),
  };

  const getVatBadgeVariant = (vatType) => {
    const option = vatOptions.find((opt) => opt.value === vatType);
    return option?.badge || "secondary";
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Spinner animation="border" size="sm" className="me-1" />;
      case "saved":
        return "✓";
      case "error":
        return "⚠";
      default:
        return "";
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return lastSaveTime ? `Saved ${lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Saved";
      case "error":
        return "Save failed";
      default:
        return "";
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case "saving":
        return "text-warning";
      case "saved":
        return "text-success";
      case "error":
        return "text-danger";
      default:
        return "text-muted";
    }
  };

  return (
    <div
      className={`container p-6 bg-white shadow-xl border border-gray-200 ${isPreview ? "pointer-events-none" : ""
        }`}
      style={{ maxWidth: "1800px" }}
    >
      {/* Header Section with Auto-save Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold border-0 bg-transparent text-gray-900 p-0 focus:ring-0"
            style={{ outline: "none", boxShadow: "none" }}
            readOnly={isPreview}
          />
          {!isPreview && (
            <div className={`text-xs mt-1 ${getSaveStatusColor()}`}>
              <span className="fw-medium">{getSaveStatusIcon()} {getSaveStatusText()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Global Settings Dropdown */}
          {!isPreview && (
            <Dropdown align="end">
              {/* <Dropdown.Toggle
                as="div"
                className="btn p-3 rounded-2xl border-0 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Settings size={20} className="text-gray-600" />
              </Dropdown.Toggle> */}

              <Dropdown.Menu className="rounded-2xl shadow-lg border-0 p-3 min-w-80">
                <Dropdown.Header className="fw-bold text-gray-700">
                  Global Settings
                </Dropdown.Header>
                <div className="px-2 py-3 space-y-4">
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      💸 Global VAT Rate
                    </Form.Label>
                    <Form.Select
                      value={globalVatRate}
                      onChange={(e) =>
                        setGlobalVatRate(parseFloat(e.target.value))
                      }
                      size="sm"
                      className="rounded-xl"
                    >
                      {vatRateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      📊 Global VAT Type
                    </Form.Label>
                    <Form.Select
                      value={globalVatType}
                      onChange={(e) => setGlobalVatType(e.target.value)}
                      size="sm"
                      className="rounded-xl"
                    >
                      {vatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      <TrendingDown size={14} className="me-1" />
                      Global RUT Discount (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={globalRutDiscount}
                      onChange={(e) =>
                        setGlobalRutDiscount(parseFloat(e.target.value))
                      }
                      min="0"
                      max="100"
                      step="0.1"
                      size="sm"
                      className="rounded-xl"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      📊 Global RUT Type
                    </Form.Label>
                    <Form.Select
                      value={globalRutType}
                      onChange={(e) => setGlobalRutType(e.target.value)}
                      size="sm"
                      className="rounded-xl"
                    >
                      {rutOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      <TrendingDown size={14} className="me-1" />
                      Global ROT Discount (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={globalRotDiscount}
                      onChange={(e) =>
                        setGlobalRotDiscount(parseFloat(e.target.value))
                      }
                      min="0"
                      max="100"
                      step="0.1"
                      size="sm"
                      className="rounded-xl"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      📊 Global ROT Type
                    </Form.Label>
                    <Form.Select
                      value={globalRotType}
                      onChange={(e) => setGlobalRotType(e.target.value)}
                      size="sm"
                      className="rounded-xl"
                    >
                      {rotOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      🌿 Global Environment Tax Rate (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={globalEnvTaxRate}
                      onChange={(e) =>
                        setGlobalEnvTaxRate(parseFloat(e.target.value))
                      }
                      min="0"
                      step="0.1"
                      size="sm"
                      className="rounded-xl"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-gray-700">
                      📊 Global Env Tax Type
                    </Form.Label>
                    <Form.Select
                      value={globalEnvType}
                      onChange={(e) => setGlobalEnvType(e.target.value)}
                      size="sm"
                      className="rounded-xl"
                    >
                      {envTaxOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          )}

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Currency:</span>
            <Select
              options={currencyOptions}
              value={currency}
              onChange={setCurrency}
              isDisabled={isPreview}
              className="currency-select"
              classNamePrefix="select"
              isSearchable
              styles={customStyles}
              placeholder="Search currency..."
              components={{
                DropdownIndicator: () => (
                  <Search size={16} className="text-gray-400 me-1" />
                ),
                IndicatorSeparator: () => null,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white">
        <Card.Header className="bg-linear-to-r from-blue-50 to-indigo-50 border-0 py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-indigo-600" />
              <span className="fw-semibold text-gray-700">
                Table-based Pricing
              </span>
            </div>
            {!isPreview && (
              <div className="flex items-center gap-2">
                {saveStatus === "error" && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleManualSave}
                    className="rounded-xl"
                  >
                    Retry Save
                  </Button>
                )}
                <Badge bg="outline-primary" className="py-2 px-3 rounded-xl">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </Badge>
              </div>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-6">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="text-muted small border-bottom-2">
                  <th style={{ width: "40%" }} className="pb-3 fw-semibold">
                    Product / Service
                  </th>
                  <th style={{ width: 100 }} className="pb-3 fw-semibold">
                    Qty
                  </th>
                  <th style={{ width: 160 }} className="pb-3 fw-semibold">
                    Unit Price
                  </th>
                  <th
                    style={{ width: 120 }}
                    className="pb-3 fw-semibold text-center"
                  >
                    VAT Type
                  </th>
                  <th
                    style={{ width: 160 }}
                    className="pb-3 fw-semibold text-end"
                  >
                    Line Total
                  </th>
                  <th style={{ width: 100 }} className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-bottom-0">
                    <td>
                      <div className="d-flex align-items-center gap-2 position-relative">
                        <button
                          data-index={index}
                          className="w-full px-4 py-2 text-start rounded-xl border border-gray-200 bg-white/80 hover:bg-white flex items-center justify-between transition-all duration-300"
                          onClick={() => toggleDropdown(index)}
                        >
                          <div className="flex items-center truncate">
                            <MessageSquare size={16} className="text-gray-400 mr-2 shrink-0" />
                            <span className="text-gray-800 font-medium truncate">
                              {item.name || "Select a service template..."}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-300 ${dropdownOpen === index ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                        {!isPreview && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-xl border-0 bg-transparent shrink-0"
                            onClick={() => handleProductSettings(index)}
                            title="Product settings"
                          >
                            <Settings size={14} />
                          </Button>
                        )}
                      </div>
                      {item.description && (
                        <div className="small text-muted mt-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        readOnly={isPreview}
                        className="rounded-xl"
                      />
                    </td>
                    <td>
                      <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0 rounded-s-xl">
                          <span className="fw-bold text-gray-600">
                            {currency.symbol || currency.value}
                          </span>
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, "unitPrice", e.target.value)
                          }
                          readOnly={isPreview}
                          className="border-start-0 rounded-e-xl"
                        />
                      </InputGroup>
                    </td>
                    <td className="text-center">
                      <Badge
                        bg={getVatBadgeVariant(item.vatType || globalVatType)}
                        className="py-2 px-3 rounded-xl w-100"
                      >
                        {(item.vatType || globalVatType) === "reverse"
                          ? "🔄 RUT"
                          : `VAT ${item.vatRate || globalVatRate}%`}
                      </Badge>
                    </td>
                    <td className="text-end fw-semibold">
                      {currency.symbol || currency.value}{" "}
                      {itemTotals[index]?.total.toFixed(2)}
                    </td>
                    <td className="text-end">
                      {!isPreview && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="rounded-xl border-0"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Service Dropdown Modal - RENDERED AS A MODAL OVERLAY */}
          {!isPreview && dropdownOpen !== null && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-9998 animate-fadeIn"
                onClick={() => {
                  setDropdownOpen(null);
                  setServiceSearchTerm("");
                }}
              />
              {/* Dropdown Container */}
              <div
                ref={dropdownRef}
                className="fixed z-9999 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-modalIn"
                style={{
                  width: 'min(500px, 90vw)',
                  maxHeight: 'min(500px, 70vh)',
                  overflowY: 'auto',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
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
                      onClick={() => {
                        setCurrentItemIndex(dropdownOpen);
                        setShowAddServiceModal(true);
                        setDropdownOpen(null);
                      }}
                    >
                      <PlusCircle size={14} className="inline mr-1" />
                      Add New Service Template
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
                          autoFocus
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
                    {/* Services List */}
                    <div className="max-h-[300px] overflow-y-auto p-2">
                      {filteredServices.length === 0 ? (
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
                        filteredServices
                          .map((service) => {
                            if (!service || !service.title) {
                              console.warn('Invalid service found:', service);
                              return null;
                            }
                            const isSelected = items[dropdownOpen]?.name === service.title;
                            return (
                              <button
                                key={service.id || service._id || `service-${Date.now()}`}
                                className={`w-full text-left p-3 rounded-xl mb-2 flex items-center justify-between transition-all duration-200 service-option-btn ${isSelected
                                  ? 'bg-green-50 border-l-4 border-green-500'
                                  : 'bg-white hover:bg-blue-50 border-l-4 border-blue-500'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  selectService(service, dropdownOpen);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <div className="flex items-start min-w-0 flex-1">
                                  <MessageSquare size={12} className="text-blue-500 mt-1 mr-2 shrink-0" />
                                  <div className="truncate min-w-0 flex-1">
                                    <div className="font-semibold truncate text-gray-800">
                                      {service.title || "Untitled Service"}
                                    </div>
                                    {(service.description || service.content) && (
                                      <small className="text-gray-500 truncate block">
                                        {service.description || service.content}
                                      </small>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle size={16} className="text-green-500 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })
                          .filter(Boolean)
                      )}
                    </div>
                    {/* Add New Service Button */}
                    <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
                      <button
                        className="w-full p-3 rounded-xl text-blue-600 font-semibold border border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition-all duration-300 flex items-center justify-center"
                        onClick={() => {
                          setCurrentItemIndex(dropdownOpen);
                          setShowAddServiceModal(true);
                          setDropdownOpen(null);
                        }}
                      >
                        <PlusCircle size={16} className="mr-2" />
                        Add New Service Template
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Add Item Button */}
          {!isPreview && (
            <Button
              variant="outline-primary"
              className="d-flex align-items-center gap-2 mt-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
              onClick={addItem}
            >
              <PlusCircle size={20} />
              Add Product / Service
            </Button>
          )}

          {/* Summary Section */}
          <div className="mt-5 p-4 bg-gray-50 rounded-2xl">
            <div className="row">
              <div className="col-md-8">
                <h6 className="fw-bold text-gray-700 mb-3">📝 Notes & Terms</h6>
                <EditableQuill
                  id="price3-notes"
                  value={notes}
                  onChange={setNotes}
                  placeholder="Write additional notes or terms..."
                  isPreview={isPreview}
                  className="small"
                />
              </div>
              <div className="col-md-4">
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <h6 className="fw-bold text-gray-700 mb-3 flex items-center gap-2">
                    💰 Payment Summary
                    {isSaving && (
                      <span className="text-warning text-xs fw-normal flex items-center gap-1">
                        <Spinner animation="border" size="sm" />
                        Saving...
                      </span>
                    )}
                  </h6>

                  <div className="space-y-2 small">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Net total</span>
                      <span className="fw-semibold">
                        {currency.symbol} {netTotal.toFixed(2)}
                      </span>
                    </div>

                    {rutDiscountTotal > 0 && (
                      <div className="flex justify-between items-center text-success">
                        <span className="flex items-center gap-1">
                          <TrendingDown size={12} />
                          RUT Discount
                        </span>
                        <span className="fw-semibold">
                          -{currency.symbol} {rutDiscountTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {rotDiscountTotal > 0 && (
                      <div className="flex justify-between items-center text-success">
                        <span className="flex items-center gap-1">
                          <TrendingDown size={12} />
                          ROT Discount
                        </span>
                        <span className="fw-semibold">
                          -{currency.symbol} {rotDiscountTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {envTaxTotal > 0 && (
                      <div className="flex justify-between items-center text-info">
                        <span>Env Tax ({globalEnvTaxRate}%)</span>
                        <span className="fw-semibold">
                          {currency.symbol} {envTaxTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">VAT </span>
                      <span className="fw-semibold">
                        {currency.symbol} {vatTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rounding</span>
                      <span className="fw-semibold">
                        {currency.symbol} {rounding.toFixed(2)}
                      </span>
                    </div>

                    <hr className="my-2" />

                    <div className="flex justify-between items-center fw-bold fs-5">
                      <span>Total Amount</span>
                      <span className="text-success">
                        {currency.symbol} {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {items.some(
                    (item) => (item.vatType || globalVatType) === "reverse"
                  ) && (
                      <Alert variant="info" className="mt-3 small rounded-xl">
                        <strong>Reverse Charge Applied:</strong> VAT to be paid
                        directly to tax authority
                      </Alert>
                    )}

                  {/* Manual Save Button (Optional - can be removed) */}
                  {!isPreview && saveStatus === "error" && (
                    <Button
                      variant="outline-danger"
                      onClick={handleManualSave}
                      className="w-100 mt-3 py-2 rounded-2xl fw-semibold"
                    >
                      Retry Save
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Settings Modal */}
      {!isPreview && (
        <Modal
          show={showSettingsModal}
          onHide={() => setShowSettingsModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold small">⚙️ Product Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            {items[currentItemIndex] && (
              <Form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Product Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={items[currentItemIndex].name}
                        onChange={(e) =>
                          updateItem(currentItemIndex, "name", e.target.value)
                        }
                        className="rounded-xl"
                        size="sm"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={items[currentItemIndex].quantity}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={items[currentItemIndex].description || ""}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "description",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Unit Price</Form.Label>
                      <InputGroup size="sm">
                        <InputGroup.Text className="rounded-s-xl">
                          {currency.symbol}
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={items[currentItemIndex].unitPrice}
                          onChange={(e) =>
                            updateItem(
                              currentItemIndex,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          className="rounded-e-xl"
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        VAT Rate
                      </Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].vatRate || globalVatRate}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "vatRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      >
                        {vatRateOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="fw-semibold small flex items-center gap-1">
                        <TrendingDown size={12} />
                        RUT Discount (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={
                          items[currentItemIndex].rutDiscount || globalRutDiscount
                        }
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "rutDiscount",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="fw-semibold small flex items-center gap-1">
                        <TrendingDown size={12} />
                        ROT Discount (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={
                          items[currentItemIndex].rotDiscount || globalRotDiscount
                        }
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "rotDiscount",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Env Tax Rate (%)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={items[currentItemIndex].envTaxRate || globalEnvTaxRate}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "envTaxRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">VAT Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].vatType || globalVatType}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "vatType",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      >
                        {vatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">RUT Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].rutType || globalRutType}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "rutType",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      >
                        {rutOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">ROT Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].rotType || globalRotType}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "rotType",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      >
                        {rotOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Env Tax Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].envType || globalEnvType}
                        onChange={(e) =>
                          updateItem(
                            currentItemIndex,
                            "envType",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
                        size="sm"
                      >
                        {envTaxOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  {/* Calculation Preview */}
                  <div className="col-12">
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-3">
                      <h6 className="fw-bold mb-2 small">📊 Calculation Preview</h6>
                      <div className="row small text-gray-700">
                        <div className="col-md-3 mb-1">
                          <div>Subtotal:</div>
                          <div className="fw-semibold">
                            {currency.symbol}{" "}
                            {calculateItemTotals(items[currentItemIndex]).subtotal.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-1">
                          <div>RUT Discount:</div>
                          <div className="fw-semibold text-success">
                            -{currency.symbol}{" "}
                            {calculateItemTotals(items[currentItemIndex]).rutDiscountAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-1">
                          <div>ROT Discount:</div>
                          <div className="fw-semibold text-success">
                            -{currency.symbol}{" "}
                            {calculateItemTotals(items[currentItemIndex]).rotDiscountAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-1">
                          <div>Env Tax:</div>
                          <div className="fw-semibold text-info">
                            {currency.symbol}{" "}
                            {calculateItemTotals(items[currentItemIndex]).envTaxAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-1">
                          <div>VAT ({items[currentItemIndex].vatRate || globalVatRate}%):</div>
                          <div className="fw-semibold">
                            {currency.symbol}{" "}
                            {calculateItemTotals(items[currentItemIndex]).vatAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-1">
                          <div>Total:</div>
                          <div className="fw-bold text-success">
                            {currency.symbol}{" "}
                            {calculateItemTotals(items[currentItemIndex]).total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={() => setShowSettingsModal(false)}
              className="rounded-xl"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              className="rounded-xl"
              size="sm"
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Add New Service Modal */}
      {!isPreview && showAddServiceModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={() => {
              setShowAddServiceModal(false);
              setCurrentItemIndex(null);
              setNewServiceTitle("");
              setNewServiceDescription("");
              setNewServicePrice("");
              setNewServiceVatRate(25);
            }}
          />
          <div
            className="fixed inset-0 z-60 overflow-y-auto p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddServiceModal(false);
                setCurrentItemIndex(null);
                setNewServiceTitle("");
                setNewServiceDescription("");
                setNewServicePrice("");
                setNewServiceVatRate(25);
              }
            }}
          >
            <div className="flex min-h-full items-center justify-center">
              <div className="relative w-full max-w-lg">
                <div
                  className="bg-linear-to-b from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden border border-white/40 animate-modalIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative bg-linear-to-r from-blue-500 to-purple-600 text-white pb-6 pt-8 px-8">
                    <div className="relative z-10 flex items-center">
                      <div className="flex items-center justify-center rounded-2xl mr-4 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30">
                        <PlusCircle size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-1">New Service Template</h4>
                        <p className="text-white/75 text-sm font-light">
                          Add a service template that you can reuse across multiple pricing blocks
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all duration-300"
                        onClick={() => {
                          setShowAddServiceModal(false);
                          setCurrentItemIndex(null);
                          setNewServiceTitle("");
                          setNewServiceDescription("");
                          setNewServicePrice("");
                          setNewServiceVatRate(25);
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="mb-6">
                      <label className="font-semibold text-blue-600 mb-3 text-sm flex items-center">
                        <MessageSquare size={18} className="mr-2" />
                        Service Title *
                      </label>
                      <input
                        type="text"
                        className="w-full px-5 py-3 rounded-xl border-2 border-blue-300 bg-blue-50/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                        placeholder="Enter service title..."
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        maxLength={100}
                      />
                    </div>
                    <div className="mb-6">
                      <label className="font-semibold text-blue-600 mb-3 text-sm flex items-center">
                        <MessageSquare size={18} className="mr-2" />
                        Description
                      </label>
                      <textarea
                        className="w-full px-5 py-3 rounded-xl border-2 border-blue-300 bg-blue-50/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 resize-y min-h-[100px]"
                        placeholder="Describe your service here..."
                        rows={3}
                        value={newServiceDescription}
                        onChange={(e) => setNewServiceDescription(e.target.value)}
                        maxLength={500}
                      />
                    </div>
                  </div>
                  <div className="px-8 py-6 bg-gray-50/50">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all duration-300 flex items-center"
                        onClick={() => {
                          setShowAddServiceModal(false);
                          setCurrentItemIndex(null);
                          setNewServiceTitle("");
                          setNewServiceDescription("");
                          setNewServicePrice("");
                          setNewServiceVatRate(25);
                        }}
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        onClick={handleSaveNewService}
                        disabled={!newServiceTitle.trim() || savingNewService}
                      >
                        {savingNewService ? (
                          <>
                            <Loader size={16} className="animate-spin mr-2" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-2" />
                            <span>Save Service Template</span>
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

      <style>{`
        /* Modern typography */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .table-responsive {
          border-radius: 1rem;
          overflow: hidden;
        }
        
        .table {
          margin-bottom: 0;
        }
        
        .table th {
          border-top: none;
          background-color: #f8fafc;
        }

        .table td {
          border-color: #f1f5f9;
          padding: 1rem 0.75rem;
          vertical-align: middle;
        }
        
        .table tr:hover td {
          background-color: #f8fafc;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .bg-gradient-to-br {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }

        /* Auto-save Status */
        .auto-save-status {
          transition: all 0.3s ease;
        }
        
        .service-option-btn {
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
        }
      
        .service-option-btn:hover {
          background: #f0f9ff !important;
        }
      
        .service-option-btn:active {
          transform: scale(0.98);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-modalIn {
          animation: modalIn 0.2s ease-out;
        }
        
        /* Ensure dropdown is above everything */
        .fixed {
          position: fixed !important;
        }
        
        .z-\[9999\] {
          z-index: 9999 !important;
        }
        
        .z-\[9998\] {
          z-index: 9998 !important;
        }
        
        .z-\[60\] {
          z-index: 60 !important;
        }
      `}</style>
    </div>
  );
};

export default PricingAndServices3;