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

const emptyItem = () => ({
  name: "",
  quantity: 1,
  unitPrice: "",
  description: "",
  vatRate: 20,
  vatType: "exclusive",
  rutDiscount: 0,
  rutType: "apply",
  rotDiscount: 0,
  rotType: "apply",
  envTaxRate: 0,
  envType: "exclusive",
});

const PricingAndServices3 = ({ isPreview = false, blockId, parentId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);

  const [title, setTitle] = useState("Scope of Work");
  const [currency, setCurrency] = useState(currencyOptions[0]);
  const [items, setItems] = useState([emptyItem()]);
  const [notes, setNotes] = useState("<p>Add optional notes or terms here.</p>");

  const [globalVatRate, setGlobalVatRate] = useState(20);
  const [globalVatType, setGlobalVatType] = useState("exclusive");
  const [globalRutDiscount, setGlobalRutDiscount] = useState(0);
  const [globalRutType, setGlobalRutType] = useState("apply");
  const [globalRotDiscount, setGlobalRotDiscount] = useState(0);
  const [globalRotType, setGlobalRotType] = useState("apply");
  const [globalEnvTaxRate, setGlobalEnvTaxRate] = useState(0);
  const [globalEnvType, setGlobalEnvType] = useState("exclusive");

  const [showModal, setShowModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const updateItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleProductSettings = (index) => {
    setCurrentItemIndex(index);
    setShowModal(true); // Ensure modal is shown
  };

  const handleSaveSettings = () => {
    setShowModal(false);
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

  const handleSaveBlock = () => {
    dispatch(
      createPricingBlock({
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
    <div
      className={`container p-6 bg-white shadow-xl border border-gray-200 ${
        isPreview ? "pointer-events-none" : ""
      }`}
      style={{ maxWidth: "1800px" }}
    >
      {/* Header Section */}
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
        </div>

        <div className="flex items-center gap-4">
          {/* Global Settings Dropdown */}
          {!isPreview && (
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
                      onChange={(e) =>
                        setGlobalVatRate(parseFloat(e.target.value))
                      }
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
        <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-indigo-600" />
              <span className="fw-semibold text-gray-700">
                Table-based Pricing
              </span>
            </div>
            {!isPreview && (
              <Badge bg="outline-primary" className="py-2 px-3 rounded-xl">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </Badge>
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
                      <div className="d-flex align-items-center gap-2">
                        <Form.Control
                          type="text"
                          placeholder="Product / service"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          readOnly={isPreview}
                          className="rounded-xl border-0 bg-transparent px-0"
                          style={{ outline: "none", boxShadow: "none" }}
                        />
                        {!isPreview && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-xl border-0 bg-transparent"
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

                  {/* Save Button */}
                  {!isPreview && (
                    <Button
                      variant="success"
                      onClick={handleSaveBlock}
                      disabled={loading}
                      className="w-100 mt-3 py-2 rounded-2xl fw-semibold shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        "💾 Save Pricing Block"
                      )}
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
          show={showModal}
          onHide={() => setShowModal(false)}
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
                      <Form.Label className="fw-semibold small">VAT Rate (%)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.1"
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3">
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
      `}</style>
    </div>
  );
};

export default PricingAndServices3;