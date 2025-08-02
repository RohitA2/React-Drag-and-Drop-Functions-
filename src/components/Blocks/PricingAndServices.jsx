import React, { useState } from "react";
import { Card, Button, Form, InputGroup } from "react-bootstrap";
import { X } from "lucide-react";

const PricingAndServices = () => {
  const [title, setTitle] = useState("Scope of Work");
  const [packageName, setPackageName] = useState("Package name");
  const [packageDescription, setPackageDescription] = useState("Package description");
  const [items, setItems] = useState([{ name: "Sample product", price: 1000 }]);

  const handleAddItem = () => {
    setItems([...items, { name: "", price: "" }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const netTotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const vat = 0;
  const rounding = 0;
  const total = netTotal + vat + rounding;

  return (
    <div className="container my-4">
      <Form.Control
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="fs-4 fw-bold border-0 px-0 mb-3"
      />

      <Card className="shadow-sm border rounded-3">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center rounded-top-3">
          <span className="fw-semibold text-muted">Single option</span>
          <span className="text-muted small">Pricing: Fixed price</span>
        </Card.Header>

        <Card.Body>
          <Form.Control
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="fs-5 fw-semibold border-0 px-0 mb-1"
          />
          <Form.Control
            as="textarea"
            rows={1}
            value={packageDescription}
            onChange={(e) => setPackageDescription(e.target.value)}
            className="text-muted border-0 px-0 mb-4"
          />

          {items.map((item, index) => (
            <InputGroup className="mb-3" key={index}>
              <Form.Control
                type="text"
                placeholder="Product / Service"
                value={item.name}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
              />
              <Form.Control
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, "price", e.target.value)}
              />
              <InputGroup.Text>$</InputGroup.Text>
              <Button variant="outline-secondary" onClick={() => handleRemoveItem(index)}>
                <X size={16} />
              </Button>
            </InputGroup>
          ))}

          <Button variant="outline-secondary" onClick={handleAddItem}>
            + Product / service
          </Button>
        </Card.Body>

        <Card.Footer className="bg-white">
          <div className="d-flex justify-content-end">
            <div style={{ minWidth: "250px" }}>
              <div className="d-flex justify-content-between">
                <span>Net total</span>
                <span>${netTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>VAT</span>
                <span>${vat.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Rounding</span>
                <span>${rounding.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total incl. VAT</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default PricingAndServices;
