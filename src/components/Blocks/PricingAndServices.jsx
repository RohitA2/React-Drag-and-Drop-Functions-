import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Spinner,
  Badge,
  Alert,
  Row,
  Col,
  Table,
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
import { Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Comprehensive currency list
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
  { value: "reverse", label: "Reverse Charge", badge: "success" },
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

const PricingAndServices = ({ blockId, parentId, isPreview }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);
  const [title, setTitle] = useState("Scope of Work");
  const [packageName, setPackageName] = useState("Product/service");
  const [currency, setCurrency] = useState(
    currencyOptions.find((opt) => opt.value === "SEK")
  );
  const [packageDescription, setPackageDescription] = useState(
    "Comprehensive service package designed to meet your business needs"
  );
  const [items, setItems] = useState([
    {
      name: "Consultation Service",
      price: 1000,
      description: "Initial consultation and planning",
      quantity: 1,
      vatRate: 25,
      vatType: "exclusive",
      rutDiscount: 0,
      rutType: "apply",
      rotDiscount: 0,
      rotType: "apply",
      envTaxRate: 0,
      envType: "exclusive",
    },
  ]);

  const [globalVatRate, setGlobalVatRate] = useState(25);
  const [globalVatType, setGlobalVatType] = useState("exclusive");
  const [globalRutDiscount, setGlobalRutDiscount] = useState(0);
  const [globalRutType, setGlobalRutType] = useState("apply");
  const [globalRotDiscount, setGlobalRotDiscount] = useState(0);
  const [globalRotType, setGlobalRotType] = useState("apply");
  const [globalEnvTaxRate, setGlobalEnvTaxRate] = useState(0);
  const [globalEnvType, setGlobalEnvType] = useState("exclusive");

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
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");

  // Refs for tracking changes
  const lastSaveDataRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const hasUnsavedChangesRef = useRef(false);
  const dropdownRef = useRef(null);

  // Error state
  const [hasError, setHasError] = useState(false);

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

  // Get current data state
  const getCurrentData = useCallback(() => {
    const itemTotals = items.map(calculateItemTotals);
    const netTotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
    const vatTotal = itemTotals.reduce((sum, item) => sum + item.vatAmount, 0);
    const rutDiscountTotal = itemTotals.reduce(
      (sum, item) => sum + item.rutDiscountAmount,
      0
    );
    const rotDiscountTotal = itemTotals.reduce(
      (sum, item) => sum + item.rotDiscountAmount,
      0
    );
    const envTaxTotal = itemTotals.reduce((sum, item) => sum + item.envTaxAmount, 0);
    const rounding = 0;
    const total = netTotal + vatTotal + envTaxTotal + rounding - rutDiscountTotal - rotDiscountTotal;

    return {
      blockId,
      userId,
      parentId,
      title,
      packageName,
      packageDescription,
      currency: currency.value,
      netTotal,
      vat: vatTotal,
      rutDiscount: rutDiscountTotal,
      rotDiscount: rotDiscountTotal,
      envTax: envTaxTotal,
      rounding,
      total,
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
  }, [
    blockId,
    userId,
    parentId,
    title,
    packageName,
    packageDescription,
    currency,
    items,
    globalVatRate,
    globalVatType,
    globalRutDiscount,
    globalRutType,
    globalRotDiscount,
    globalRotType,
    globalEnvTaxRate,
    globalEnvType,
  ]);

  // Enhanced calculation with RUT, ROT, Environment Tax
  const calculateItemTotals = (item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const vatRate = parseFloat(item.vatRate) || 0;
    const rutDiscount = parseFloat(item.rutDiscount) || 0;
    const rotDiscount = parseFloat(item.rotDiscount) || 0;
    const envTaxRate = parseFloat(item.envTaxRate) || 0;

    let subtotal = price * quantity;
    let rutDiscountAmount = 0;
    let rotDiscountAmount = 0;
    let vatAmount = 0;
    let envTaxAmount = 0;
    let total = subtotal;

    // Apply RUT discount
    if (item.rutType === "apply" && rutDiscount > 0) {
      rutDiscountAmount = subtotal * (rutDiscount / 100);
      total -= rutDiscountAmount;
    }

    // Apply ROT discount
    if (item.rotType === "apply" && rotDiscount > 0) {
      rotDiscountAmount = subtotal * (rotDiscount / 100);
      total -= rotDiscountAmount;
    }

    // Calculate VAT based on type
    if ((item.vatType === "exclusive" || item.vatType === "inclusive") && vatRate > 0) {
      vatAmount = total * (vatRate / 100);
      if (item.vatType !== "reverse") {
        total += vatAmount;
      }
    } else if (item.vatType === "reverse" && vatRate > 0) {
      vatAmount = total * (vatRate / 100);
    }

    // Apply Environment Tax
    let envBase = total;
    if (item.envType === "none") {
      envTaxAmount = 0;
    } else if (item.envType === "exclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
      total += envTaxAmount;
    } else if (item.envType === "inclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
      total += envTaxAmount;
    }

    return {
      subtotal,
      rutDiscountAmount,
      rotDiscountAmount,
      vatAmount,
      envTaxAmount,
      total: item.vatType === "reverse" ? total - vatAmount : total,
    };
  };

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (isSaving) return;
    const currentData = getCurrentData();
    
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
  }, [dispatch, getCurrentData, isSaving, saveStatus]);

  // Debounced auto-save effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
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
    packageName,
    packageDescription,
    currency,
    items,
    globalVatRate,
    globalVatType,
    globalRutDiscount,
    globalRutType,
    globalRotDiscount,
    globalRotType,
    globalEnvTaxRate,
    globalEnvType,
  ]);

  // Initialize last saved data on mount
  useEffect(() => {
    lastSaveDataRef.current = getCurrentData();
  }, []);

  // ---- Handlers ----
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: "",
        price: "",
        description: "",
        quantity: 1,
        vatRate: globalVatRate,
        vatType: globalVatType,
        rutDiscount: globalRutDiscount,
        rutType: globalRutType,
        rotDiscount: globalRotDiscount,
        rotType: globalRotType,
        envTaxRate: globalEnvTaxRate,
        envType: globalEnvType,
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSettings = (index) => {
    setCurrentItemIndex(index);
    setShowModal(true);
  };

  const handleSaveSettings = () => {
    setShowModal(false);
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
      price: service.price || 0,
      vatRate: service.vat_rate || globalVatRate,
    };
    
    console.log('Updated item:', newItems[index]);
    setItems(newItems);
    setDropdownOpen(null);
    setServiceSearchTerm("");
    
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

        setAllServices(prev => {
          const exists = prev.some(s => s.id === formattedService.id || s._id === formattedService._id || s.title === formattedService.title);
          if (!exists) return [formattedService, ...prev];
          return prev;
        });

        setNewServiceTitle("");
        setNewServiceDescription("");
        setNewServicePrice("");
        setNewServiceVatRate(25);

        if (currentItemIndex !== null && currentItemIndex >= 0 && currentItemIndex < items.length) {
          setItems(prevItems => {
            const copied = [...prevItems];
            copied[currentItemIndex] = {
              ...copied[currentItemIndex],
              name: formattedService.title,
              description: formattedService.description,
              price: formattedService.price,
              vatRate: formattedService.vat_rate,
            };
            return copied;
          });

          setTimeout(() => autoSave(), 150);
        }

        toast.success("Service template saved successfully!");
        setShowAddServiceModal(false);
        setCurrentItemIndex(null);

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

  // ---- Totals ----
  const itemTotals = items.map(calculateItemTotals);
  const netTotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const vatTotal = itemTotals.reduce((sum, item) => sum + item.vatAmount, 0);
  const rutDiscountTotal = itemTotals.reduce(
    (sum, item) => sum + item.rutDiscountAmount,
    0
  );
  const rotDiscountTotal = itemTotals.reduce(
    (sum, item) => sum + item.rotDiscountAmount,
    0
  );
  const envTaxTotal = itemTotals.reduce((sum, item) => sum + item.envTaxAmount, 0);
  const rounding = 0;
  const total = netTotal + vatTotal + envTaxTotal + rounding - rutDiscountTotal - rotDiscountTotal;

  // Manual save trigger
  const handleManualSave = () => {
    autoSave();
  };

  // Custom styles for modern look
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

  // Return error state if hasError
  if (hasError) {
    return (
      <div className="container p-6 bg-white shadow-xl border border-gray-200" style={{ maxWidth: "1800px" }}>
        <Alert variant="danger">
          <Alert.Heading>Error Loading Component</Alert.Heading>
          <p>There was an error loading the pricing and services component. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </Alert>
      </div>
    );
  }

  try {
    return (
      <div
        className="container p-6 bg-white shadow-xl border border-gray-200"
        style={{ maxWidth: "1800px" }}
      >
        {/* Header Section with Auto-save Status */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <Form.Control
              type="text"
              value={title}
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              className="text-5xl font-bold border-0 bg-transparent text-gray-900 p-0 focus:ring-0"
              style={{ outline: "none", boxShadow: "none" }}
              readOnly={isPreview}
            />
          </div>
          <div className={`flex items-center gap-2 text-sm ${getSaveStatusColor()}`}>
            <span className="fw-medium">{getSaveStatusIcon()} {getSaveStatusText()}</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white relative">
          <Card.Header className="bg-linear-to-r from-blue-50 to-indigo-50 border-0 py-4 px-6">
            <div className="flex justify-between items-center flex-wrap gap-y-4">
              {/* Left Side: Icon + Label */}
              <div className="flex items-center gap-3 shrink min-w-0">
                <Zap size={20} className="text-indigo-600 shrink-0" />
                <span className="fw-semibold text-gray-700 whitespace-nowrap">
                  Single option package
                </span>
              </div>
              
              {/* Right Side: Currency Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Currency:</span>
                  <Select
                    options={currencyOptions}
                    value={currency}
                    onChange={setCurrency}
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
          </Card.Header>

          <Card.Body className="p-6">
            {/* Package Header */}
            <div className="mb-6">
              <Form.Control
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="text-2xl fw-bold border-0 bg-transparent px-0 mb-3 text-gray-900"
                style={{ outline: "none", boxShadow: "none" }}
              />
              <EditableQuill
                id="packageDescription"
                value={packageDescription}
                onChange={setPackageDescription}
                className="text-gray-600 border-0 px-0 bg-transparent fs-6"
                minRows={2}
              />
            </div>

            {/* Table-like structure matching the image */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Headers */}
                <div className="grid grid-cols-12 gap-4 mb-3 px-2 text-sm font-semibold text-gray-700">
                  <div className="col-span-5">
                    Product / Service
                  </div>
                  <div className="col-span-2 text-center">
                    Qty
                  </div>
                  <div className="col-span-2 text-center">
                    Unit Price
                  </div>
                  <div className="col-span-2 text-center">
                    VAT Type
                  </div>
                  <div className="col-span-1 text-center">
                    Line Total
                  </div>
                </div>

                {/* Items List */}
                {items.map((item, index) => {
                  const lineTotal = calculateItemTotals(item).total;
                  
                  return (
                    <div key={index} className="relative">
                      <div
                        className={`grid grid-cols-12 gap-4 mb-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-blue-50/30 transition-all relative ${dropdownOpen === index ? 'z-60' : ''
                          }`}
                      >
                        {/* Product/Service Column */}
                        <div className="col-span-5 relative">
                          <button
                            data-index={index}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/80 hover:bg-white flex items-center justify-between text-left transition-all duration-300"
                            onClick={() => toggleDropdown(index)}
                          >
                            <div className="flex items-center truncate">
                              <MessageSquare size={16} className="text-gray-400 mr-2 shrink-0" />
                              <span className="text-gray-800 font-medium truncate">
                                {item.name || "New Product/Service"}
                              </span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`text-gray-400 transition-transform duration-300 ${dropdownOpen === index ? 'rotate-180' : ''
                                }`}
                            />
                          </button>
                          
                          {/* Description (if exists) */}
                          {item.description && (
                            <div className="mt-2 text-sm text-gray-600">
                              {item.description}
                            </div>
                          )}
                        </div>

                        {/* Quantity Column */}
                        <div className="col-span-2">
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                            className="rounded-xl text-center"
                          />
                        </div>

                        {/* Unit Price Column */}
                        <div className="col-span-2">
                          <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                              <span className="fw-bold text-gray-600">
                                {currency.symbol || currency.value}
                              </span>
                            </InputGroup.Text>
                            <Form.Control
                              type="number"
                              placeholder="0.00"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, "price", e.target.value)}
                              min="0"
                              step="0.01"
                              className="border-start-0 rounded-e-2xl text-center"
                            />
                          </InputGroup>
                        </div>

                        {/* VAT Type Column */}
                        <div className="col-span-2">
                          <Badge
                            bg={getVatBadgeVariant(item.vatType)}
                            className="w-full justify-center py-2 rounded-xl cursor-pointer"
                            onClick={() => handleProductSettings(index)}
                          >
                            {item.vatType === "reverse" ? "🔄 Reverse" : `VAT ${item.vatRate}%`}
                          </Badge>
                        </div>

                        {/* Line Total Column */}
                        <div className="col-span-1 flex flex-col items-center justify-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {currency.symbol || currency.value} {lineTotal.toFixed(2)}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-lg border-0 bg-white shadow-sm hover:shadow-md p-1"
                              onClick={() => handleProductSettings(index)}
                              title="Product settings"
                            >
                              <Settings size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="rounded-lg border-0 bg-white shadow-sm hover:shadow-md p-1"
                              onClick={() => handleRemoveItem(index)}
                              title="Remove item"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Service Dropdown Modal */}
                      {dropdownOpen === index && (
                        <>
                          <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-9998 animate-fadeIn"
                            onClick={() => {
                              setDropdownOpen(null);
                              setServiceSearchTerm("");
                            }}
                          />
                          
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
                                    setCurrentItemIndex(index);
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
                                        const isSelected = item.name === service.title;
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
                                              selectService(service, index);
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

                                <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
                                  <button
                                    className="w-full p-3 rounded-xl text-blue-600 font-semibold border border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition-all duration-300 flex items-center justify-center"
                                    onClick={() => {
                                      setCurrentItemIndex(index);
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Item Button */}
            <Button
              variant="outline-primary"
              className="d-flex align-items-center gap-2 mt-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
              onClick={handleAddItem}
            >
              <PlusCircle size={20} />
              Add Product / Service
            </Button>
          </Card.Body>

          {/* Footer Totals */}
          <Card.Footer className="bg-gray-50 border-0 py-6 px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-5 min-w-80 flex-1">
                <h6 className="fw-bold text-gray-700 mb-4 flex items-center gap-2">
                  💰 Payment Summary
                  {isSaving && (
                    <span className="text-warning text-sm fw-normal flex items-center gap-1">
                      <Spinner animation="border" size="sm" />
                      Saving...
                    </span>
                  )}
                </h6>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Net total</span>
                    <span className="fw-semibold">
                      {currency.symbol || currency.value} {netTotal.toFixed(2)}
                    </span>
                  </div>
                  {rutDiscountTotal > 0 && (
                    <div className="flex justify-between items-center text-success">
                      <span className="flex items-center gap-1">
                        <TrendingDown size={14} />
                        RUT Discount
                      </span>
                      <span className="fw-semibold">
                        -{currency.symbol || currency.value}{" "}
                        {rutDiscountTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {rotDiscountTotal > 0 && (
                    <div className="flex justify-between items-center text-success">
                      <span className="flex items-center gap-1">
                        <TrendingDown size={14} />
                        ROT Discount
                      </span>
                      <span className="fw-semibold">
                        -{currency.symbol || currency.value}{" "}
                        {rotDiscountTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {vatTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">VAT</span>
                      <span className="fw-semibold">
                        {currency.symbol || currency.value} {vatTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {envTaxTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Environment Tax ({globalEnvTaxRate}%)</span>
                      <span className="fw-semibold">
                        {currency.symbol || currency.value} {envTaxTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rounding</span>
                    <span className="fw-semibold">
                      {currency.symbol || currency.value} {rounding.toFixed(2)}
                    </span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between items-center fw-bold fs-5">
                    <span>Total Amount</span>
                    <span className="text-success">
                      {currency.symbol || currency.value} {total.toFixed(2)}
                    </span>
                  </div>
                  {items.some((item) => item.vatType === "reverse") && (
                    <Alert variant="info" className="mt-3 small rounded-xl">
                      <strong>Reverse Charge Applied:</strong> VAT to be paid
                      directly to tax authority
                    </Alert>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className={`text-sm ${getSaveStatusColor()}`}>
                  <span className="fw-medium">{getSaveStatusIcon()} {getSaveStatusText()}</span>
                </div>
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
              </div>
            </div>
          </Card.Footer>
        </Card>

        {/* Settings Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
          style={{ zIndex: 10000 }}
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">⚙️ Product Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            {items[currentItemIndex] && (
              <Form>
                <div className="row g-4">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Product Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={items[currentItemIndex].name}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Enter product name"
                        className="rounded-xl"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={items[currentItemIndex].quantity}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="rounded-xl"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={items[currentItemIndex].description}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Product description"
                        className="rounded-xl"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Price</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="rounded-s-xl">
                          {currency.symbol || currency.value}
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={items[currentItemIndex].price}
                          onChange={(e) =>
                            handleItemChange(
                              currentItemIndex,
                              "price",
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
                      <Form.Label className="fw-semibold">
                        VAT Rate
                      </Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].vatRate}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "vatRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
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
                      <Form.Label className="fw-semibold">
                        Environment Tax (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.1"
                        value={items[currentItemIndex].envTaxRate}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "envTaxRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold flex items-center gap-1">
                        <TrendingDown size={14} className="me-1" />
                        RUT Discount (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={items[currentItemIndex].rutDiscount}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "rutDiscount",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold flex items-center gap-1">
                        <TrendingDown size={14} className="me-1" />
                        ROT Discount (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={items[currentItemIndex].rotDiscount}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "rotDiscount",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-xl"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold">VAT Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].vatType}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "vatType",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
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
                      <Form.Label className="fw-semibold">RUT Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].rutType}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "rutType",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
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
                      <Form.Label className="fw-semibold">ROT Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].rotType}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "rotType",
                            e.target.value
                          )
                        }
                        className="rounded-xl"
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
                      <Form.Label className="fw-semibold">Env Tax Type</Form.Label>
                      <Form.Select
                        value={items[currentItemIndex].envType}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "envType",
                            e.target.value
                          )
                        }
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
                  
                  <div className="col-12">
                    <div className="bg-linear-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                      <h6 className="fw-bold mb-3">📊 Calculation Preview</h6>
                      <div className="row small text-gray-700">
                        <div className="col-md-3 mb-2">
                          <div>Subtotal:</div>
                          <div className="fw-semibold">
                            {currency.symbol || currency.value}{" "}
                            {calculateItemTotals(
                              items[currentItemIndex]
                            ).subtotal.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div>RUT Discount:</div>
                          <div className="fw-semibold text-success">
                            -{currency.symbol || currency.value}{" "}
                            {calculateItemTotals(
                              items[currentItemIndex]
                            ).rutDiscountAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div>ROT Discount:</div>
                          <div className="fw-semibold text-success">
                            -{currency.symbol || currency.value}{" "}
                            {calculateItemTotals(
                              items[currentItemIndex]
                            ).rotDiscountAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div>Environment Tax:</div>
                          <div className="fw-semibold text-warning">
                            {currency.symbol || currency.value}{" "}
                            {calculateItemTotals(
                              items[currentItemIndex]
                            ).envTaxAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div>VAT ({items[currentItemIndex].vatRate}%):</div>
                          <div className="fw-semibold">
                            {currency.symbol || currency.value}{" "}
                            {calculateItemTotals(
                              items[currentItemIndex]
                            ).vatAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div>Total:</div>
                          <div className="fw-bold fs-6 text-success">
                            {currency.symbol || currency.value}{" "}
                            {calculateItemTotals(
                              items[currentItemIndex]
                            ).total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="outline-secondary"
              onClick={() => setShowModal(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              className="rounded-xl"
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add New Service Modal */}
        {showAddServiceModal && (
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
          .item-row {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            position: relative;
            overflow: visible !important;
          }
        
          .item-row:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.08);
            border-color: #c7d2fe !important;
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
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .grid-cols-12 {
              display: flex !important;
              flex-direction: column !important;
              gap: 1rem !important;
            }
          
            .col-span-5, .col-span-2, .col-span-1 {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error('Rendering error:', error);
    setHasError(true);
    return null;
  }
};

export default PricingAndServices;