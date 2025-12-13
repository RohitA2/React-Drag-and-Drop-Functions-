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
  MoreVertical,
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

const pricingOptions = [
  { value: "fixed", label: "Fixed price", icon: "💎" },
  { value: "approximate", label: "Approximate price", icon: "🔮" },
  { value: "open", label: "Open account", icon: "📊" },
  { value: "open_max", label: "Open account with max price", icon: "💰" },
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

const PackageCard = ({
  pkg,
  index,
  onChange,
  onRemove,
  blockId,
  parentId,
  overallTitle,
  globalVatRate = 25,
  globalVatType = "exclusive",
  globalRutDiscount = 0,
  globalRutType = "apply",
  globalRotDiscount = 0,
  globalRotType = "apply",
  globalEnvTaxRate = 0,
  globalEnvType = "exclusive",
  // Service Management Props
  allServices = [],
  loadingServices = false,
  fetchServices,
  onOpenAddServiceModal,
  onSelectService,
  dropdownOpen,
  setDropdownOpen,
  serviceSearchTerm,
  setServiceSearchTerm,
  currentItemIndex,
  setCurrentItemIndex,
  currentPackageIndex,
  setCurrentPackageIndex,
}) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentSettingsItemIndex, setCurrentSettingsItemIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");
  
  // Refs for auto-save
  const lastSaveDataRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const currency = pkg.currency || currencyOptions[0];

  // Filter services based on search term
  const filteredServices = useMemo(() =>
    allServices.filter(service => {
      if (!service || !service.title) return false;
      if (!serviceSearchTerm.trim()) return true;
      const searchLower = serviceSearchTerm.toLowerCase();
      const title = (service.title || "").toLowerCase();
      const description = (service.description || "").toLowerCase();
      return title.includes(searchLower) || description.includes(searchLower);
    }),
    [allServices, serviceSearchTerm]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen !== null && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const toggleButton = document.querySelector(`button[data-index="${dropdownOpen}"][data-package="${currentPackageIndex}"]`);
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
  }, [dropdownOpen, currentPackageIndex]);

  const toggleDropdown = (itemIndex) => {
    const dropdownKey = `${currentPackageIndex}-${itemIndex}`;
    if (dropdownOpen === dropdownKey) {
      setDropdownOpen(null);
      setServiceSearchTerm("");
    } else {
      setDropdownOpen(dropdownKey);
      setServiceSearchTerm("");
    }
  };

  const selectService = (service, itemIndex) => {
    if (!service || !service.title) {
      console.error('Invalid service object:', service);
      toast.error("Cannot select service - invalid data");
      return;
    }
    
    const newItems = [...pkg.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      name: service.title,
      description: service.description || service.content || "",
      price: service.price || 0,
      tax: service.vat_rate || globalVatRate,
    };
    
    onChange({ ...pkg, items: newItems });
    setDropdownOpen(null);
    setServiceSearchTerm("");
  };

  // Enhanced calculation with VAT, RUT, ROT, and Environment Tax
  const calculateItemTotals = (item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const vatRate = parseFloat(item.tax) || globalVatRate;
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
    if (rutType === "apply" && rutDiscount > 0) {
      rutDiscountAmount = subtotal * (rutDiscount / 100);
      total -= rutDiscountAmount;
    }
    
    const rotType = item.rotType || globalRotType;
    if (rotType === "apply" && rotDiscount > 0) {
      rotDiscountAmount = total * (rotDiscount / 100);
      total -= rotDiscountAmount;
    }
    
    const envType = item.envType || globalEnvType;
    let envBase = total;
    if (envType === "none") {
      envTaxAmount = 0;
    } else if (envType === "exclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
      total += envTaxAmount;
    } else if (envType === "inclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
    }
    
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
    () => pkg.items.map((item) => calculateItemTotals(item)),
    [
      pkg.items,
      globalVatRate,
      globalVatType,
      globalRutDiscount,
      globalRutType,
      globalRotDiscount,
      globalRotType,
      globalEnvTaxRate,
      globalEnvType,
    ]
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
  const total =
    netTotal + vatTotal + envTaxTotal + rounding - rutDiscountTotal - rotDiscountTotal;

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (isSaving) return;
    
    const currentData = {
      blockId: `${blockId}-package-${index}`,
      userId,
      parentId,
      title: overallTitle,
      packageName: pkg.name,
      packageDescription: pkg.richContent,
      currency: currency.value,
      pricingType: pkg.pricing,
      netTotal,
      vat: vatTotal,
      rutDiscount: rutDiscountTotal,
      rotDiscount: rotDiscountTotal,
      envTax: envTaxTotal,
      rounding,
      total,
      items: pkg.items.map((item, idx) => ({
        ...item,
        ...itemTotals[idx],
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
  }, [
    dispatch,
    blockId,
    index,
    userId,
    parentId,
    overallTitle,
    pkg.name,
    pkg.richContent,
    pkg.pricing,
    currency,
    pkg.items,
    netTotal,
    vatTotal,
    rutDiscountTotal,
    rotDiscountTotal,
    envTaxTotal,
    total,
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
  ]);

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
  }, [pkg, overallTitle, autoSave]);

  // Initialize last saved data on mount
  useEffect(() => {
    const currentData = {
      blockId: `${blockId}-package-${index}`,
      userId,
      parentId,
      title: overallTitle,
      packageName: pkg.name,
      packageDescription: pkg.richContent,
      currency: currency.value,
      pricingType: pkg.pricing,
      netTotal,
      vat: vatTotal,
      rutDiscount: rutDiscountTotal,
      rotDiscount: rotDiscountTotal,
      envTax: envTaxTotal,
      rounding,
      total,
      items: pkg.items.map((item, idx) => ({
        ...item,
        ...itemTotals[idx],
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

  const setItem = (idx, key, val) => {
    const items = [...pkg.items];
    items[idx] = { ...items[idx], [key]: val };
    onChange({ ...pkg, items });
  };

  const addItem = () =>
    onChange({
      ...pkg,
      items: [
        ...pkg.items,
        {
          name: "",
          price: "",
          description: "",
          quantity: 1,
          tax: globalVatRate,
          vatType: globalVatType,
          rutDiscount: globalRutDiscount,
          rutType: globalRutType,
          rotDiscount: globalRotDiscount,
          rotType: globalRotType,
          envTaxRate: globalEnvTaxRate,
          envType: globalEnvType,
        },
      ],
    });

  const removeItem = (idx) =>
    onChange({ ...pkg, items: pkg.items.filter((_, i) => i !== idx) });

  const handleProductSettings = (itemIndex) => {
    setCurrentSettingsItemIndex(itemIndex);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    setShowSettingsModal(false);
  };

  const handleManualSave = () => {
    autoSave();
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

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? "2px solid #6366f1" : "1px solid #e2e8f0",
      borderRadius: "12px",
      minWidth: "100px",
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
      padding: "8px 12px",
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
          ? "#f8fafc"
          : "white",
      color: state.isSelected ? "white" : "inherit",
    }),
  };

  return (
    <>
      <Card className="container p-6 bg-white shadow-xl border border-gray-200 mb-6">
        <Card.Header className="bg-linear-to-r from-blue-50 to-indigo-50 border-0 py-3 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-indigo-600" />
              <span className="fw-semibold text-gray-700">
                Selectable package
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Save Status */}
              <div className={`text-xs ${getSaveStatusColor()} me-2`}>
                <span className="fw-medium">{getSaveStatusIcon()} {getSaveStatusText()}</span>
              </div>
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  className="border-0 bg-white shadow-sm rounded-2xl px-3"
                >
                  {pkg.pricing === "fixed"
                    ? "Fixed price"
                    : "Approximate price"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="rounded-2xl shadow-lg border-0">
                  <Dropdown.Item
                    onClick={() => onChange({ ...pkg, pricing: "fixed" })}
                  >
                    Fixed price
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => onChange({ ...pkg, pricing: "approximate" })}
                  >
                    Approximate price
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => onChange({ ...pkg, pricing: "open" })}
                  >
                    Open account
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => onChange({ ...pkg, pricing: "open_max" })}
                  >
                    Open account with max price
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button
                variant="outline-danger"
                className="rounded-2xl border-0 bg-white shadow-sm"
                onClick={onRemove}
                title="Remove Package"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-6">
          {/* Package Header */}
          <div className="mb-4">
            <Form.Control
              type="text"
              value={pkg.name}
              onChange={(e) => onChange({ ...pkg, name: e.target.value })}
              className="text-xl fw-bold border-0 bg-transparent px-0 mb-2 text-gray-900"
              placeholder="Package name"
              style={{ outline: "none", boxShadow: "none" }}
            />
            <EditableQuill
              id={`pkg-${index}-desc`}
              value={pkg.richContent}
              onChange={(v) => onChange({ ...pkg, richContent: v })}
              className="text-gray-600 border-0 px-0 bg-transparent small"
              placeholder="Describe what's included in this package"
            />
          </div>

          {/* Table-like structure matching the image */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Headers */}
              <div className="grid grid-cols-12 gap-4 mb-3 px-2 text-sm font-semibold text-gray-700 border-b pb-2">
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
                  Actions
                </div>
              </div>

              {/* Items List */}
              {pkg.items.map((item, idx) => {
                const dropdownKey = `${currentPackageIndex}-${idx}`;
                const isDropdownOpen = dropdownOpen === dropdownKey;
                
                return (
                  <React.Fragment key={idx}>
                    <div
                      className={`grid grid-cols-12 gap-4 mb-3 p-3 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-blue-50/30 transition-all relative ${isDropdownOpen ? 'z-50' : ''}`}
                    >
                      {/* Product/Service Column */}
                      <div className="col-span-5 relative">
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Service Template</label>
                        <button
                          data-index={dropdownKey}
                          data-package={currentPackageIndex}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/80 hover:bg-white flex items-center justify-between text-left transition-all duration-300 text-sm"
                          onClick={() => toggleDropdown(idx)}
                        >
                          <div className="flex items-center truncate">
                            <MessageSquare size={14} className="text-gray-400 mr-2 shrink-0" />
                            <span className="text-gray-700 font-medium truncate">
                              {item.name || "Select service..."}
                            </span>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        
                        {/* Description (if exists) */}
                        {item.description && (
                          <div className="mt-1 text-xs text-gray-500 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>

                      {/* Quantity Column */}
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Quantity</label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => setItem(idx, "quantity", parseInt(e.target.value) || 1)}
                          className="rounded-xl text-center"
                          size="sm"
                        />
                      </div>

                      {/* Unit Price Column */}
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Price</label>
                        <InputGroup size="sm">
                          <InputGroup.Text className="bg-white border-end-0">
                            <span className="fw-bold text-gray-600 text-xs">
                              {currency.symbol || currency.value}
                            </span>
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            placeholder="0.00"
                            value={item.price}
                            onChange={(e) => setItem(idx, "price", e.target.value)}
                            min="0"
                            step="0.01"
                            className="border-start-0 rounded-e-2xl text-sm text-center"
                          />
                        </InputGroup>
                      </div>

                      {/* VAT Type Column */}
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1 font-medium">VAT</label>
                        <Badge
                          bg={getVatBadgeVariant(item.vatType || globalVatType)}
                          className="w-full justify-center py-1 rounded-xl text-xs cursor-pointer"
                          onClick={() => handleProductSettings(idx)}
                        >
                          {(item.vatType || globalVatType) === "reverse"
                            ? "🔄 RUT"
                            : `VAT ${item.tax || globalVatRate}%`}
                        </Badge>
                      </div>

                      {/* Actions Column */}
                      <div className="col-span-1 flex items-center justify-center gap-1">
                        <Button
                          variant="outline-primary"
                          className="rounded-xl border-0 bg-white shadow-sm p-1"
                          onClick={() => handleProductSettings(idx)}
                          title="Product settings"
                          size="sm"
                        >
                          <Settings size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          className="rounded-xl border-0 bg-white shadow-sm p-1"
                          onClick={() => removeItem(idx)}
                          title="Remove item"
                          size="sm"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Service Dropdown Modal */}
                    {isDropdownOpen && (
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
                                  setCurrentItemIndex(idx);
                                  setCurrentPackageIndex(index);
                                  onOpenAddServiceModal();
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
                                            selectService(service, idx);
                                          }}
                                          onMouseDown={(e) => e.preventDefault()}
                                        >
                                          <div className="flex items-start min-w-0 flex-1">
                                            <MessageSquare size={12} className="text-blue-500 mt-1 mr-2 shrink-0" />
                                            <div className="truncate min-w-0 flex-1">
                                              <div className="font-semibold truncate text-gray-800 text-sm">
                                                {service.title || "Untitled Service"}
                                              </div>
                                              {(service.description || service.content) && (
                                                <small className="text-gray-500 truncate block text-xs">
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
                                  className="w-full p-3 rounded-xl text-blue-600 font-semibold border border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition-all duration-300 flex items-center justify-center text-sm"
                                  onClick={() => {
                                    setCurrentItemIndex(idx);
                                    setCurrentPackageIndex(index);
                                    onOpenAddServiceModal();
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
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Add Item Button */}
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-2 mt-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
            onClick={addItem}
            size="sm"
          >
            <PlusCircle size={16} />
            Add Product / Service
          </Button>

          {/* Totals */}
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
            <h6 className="fw-bold text-gray-700 mb-3 small">
              💰 Payment Summary
              {isSaving && (
                <span className="text-warning text-xs fw-normal flex items-center gap-1 ms-2">
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
                <span className="text-gray-600">VAT</span>
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
              <div className="flex justify-between items-center fw-bold">
                <span>Total Amount</span>
                <span className="text-success">
                  {currency.symbol} {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Manual Save Button (optional) */}
          {saveStatus === "error" && (
            <div className="mt-3 text-center">
              <Button
                variant="outline-danger"
                onClick={handleManualSave}
                className="rounded-xl"
                size="sm"
              >
                Retry Save
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Settings Modal */}
      <Modal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold small">
            ⚙️ Product Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {pkg.items[currentSettingsItemIndex] && (
            <Form>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Product Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={pkg.items[currentSettingsItemIndex].name}
                      onChange={(e) =>
                        setItem(currentSettingsItemIndex, "name", e.target.value)
                      }
                      className="rounded-xl"
                      size="sm"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Quantity
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={pkg.items[currentSettingsItemIndex].quantity || 1}
                      onChange={(e) =>
                        setItem(
                          currentSettingsItemIndex,
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
                    <Form.Label className="fw-semibold small">
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={pkg.items[currentSettingsItemIndex].description || ""}
                      onChange={(e) =>
                        setItem(currentSettingsItemIndex, "description", e.target.value)
                      }
                      className="rounded-xl"
                      size="sm"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Price</Form.Label>
                    <InputGroup size="sm">
                      <InputGroup.Text className="rounded-s-xl">
                        {currency.symbol}
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={pkg.items[currentSettingsItemIndex].price}
                        onChange={(e) =>
                          setItem(currentSettingsItemIndex, "price", e.target.value)
                        }
                        className="rounded-e-xl"
                      />
                    </InputGroup>
                  </Form.Group>
                </div>
                {/* Updated: VAT Rate Dropdown */}
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      VAT Rate
                    </Form.Label>
                    <Form.Select
                      value={pkg.items[currentSettingsItemIndex].tax || globalVatRate}
                      onChange={(e) =>
                        setItem(
                          currentSettingsItemIndex,
                          "tax",
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
                        pkg.items[currentSettingsItemIndex].rutDiscount ||
                        globalRutDiscount
                      }
                      onChange={(e) =>
                        setItem(
                          currentSettingsItemIndex,
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
                        pkg.items[currentSettingsItemIndex].rotDiscount || globalRotDiscount
                      }
                      onChange={(e) =>
                        setItem(
                          currentSettingsItemIndex,
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
                    <Form.Label className="fw-semibold small">
                      Env Tax Rate (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={
                        pkg.items[currentSettingsItemIndex].envTaxRate ||
                        globalEnvTaxRate
                      }
                      onChange={(e) =>
                        setItem(
                          currentSettingsItemIndex,
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
                    <Form.Label className="fw-semibold small">
                      VAT Type
                    </Form.Label>
                    <Form.Select
                      value={
                        pkg.items[currentSettingsItemIndex].vatType || globalVatType
                      }
                      onChange={(e) =>
                        setItem(currentSettingsItemIndex, "vatType", e.target.value)
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
                      value={
                        pkg.items[currentSettingsItemIndex].rutType || globalRutType
                      }
                      onChange={(e) =>
                        setItem(currentSettingsItemIndex, "rutType", e.target.value)
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
                      value={
                        pkg.items[currentSettingsItemIndex].rotType || globalRotType
                      }
                      onChange={(e) =>
                        setItem(currentSettingsItemIndex, "rotType", e.target.value)
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
                      value={
                        pkg.items[currentSettingsItemIndex].envType || globalEnvType
                      }
                      onChange={(e) =>
                        setItem(currentSettingsItemIndex, "envType", e.target.value)
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
    </>
  );
};

const PricingAndServices2 = ({ blockId, parentId }) => {
  const [overallTitle, setOverallTitle] = useState("Scope of Work");
  const [packages, setPackages] = useState([
    {
      name: "Product/Service A",
      richContent: "<p>(Description) Premium service package with comprehensive features</p>",
      pricing: "fixed",
      currency: currencyOptions[0],
      items: [
        {
          name: "Consultation Service",
          price: 1000,
          description: "Initial consultation and planning",
          quantity: 1,
          tax: 25,
          vatType: "exclusive",
          rutDiscount: 0,
          rutType: "apply",
          rotDiscount: 0,
          rotType: "apply",
          envTaxRate: 0,
          envType: "exclusive",
        },
      ],
    },
    {
      name: "Product/Service B",
      richContent: "<p>(Description) Advanced package with extended support and features</p>",
      pricing: "approximate",
      currency: currencyOptions[0],
      items: [
        {
          name: "Advanced Implementation",
          price: 2500,
          description: "Full implementation with training",
          quantity: 1,
          tax: 25,
          vatType: "exclusive",
          rutDiscount: 0,
          rutType: "apply",
          rotDiscount: 0,
          rotType: "apply",
          envTaxRate: 0,
          envType: "exclusive",
        },
      ],
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
  const userId = useSelector(selectedUserId);
  const [allServices, setAllServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  
  // New Service Form State
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceVatRate, setNewServiceVatRate] = useState(25);
  const [savingNewService, setSavingNewService] = useState(false);

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

        // Auto-select into the current item if valid indices exist
        if (currentItemIndex !== null && currentPackageIndex !== null) {
          setPackages(prevPackages => {
            const copied = [...prevPackages];
            if (currentPackageIndex < copied.length &&
              currentItemIndex < copied[currentPackageIndex].items.length) {
              copied[currentPackageIndex].items[currentItemIndex] = {
                ...copied[currentPackageIndex].items[currentItemIndex],
                name: formattedService.title,
                description: formattedService.description,
                price: formattedService.price,
                tax: formattedService.vat_rate,
              };
            }
            return copied;
          });
        }

        // Reset form fields
        setNewServiceTitle("");
        setNewServiceDescription("");
        setNewServicePrice("");
        setNewServiceVatRate(25);
        
        toast.success("Service template saved successfully!");
        setShowAddServiceModal(false);
        setCurrentItemIndex(null);
        setCurrentPackageIndex(null);

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

  const updatePackage = (index, newConfig) => {
    const newPackages = [...packages];
    newPackages[index] = newConfig;
    setPackages(newPackages);
  };

  const addPackage = () => {
    const newIndex = packages.length + 1;
    setPackages([
      ...packages,
      {
        name: `Option ${String.fromCharCode(64 + newIndex)}`,
        richContent: "<p>Custom package description</p>",
        pricing: "fixed",
        currency: currencyOptions[0],
        items: [
          {
            name: "",
            price: "",
            description: "",
            quantity: 1,
            tax: globalVatRate,
            vatType: globalVatType,
            rutDiscount: globalRutDiscount,
            rutType: globalRutType,
            rotDiscount: globalRotDiscount,
            rotType: globalRotType,
            envTaxRate: globalEnvTaxRate,
            envType: globalEnvType,
          },
        ],
      },
    ]);
  };

  const removePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  return (
    <div
      className="container p-6 bg-linear-to-br from-gray-50 to-white"
      style={{ maxWidth: "1800px" }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Form.Control
            type="text"
            value={overallTitle}
            onChange={(e) => setOverallTitle(e.target.value)}
            className="text-3xl font-bold text-gray-900 border-0 bg-transparent p-0 focus:ring-0"
            style={{ outline: "none", boxShadow: "none" }}
          />
        </div>
        
        {/* Global Settings Dropdown */}
        <Dropdown align="end">
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
                  onChange={(e) => setGlobalVatRate(parseFloat(e.target.value))}
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
                  onChange={(e) => setGlobalRotDiscount(parseFloat(e.target.value))}
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
                  🌍 Global Env Tax Rate (%)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={globalEnvTaxRate}
                  onChange={(e) =>
                    setGlobalEnvTaxRate(parseFloat(e.target.value))
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
      </div>

      {/* Packages */}
      {packages.map((pkg, idx) => (
        <PackageCard
          key={idx}
          pkg={pkg}
          index={idx}
          blockId={blockId}
          parentId={parentId}
          overallTitle={overallTitle}
          onChange={(newConfig) => updatePackage(idx, newConfig)}
          onRemove={() => removePackage(idx)}
          globalVatRate={globalVatRate}
          globalVatType={globalVatType}
          globalRutDiscount={globalRutDiscount}
          globalRutType={globalRutType}
          globalRotDiscount={globalRotDiscount}
          globalRotType={globalRotType}
          globalEnvTaxRate={globalEnvTaxRate}
          globalEnvType={globalEnvType}
          // Service Management Props
          allServices={allServices}
          loadingServices={loadingServices}
          fetchServices={fetchServices}
          onOpenAddServiceModal={() => setShowAddServiceModal(true)}
          onSelectService={(service, itemIndex) => {
            const newItems = [...pkg.items];
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              name: service.title,
              description: service.description || service.content || "",
              price: service.price || 0,
              tax: service.vat_rate || globalVatRate,
            };
            updatePackage(idx, { ...pkg, items: newItems });
          }}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          serviceSearchTerm={serviceSearchTerm}
          setServiceSearchTerm={setServiceSearchTerm}
          currentItemIndex={currentItemIndex}
          setCurrentItemIndex={setCurrentItemIndex}
          currentPackageIndex={idx}
          setCurrentPackageIndex={setCurrentPackageIndex}
        />
      ))}

      {/* Add Package Button */}
      <Button
        variant="outline-primary"
        className="d-flex align-items-center gap-2 mt-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all w-full py-3"
        onClick={addPackage}
      >
        <PlusCircle size={20} />
        Add New Package Option
      </Button>

      {/* Add New Service Modal */}
      {showAddServiceModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={() => {
              setShowAddServiceModal(false);
              setCurrentItemIndex(null);
              setCurrentPackageIndex(null);
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
                setCurrentPackageIndex(null);
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
                          setCurrentPackageIndex(null);
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
                          setCurrentPackageIndex(null);
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
      
        body, .fw-normal {
          font-family: 'Inter', sans-serif;
        }
      
        .font-bold {
          font-weight: 700;
        }
      
        .fw-semibold {
          font-weight: 600;
        }
        
        /* Enhanced styling */
        .item-row {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
        }
      
        .item-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border-color: #c7d2fe !important;
        }
      
        .form-control:focus, .form-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
        .z-\[50\] {
          z-index: 50 !important;
        }
        
        .z-\[60\] {
          z-index: 60 !important;
        }
        
        .z-\[9998\] {
          z-index: 9998 !important;
        }
        
        .z-\[9999\] {
          z-index: 9999 !important;
        }
        
        /* Auto-save Status */
        .auto-save-status {
          transition: all 0.3s ease;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .grid-cols-12 {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .col-span-5, .col-span-2, .col-span-1 {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PricingAndServices2;