import React, { useState, useEffect, useRef } from "react";
import Select, { components } from "react-select";
import Flag from "react-world-flags";
// import { ChevronRight, ChevronDown, ArrowRight } from "react-bootstrap-icons";
import { Check, Copy, Edit3, ArrowRight } from "lucide-react";
import { Form, Button, Modal, Dropdown } from "react-bootstrap";

// 🌍 Country options
const countryOptions = [
  { value: "+1", label: "United States", code: "US" },
  { value: "+91", label: "India", code: "IN" },
  { value: "+44", label: "United Kingdom", code: "GB" },
  { value: "+61", label: "Australia", code: "AU" },
];

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

// 📌 PhoneInput Component
const PhoneInput = () => {
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);

  // Custom Option (flag + label + code)
  const Option = (props) => (
    <components.Option {...props}>
      <Flag code={props.data.code} style={{ width: 20, marginRight: 8 }} />
      {props.data.label} ({props.data.value})
    </components.Option>
  );

  // Custom SingleValue (flag + dial code)
  const SingleValue = (props) => (
    <components.SingleValue {...props}>
      <Flag code={props.data.code} style={{ width: 20, marginRight: 8 }} />
      {props.data.value}
    </components.SingleValue>
  );

  return (
    <div className="d-flex border rounded overflow-hidden">
      <Select
        options={countryOptions}
        value={selectedCountry}
        onChange={setSelectedCountry}
        components={{ Option, SingleValue }}
        isSearchable
        className="border-0"
        classNamePrefix="react-select"
        styles={{
          container: (base) => ({
            ...base,
            width: "180px",
          }),
          control: (base) => ({
            ...base,
            border: "none",
            boxShadow: "none",
            minHeight: "38px",
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0 8px",
          }),
          indicatorsSeparator: () => ({ display: "none" }),
        }}
      />
      <Form.Control placeholder="Cellphone" className="border-0 flex-grow-1" />
    </div>
  );
};

// 📌 Main Form Component
export default function IndividualClientForm() {
  const [showAdditional, setShowAdditional] = useState(false);
  const [addressType, setAddressType] = useState("work");
  const [selected, setSelected] = useState(options[0]);
  const [selectedSign, setSelectedSign] = useState(options2[0]);
  // const [showConfirmModal, setShowConfirmModal] = useState(false);
  // const formRef = useRef(null);

  // Track form changes
  // Detect clicks outside the form (ALWAYS show modal)
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (formRef.current && !formRef.current.contains(event.target)) {
  //       setShowConfirmModal(true);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // const handleClose = (confirmed) => {
  //   if (confirmed && onClose) {
  //     onClose();   // parent se aaya hua close call karega
  //   }
  //   setShowConfirmModal(false);
  // };

  return (
    <div>
      <Form
        className="d-flex flex-column gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Name */}
        <Form.Control placeholder="Name" />

        {/* Email */}
        <Form.Control type="email" placeholder="Email" />

        {/* Phone with country selector */}
        <PhoneInput />

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
            <Form.Control placeholder="Address" className="mt-2" />
            <div className="d-flex gap-2 mt-2">
              <Form.Control placeholder="Zip Code" />
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
      {/* Confirmation Modal */}
      {/* <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Body className="p-4">
          <h5 className="mb-3">Unsaved changes</h5>
          <p>Are you sure you want to cancel?</p>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => handleClose(false)}
            >
              No
            </Button>
            <Button variant="primary" onClick={() => handleClose(true)}>
              Yes
            </Button>
          </div>
        </Modal.Body>
      </Modal> */}
    </div>
  );
}
