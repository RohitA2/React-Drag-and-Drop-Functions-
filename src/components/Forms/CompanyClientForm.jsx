import React, { useState, useEffect, useRef } from "react";
import { Check, Copy, Edit3, ArrowRight } from "lucide-react";
import { Form, Dropdown } from "react-bootstrap";
import CustomPhoneInput from "./PhoneInput";

const options = [
  { label: "Needs to sign", sub: "Signee", icon: <Edit3 size={16} /> },
  { label: "Receives a copy", sub: "Recipient", icon: <Copy size={16} /> },
  { label: "Needs to approve", sub: "Approver", icon: <Check size={16} /> },
];

const options2 = [
  {
    label: "Signature",
    sub: "Level of proof: IP address, timestamp and device",
  },
  { label: "In Person", sub: "Signature on print document" },
];

// 📌 Main Form Component
export default function IndividualClientForm() {
  const [showAdditional, setShowAdditional] = useState(false);
  const [addressType, setAddressType] = useState("work");
  const [selected, setSelected] = useState(options[0]);
  const [selectedSign, setSelectedSign] = useState(options2[0]);
  const [phone, setPhone] = useState("");

  return (
    <div>
      <Form
        className="d-flex flex-column gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <Form.Control placeholder="Company Name" />
        {/* Name */}
        <Form.Control placeholder="Name" />

        {/* Email */}
        <Form.Control type="email" placeholder="Email" />

        {/* Address */}
        <Form.Control type="text" placeholder="Address" />

        <CustomPhoneInput value={phone} onChange={setPhone} />

        {/* Role dropdown (placeholder) */}
        <div className="border rounded p-2 d-flex justify-content-between align-items-center">
          <span className="text-muted">Needs to sign</span>
          <small className="text-secondary">Sign </small>
        </div>

        {/* Toggle additional fields */}
        {!showAdditional && (
          <button
            type="button"
            className="btn box-shadow text-primary p-0 small d-flex align-items-center gap-1"
            onClick={() => setShowAdditional(true)}
          >
            <ArrowRight size={14} />
            Show additional fields
          </button>
        )}

        {showAdditional && (
          <>
            <Form.Control
              placeholder="Company Registration Number"
              className="mt-2"
            />
            <div className="d-flex gap-2 mt-2">
              <Form.Control placeholder="Zip" />
              <Form.Control placeholder="City" />
            </div>
          </>
        )}

        {/* redio options */}
        <div className="d-flex gap-3">
          <Form.Check
            type="radio"
            name="addressType"
            label="Work address same as above"
            value="work"
            checked={addressType === "work"}
            onChange={(e) => setAddressType(e.target.value)}
          />
          <Form.Check
            type="radio"
            name="addressType"
            label="Other"
            value="other"
            checked={addressType === "other"}
            onChange={(e) => setAddressType(e.target.value)}
          />
        </div>

        {addressType === "other" && (
          <>
            <Form.Label className="fw-semibold small text-muted mt-2">
              Work address (Where work is going to be performed)
            </Form.Label>
            <Form.Control placeholder="Street" />
            <div className="d-flex gap-2 mt-2">
              <Form.Control placeholder="Zip" />
              <Form.Control placeholder="City" />
            </div>
          </>
        )}

        {/* Document role + Sign method */}
        <div className="d-flex gap-2 mt-2 form-container align-items-center">
          {/* Document Role Dropdown */}
          <Dropdown className="flex-grow-1">
            <div className="small fw-semibold mb-1">Document role</div>

            {/* Selected Display */}
            <Dropdown.Toggle
              variant="light"
              className="w-100 border rounded d-flex justify-content-between align-items-center small"
            >
              <div className="d-flex align-items-center gap-2 text-start">
                <span className="text-secondary">{selected.icon}</span>
                <div className="d-flex flex-column">
                  <span className="small fw-semibold">{selected.label}</span>
                  <span className="text-muted small">{selected.sub}</span>
                </div>
              </div>
            </Dropdown.Toggle>

            {/* Dropdown Menu */}
            <Dropdown.Menu className="w-100">
              {options.map((opt, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() => setSelected(opt)}
                  className="d-flex align-items-start gap-2"
                >
                  {opt.icon}
                  <div className="d-flex flex-column">
                    <span className="small fw-semibold">{opt.label}</span>
                    <span className="text-muted small">{opt.sub}</span>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Sign Method (Static Example) */}
          <Dropdown className="flex-grow-1">
            <div className="small fw-semibold mb-1">Sign method</div>

            {/* Selected Value */}
            <Dropdown.Toggle
              variant="light"
              className="w-100 border rounded d-flex justify-content-between align-items-center small"
            >
              <div className="d-flex flex-column text-start">
                <span className="small fw-semibold">{selectedSign.label}</span>
                <span
                  className={`text-muted ${
                    selectedSign.label === "Signature" ? "text-truncate" : ""
                  }`}
                  style={{
                    fontSize:
                      selectedSign.label === "Signature" ? "10px" : "12px",
                    maxWidth: "200px",
                  }}
                >
                  {selectedSign.sub}
                </span>
              </div>
            </Dropdown.Toggle>

            {/* Dropdown Options */}
            <Dropdown.Menu className="w-100">
              {options2.map((opt, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() => setSelectedSign(opt)}
                  className="d-flex flex-column align-items-start"
                >
                  <span className="small fw-semibold">{opt.label}</span>
                  <span
                    className="text-muted"
                    style={{
                      fontSize: opt.label === "Signature" ? "10px" : "12px",
                      maxWidth: "220px",
                    }}
                  >
                    {opt.sub}
                  </span>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Save Button */}
        <button type="submit" className="btn btn-primary w-100 fw-semibold">
          Save recipient
        </button>
      </Form>
    </div>
  );
}
