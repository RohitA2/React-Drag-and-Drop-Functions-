import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import Select from "react-select";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import { useDispatch, useSelector } from "react-redux";
import { createPricingBlock } from "../../store/pricingSlice";
import { selectedUserId } from "../../store/authSlice";

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
  globalVatRate = 20,
  globalVatType = "exclusive",
  globalRutDiscount = 0,
  globalRutType = "apply",
  globalRotDiscount = 0,
  globalRotType = "apply",
  globalEnvTaxRate = 0,
  globalEnvType = "exclusive",
}) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);

  const [showModal, setShowModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const currency = pkg.currency || currencyOptions[0];

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
    setCurrentItemIndex(itemIndex);
    setShowModal(true);
  };

  const handleSaveSettings = () => {
    setShowModal(false);
  };

  const handleSave = () => {
    dispatch(
      createPricingBlock({
        blockId: `${blockId}-package-${index}`,
        userId,
        parentId,
        title: pkg.name,
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
      })
    );
  };

  const getVatBadgeVariant = (vatType) => {
    const option = vatOptions.find((opt) => opt.value === vatType);
    return option?.badge || "secondary";
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
        <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 py-3 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-indigo-600" />
              <span className="fw-semibold text-gray-700">
                Selectable package
              </span>
            </div>

            <div className="flex items-center gap-2">
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

          {/* Items List - Single Line Layout */}
          {pkg.items.map((item, idx) => (
            <div
              key={idx}
              className="item-row mb-3 p-3 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-blue-50/30 transition-all"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 0.5fr",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {/* Product Name */}
              <div className="w-full">
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 ps-3 rounded-s-xl">
                    <Settings size={14} className="text-gray-400" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Product / Service name"
                    value={item.name}
                    onChange={(e) => setItem(idx, "name", e.target.value)}
                    className="rounded-e-2xl border-start-0"
                  />
                </InputGroup>
              </div>

              {/* Price */}
              <div className="w-full">
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <span className="fw-bold text-gray-600 text-sm">
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
                    className="border-start-0 rounded-e-2xl text-sm"
                  />
                </InputGroup>
              </div>

              {/* VAT Badge */}
              <div className="w-full text-center">
                <Badge
                  bg={getVatBadgeVariant(item.vatType || globalVatType)}
                  className="w-full justify-center py-1 rounded-xl text-xs"
                >
                  {(item.vatType || globalVatType) === "reverse"
                    ? "🔄 RUT"
                    : `VAT ${item.tax || globalVatRate}%`}
                </Badge>
              </div>

              {/* Actions */}
              <div className="w-full flex justify-end gap-1">
                <Button
                  variant="outline-primary"
                  className="rounded-xl border-0 bg-white shadow-sm"
                  onClick={() => handleProductSettings(idx)}
                  title="Product settings"
                  size="sm"
                >
                  <Settings size={14} />
                </Button>
                <Button
                  variant="outline-danger"
                  className="rounded-xl border-0 bg-white shadow-sm"
                  onClick={() => removeItem(idx)}
                  title="Remove item"
                  size="sm"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-2 mt-3 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
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
                <span className="text-gray-600">VAT ({globalVatRate}%)</span>
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

          {/* Save Button */}
          <div className="mt-4 text-end">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-2xl fw-semibold shadow-lg"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "💾 Save Package"
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Settings Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold small">
            ⚙️ Product Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {pkg.items[currentItemIndex] && (
            <Form>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Product Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={pkg.items[currentItemIndex].name}
                      onChange={(e) =>
                        setItem(currentItemIndex, "name", e.target.value)
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
                      value={pkg.items[currentItemIndex].quantity || 1}
                      onChange={(e) =>
                        setItem(
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
                    <Form.Label className="fw-semibold small">
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={pkg.items[currentItemIndex].description || ""}
                      onChange={(e) =>
                        setItem(currentItemIndex, "description", e.target.value)
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
                        value={pkg.items[currentItemIndex].price}
                        onChange={(e) =>
                          setItem(currentItemIndex, "price", e.target.value)
                        }
                        className="rounded-e-xl"
                      />
                    </InputGroup>
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Tax Rate (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.1"
                      value={pkg.items[currentItemIndex].tax || globalVatRate}
                      onChange={(e) =>
                        setItem(
                          currentItemIndex,
                          "tax",
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
                      RUT Discount (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={
                        pkg.items[currentItemIndex].rutDiscount ||
                        globalRutDiscount
                      }
                      onChange={(e) =>
                        setItem(
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
                        pkg.items[currentItemIndex].rotDiscount || globalRotDiscount
                      }
                      onChange={(e) =>
                        setItem(
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
                    <Form.Label className="fw-semibold small">
                      Env Tax Rate (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={
                        pkg.items[currentItemIndex].envTaxRate ||
                        globalEnvTaxRate
                      }
                      onChange={(e) =>
                        setItem(
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
                    <Form.Label className="fw-semibold small">
                      VAT Type
                    </Form.Label>
                    <Form.Select
                      value={
                        pkg.items[currentItemIndex].vatType || globalVatType
                      }
                      onChange={(e) =>
                        setItem(currentItemIndex, "vatType", e.target.value)
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
                        pkg.items[currentItemIndex].rutType || globalRutType
                      }
                      onChange={(e) =>
                        setItem(currentItemIndex, "rutType", e.target.value)
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
                        pkg.items[currentItemIndex].rotType || globalRotType
                      }
                      onChange={(e) =>
                        setItem(currentItemIndex, "rotType", e.target.value)
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
                        pkg.items[currentItemIndex].envType || globalEnvType
                      }
                      onChange={(e) =>
                        setItem(currentItemIndex, "envType", e.target.value)
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
            onClick={() => setShowModal(false)}
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
  const [packages, setPackages] = useState([
    {
      name: "Option A",
      richContent: "<p>Premium service package with comprehensive features</p>",
      pricing: "fixed",
      currency: currencyOptions[0],
      items: [
        {
          name: "Consultation Service",
          price: 1000,
          description: "Initial consultation and planning",
          quantity: 1,
          tax: 20,
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
      name: "Option B",
      richContent: "<p>Advanced package with extended support and features</p>",
      pricing: "approximate",
      currency: currencyOptions[0],
      items: [
        {
          name: "Advanced Implementation",
          price: 2500,
          description: "Full implementation with training",
          quantity: 1,
          tax: 20,
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

  const [globalVatRate, setGlobalVatRate] = useState(20);
  const [globalVatType, setGlobalVatType] = useState("exclusive");
  const [globalRutDiscount, setGlobalRutDiscount] = useState(0);
  const [globalRutType, setGlobalRutType] = useState("apply");
  const [globalRotDiscount, setGlobalRotDiscount] = useState(0);
  const [globalRotType, setGlobalRotType] = useState("apply");
  const [globalEnvTaxRate, setGlobalEnvTaxRate] = useState(0);
  const [globalEnvType, setGlobalEnvType] = useState("exclusive");

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
      className="container p-6 bg-gradient-to-br from-gray-50 to-white"
      style={{ maxWidth: "1400px" }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">Scope of Work</h2>
        </div>

        {/* Global Settings Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle
            as="div"
            className="btn p-3 rounded-2xl border-0 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Settings size={20} className="text-gray-600" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="rounded-2xl shadow-lg border-0 p-3 min-w-80">
            <Dropdown.Header className="fw-bold text-gray-700">
              Global Settings
            </Dropdown.Header>
            <div className="px-2 py-3 space-y-4">
              <Form.Group>
                <Form.Label className="small fw-semibold text-gray-700">
                  💸 Global VAT Rate (%)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={globalVatRate}
                  onChange={(e) => setGlobalVatRate(parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                  size="sm"
                  className="rounded-xl"
                />
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
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 0.5fr;
          gap: 1rem;
          align-items: center;
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

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .item-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .item-row div {
            width: 100% !important;
            margin-bottom: 0.5rem;
          }
          .item-row .flex {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default PricingAndServices2;