import React, { useState, useMemo } from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import { ThreeDots, X } from "react-bootstrap-icons";
import Select from "react-select";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import { useDispatch, useSelector } from "react-redux";
import { createPricingBlock } from "../../store/pricingSlice";
import { selectedUserId } from "../../store/authSlice";

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "INR", label: "INR" },
];

const PackageCard = ({ pkg, index, onChange, onRemove, blockId, parentId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);

  const currency = pkg.currency;

  const netTotal = useMemo(
    () => pkg.items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0),
    [pkg.items]
  );
  const vat = 0;
  const rounding = 0;
  const total = netTotal + vat + rounding;

  const setItem = (idx, key, val) => {
    const items = [...pkg.items];
    items[idx] = { ...items[idx], [key]: val };
    onChange({ ...pkg, items });
  };

  const addItem = () =>
    onChange({ ...pkg, items: [...pkg.items, { name: "", price: "" }] });

  const removeItem = (idx) =>
    onChange({ ...pkg, items: pkg.items.filter((_, i) => i !== idx) });

  const handleSave = () => {
    dispatch(
      createPricingBlock({
        blockId,
        userId,
        parentId,
        title: pkg.name,
        packageName: pkg.name,
        packageDescription: pkg.richContent,
        currency: currency.value,
        pricingType: pkg.pricing,
        netTotal,
        vat,
        rounding,
        total,
        items: pkg.items,
      })
    );
  };

  return (
    <Card className="shadow-sm border-0 rounded-3 mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center py-2 px-3 bg-light border-0">
        <div className="small text-muted">Selectable package</div>
        <div className="d-flex align-items-center gap-2">
          <Dropdown>
            <Dropdown.Toggle size="sm" variant="light" className="border">
              Change
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => onChange({ ...pkg, pricing: "approx" })}
              >
                Approximate price
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => onChange({ ...pkg, pricing: "fixed" })}
              >
                Fixed price
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={onRemove}
            title="Remove Package"
          >
            ×
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="pt-3">
        {/* Title */}
        <Form.Control
          type="text"
          value={pkg.name}
          onChange={(e) => onChange({ ...pkg, name: e.target.value })}
          className="fw-semibold fs-6 mb-1 border-0 bg-transparent"
          placeholder="Package name"
        />

        {/* Description */}
        <div className="mb-2 text-muted small">
          <EditableQuill
            id={`pkg-${index}-desc`}
            value={pkg.richContent}
            onChange={(v) => onChange({ ...pkg, richContent: v })}
            placeholder="Describe what's included in this package"
          />
        </div>

        {/* Items */}
        {pkg.items.map((item, idx) => (
          <InputGroup className="mb-2" key={idx}>
            <Form.Control
              type="text"
              placeholder="Product / service"
              value={item.name}
              onChange={(e) => setItem(idx, "name", e.target.value)}
              className="rounded-start-3"
            />
            <Form.Control
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => setItem(idx, "price", e.target.value)}
              min="0"
              step="0.01"
            />
            <InputGroup.Text className="p-0 border-0 bg-transparent">
              <div style={{ minWidth: 80 }}>
                <Select
                  options={currencyOptions}
                  value={currency}
                  onChange={(val) => onChange({ ...pkg, currency: val })}
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: "none",
                      backgroundColor: "#f8f9fa",
                      minHeight: 38,
                      boxShadow: "none",
                      fontWeight: "bold",
                    }),
                    indicatorSeparator: () => ({ display: "none" }),
                    menu: (b) => ({ ...b, zIndex: 9999 }),
                  }}
                  components={{ IndicatorSeparator: null }}
                />
              </div>
            </InputGroup.Text>
            <Button variant="light" onClick={() => removeItem(idx)}>
              <X />
            </Button>
          </InputGroup>
        ))}

        {/* Add Item */}
        <Button size="sm" variant="outline-secondary" onClick={addItem}>
          + Product / service
        </Button>

        {/* Totals */}
        <div className="mt-3 small">
          <div className="d-flex justify-content-between">
            <span>Net total</span>
            <span>
              {currency.value} {netTotal.toFixed(2)}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span>VAT</span>
            <span>
              {currency.value} {vat.toFixed(2)}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Rounding</span>
            <span>
              {currency.value} {rounding.toFixed(2)}
            </span>
          </div>
          <div className="d-flex justify-content-between fw-semibold text-primary">
            <span>Total incl. VAT</span>
            <span>
              {currency.value} {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Save */}
        <div className="mt-3 text-end">
          <Button variant="success" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : (
              "Save Package"
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const PricingAndServices2 = ({ blockId, parentId }) => {
  const [packages, setPackages] = useState([
    {
      name: "Option A",
      richContent: "<p>Small package description</p>",
      pricing: "fixed",
      currency: currencyOptions[0],
      items: [{ name: "Sample product A", price: 1000 }],
    },
    {
      name: "Option B",
      richContent: "<p>Large package description</p>",
      pricing: "fixed",
      currency: currencyOptions[0],
      items: [{ name: "Sample product B", price: 2000 }],
    },
  ]);

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
        richContent: "<p>Package description</p>",
        pricing: "fixed",
        currency: currencyOptions[0],
        items: [{ name: "", price: 0 }],
      },
    ]);
  };

  const removePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  return (
    <div
      className="container p-4 bg-white shadow rounded-3"
      style={{ maxWidth: "1200px" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold m-0">Scope of Work</h6>
        <Button variant="light" className="border-0">
          <ThreeDots />
        </Button>
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
        />
      ))}

      {/* Add new package */}
      <Button size="sm" variant="outline-primary" onClick={addPackage}>
        + Add package
      </Button>
    </div>
  );
};

export default PricingAndServices2;
