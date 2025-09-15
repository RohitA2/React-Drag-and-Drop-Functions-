import React, { useState } from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import { X, MoreVertical, PlusCircle } from "lucide-react";
import Select from "react-select";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import { useDispatch, useSelector } from "react-redux";
import { createPricingBlock } from "../../store/pricingSlice";
import { selectedUserId } from "../../store/authSlice";

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "AFN", label: "AFN" },
  { value: "INR", label: "INR" },
  { value: "JPY", label: "JPY" },
  { value: "GBP", label: "GBP" },
];

const pricingOptions = [
  "Fixed price",
  "Approximate price",
  "Open account",
  "Open account with max price",
];

const PricingAndServices = ({ blockId, parentId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);

  const [title, setTitle] = useState("Scope of Work");
  const [packageName, setPackageName] = useState("Package name");
  const [currency, setCurrency] = useState(currencyOptions[0]); // Default: USD
  const [pricingType, setPricingType] = useState(pricingOptions[1]); // Approximate price
  const [showPricingDropdown, setShowPricingDropdown] = useState(false);
  const [packageDescription, setPackageDescription] = useState(
    "Package description"
  );
  const [items, setItems] = useState([{ name: "Sample product", price: 1000 }]);

  console.log("i am from pricing block ids", blockId, parentId);
  

  // ---- Handlers ----
  const handleAddItem = () => {
    setItems([...items, { name: "", price: "" }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // ---- Totals ----
  const netTotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );
  const vat = 0;
  const rounding = 0;
  const total = netTotal + vat + rounding;

  // ---- Save ----
  const handleSaveBlock = () => {
    dispatch(
      createPricingBlock({
        blockId,
        userId,
        parentId,
        title,
        packageName,
        packageDescription,
        currency: currency.value,
        pricingType,
        netTotal,
        vat,
        rounding,
        total,
        items,
      })
    );
  };

  return (
    <div
      className="container p-4 bg-white shadow"
      style={{ maxWidth: "1800px" }}
    >
      {/* Editable Title */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="fs-2 fw-bold border-0 bg-transparent text-black"
          style={{ outline: "none", boxShadow: "none", flex: 1 }}
        />

        {/* Dropdown (3 dots) */}
        <Dropdown align="end">
          <Dropdown.Toggle
            as="div"
            className="btn btn-link p-0 border-0"
            style={{ cursor: "pointer" }}
          >
            <MoreVertical size={20} className="text-muted" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>Change package options</Dropdown.Item>
            <Dropdown.Item as="div">
              <Form.Check
                type="switch"
                id="hide-summary"
                label="Hide summary for block"
              />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3 px-4 border-0">
          <span className="fw-semibold text-secondary">Single option</span>
        </Card.Header>

        <Card.Body className="px-4">
          {/* Package Name */}
          <Form.Control
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="fs-5 fw-semibold border-0 bg-transparent px-0 mb-2"
            style={{ outline: "none", boxShadow: "none" }}
          />

          {/* Package Description */}
          <EditableQuill
            id="packageDescription"
            value={packageDescription}
            onChange={setPackageDescription}
            className="text-muted border-0 px-0 mb-4 bg-transparent fs-6 fw-semibold"
            minRows={2}
          />

          {/* Pricing Type */}
          <div className="d-flex justify-content-end position-relative mb-2">
            <div
              className="border rounded px-2 py-1 bg-light text-muted small fw-semibold"
              style={{ cursor: "pointer", minWidth: "200px" }}
              onClick={() => setShowPricingDropdown(!showPricingDropdown)}
            >
              Pricing: <span className="text-primary">{pricingType}</span>
            </div>

            {showPricingDropdown && (
              <div className="pricing-dropdown-menu">
                {pricingOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setPricingType(option);
                      setShowPricingDropdown(false);
                    }}
                    className={`px-3 py-2 small ${
                      pricingType === option
                        ? "bg-primary text-white"
                        : "text-muted bg-white"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          {items.map((item, index) => (
            <InputGroup className="mb-2" key={index}>
              <Form.Control
                type="text"
                placeholder="Product / Service"
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
                className="rounded-start-3"
              />
              <Form.Control
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  handleItemChange(index, "price", e.target.value)
                }
              />
              <InputGroup.Text className="p-0 border-0 bg-transparent">
                <div style={{ minWidth: 80 }}>
                  <Select
                    options={currencyOptions}
                    value={currency}
                    onChange={setCurrency}
                    isSearchable
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "none",
                        backgroundColor: "#f8f9fa",
                        fontWeight: "bold",
                        minHeight: "38px",
                        boxShadow: "none",
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: 4,
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    components={{ IndicatorSeparator: null }}
                  />
                </div>
              </InputGroup.Text>

              <Button
                variant="outline-light"
                onClick={() => handleRemoveItem(index)}
                className="border-0"
              >
                <X size={18} className="text-danger" />
              </Button>
            </InputGroup>
          ))}

          {/* Add item button */}
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-2 mt-2"
            onClick={handleAddItem}
          >
            <PlusCircle size={18} />
            Add Product / Service
          </Button>
        </Card.Body>

        {/* Footer Totals */}
        <Card.Footer className="bg-white border-0 py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div
              className="p-3 rounded-3 shadow-sm bg-light"
              style={{ minWidth: "260px" }}
            >
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Net total</span>
                <span>
                  {currency.value} {netTotal.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">VAT</span>
                <span>
                  {currency.value} {vat.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Rounding</span>
                <span>
                  {currency.value} {rounding.toFixed(2)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold fs-6">
                <span>Total incl. VAT</span>
                <span className="text-success">
                  {currency.value} {total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="success"
              onClick={handleSaveBlock}
              disabled={loading}
              className="ms-3"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                "Save "
              )}
            </Button>
          </div>
        </Card.Footer>
      </Card>

      <style>{`
        .pricing-dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
          z-index: 1000;
          min-width: 220px;
        }
      `}</style>
    </div>
  );
};

export default PricingAndServices;
