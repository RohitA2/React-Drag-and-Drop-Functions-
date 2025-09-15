import React, { useMemo, useState } from "react";
import { Card, Button, Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import EditableQuill from "./HeaderBlocks/EditableQuill";

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "INR", label: "INR" },
];

const emptyItem = () => ({ name: "", quantity: 1, unitPrice: "" });

const PricingAndServices3 = ({ isPreview = false }) => {
  const [title, setTitle] = useState("Scope of Work");
  const [currency, setCurrency] = useState(currencyOptions[0]);
  const [items, setItems] = useState([emptyItem()]);
  const [notes, setNotes] = useState(
    "<p>Add optional notes or terms here.</p>"
  );

  const updateItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const lineTotal = (it) =>
    Number(it.quantity || 0) * Number(it.unitPrice || 0);

  const netTotal = useMemo(
    () => items.reduce((sum, it) => sum + lineTotal(it), 0),
    [items]
  );
  const vat = 0;
  const rounding = 0;
  const grandTotal = netTotal + vat + rounding;

  return (
    <div
      className={`container p-4 bg-white shadow ${
        isPreview ? "pointer-events-none" : ""
      }`}
      style={{ maxWidth: "1800px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="fs-5 fw-bold border-0 bg-transparent"
          readOnly={isPreview}
        />
        <div style={{ minWidth: 120 }}>
          <Select
            options={currencyOptions}
            value={currency}
            onChange={setCurrency}
            isDisabled={isPreview}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: 36,
                border: "1px solid #e9ecef",
                boxShadow: "none",
              }),
              indicatorSeparator: () => ({ display: "none" }),
              menu: (b) => ({ ...b, zIndex: 9999 }),
            }}
            components={{ IndicatorSeparator: null }}
          />
        </div>
      </div>

      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Body>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: "45%" }}>Product / Service</th>
                  <th style={{ width: 100 }}>Qty</th>
                  <th style={{ width: 160 }}>Unit price</th>
                  <th className="text-end" style={{ width: 160 }}>
                    Line total
                  </th>
                  <th style={{ width: 48 }} />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Control
                        type="text"
                        placeholder="Product / service"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        readOnly={isPreview}
                      />
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
                      />
                    </td>
                    <td>
                      <InputGroup>
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
                        />
                        <InputGroup.Text>{currency.value}</InputGroup.Text>
                      </InputGroup>
                    </td>
                    <td className="text-end">
                      {currency.value} {lineTotal(item).toFixed(2)}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={isPreview}
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={addItem}
              disabled={isPreview}
            >
              + Add product
            </Button>
            <div className="small text-muted" style={{ minWidth: 280 }}>
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
              <div className="d-flex justify-content-between fw-semibold">
                <span>Total incl. VAT</span>
                <span>
                  {currency.value} {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="mt-3">
        <EditableQuill
          id="price3-notes"
          value={notes}
          onChange={setNotes}
          placeholder="Write additional notes..."
          isPreview={isPreview}
        />
      </div>
    </div>
  );
};

export default PricingAndServices3;
