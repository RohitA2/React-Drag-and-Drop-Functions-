import React, { useState } from "react";
import { Check, Copy, Edit3, ArrowRight } from "lucide-react";
import { Form, Dropdown } from "react-bootstrap";
import CustomPhoneInput from "./PhoneInput";
import { useSelector, useDispatch } from "react-redux";
import { createRecipient } from "../../store/recipientSlice"; // ✅ adjust import path
import { selectedUserId } from "../../store/authSlice";

const roleOptions = [
  { label: "Needs to sign", sub: "Signee", icon: <Edit3 size={16} /> },
  { label: "Receives a copy", sub: "Recipient", icon: <Copy size={16} /> },
  { label: "Needs to approve", sub: "Approver", icon: <Check size={16} /> },
];

const signOptions = [
  {
    label: "Signature",
    sub: "Level of proof: IP address, timestamp and device",
  },
  { label: "In Person", sub: "Signature on print document" },
];

export default function CompanyClientForm({ onCreated }) {
  const [showAdditional, setShowAdditional] = useState(false);
  const [addressType, setAddressType] = useState("work");
  const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
  const [selectedSign, setSelectedSign] = useState(signOptions[0]);
  const [phone, setPhone] = useState("");

  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.recipients);

  const [formData, setFormData] = useState({
    type: "company",
    companyName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    zip: "",
    city: "",
    role: roleOptions[0].label,
    signMethod: signOptions[0].label,
    user_id: useSelector(selectedUserId),
  });

  // ✅ Update formData dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch and wait for result
    const resultAction = await dispatch(createRecipient(formData));

    // If creation successful, call onCreated
    if (createRecipient.fulfilled.match(resultAction)) {
      const newRecipient = resultAction.payload; // this should be the created recipient from API
      if (onCreated) onCreated(newRecipient);
    }
  };

  return (
    <div>
      <Form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
        {/* Company Name */}
        <Form.Control
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
        />

        {/* Name */}
        <Form.Control
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

        {/* Email */}
        <Form.Control
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Address */}
        <Form.Control
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

        {/* Phone */}
        <CustomPhoneInput value={phone} onChange={handlePhoneChange} />

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
              name="registrationNumber"
              value={formData.registrationNumber || ""}
              onChange={handleChange}
            />
            <div className="d-flex gap-2 mt-2">
              <Form.Control
                placeholder="Zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
              />
              <Form.Control
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Radio options for address type */}
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
            <Form.Control
              placeholder="Street"
              name="workStreet"
              value={formData.workStreet || ""}
              onChange={handleChange}
            />
            <div className="d-flex gap-2 mt-2">
              <Form.Control
                placeholder="Zip"
                name="workZip"
                value={formData.workZip || ""}
                onChange={handleChange}
              />
              <Form.Control
                placeholder="City"
                name="workCity"
                value={formData.workCity || ""}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Document role + Sign method */}
        <div className="d-flex gap-2 mt-2 form-container align-items-center">
          {/* Document Role Dropdown */}
          <Dropdown className="flex-grow-1">
            <div className="small fw-semibold mb-1">Document role</div>
            <Dropdown.Toggle
              variant="light"
              className="w-100 border rounded d-flex justify-content-between align-items-center small"
            >
              <div className="d-flex align-items-center gap-2 text-start">
                <span className="text-secondary">{selectedRole.icon}</span>
                <div className="d-flex flex-column">
                  <span className="small fw-semibold">
                    {selectedRole.label}
                  </span>
                  <span className="text-muted small">{selectedRole.sub}</span>
                </div>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
              {roleOptions.map((opt, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() => {
                    setSelectedRole(opt);
                    setFormData({ ...formData, role: opt.label });
                  }}
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

          {/* Sign Method Dropdown */}
          <Dropdown className="flex-grow-1">
            <div className="small fw-semibold mb-1">Sign method</div>
            <Dropdown.Toggle
              variant="light"
              className="w-100 border rounded d-flex justify-content-between align-items-center small"
            >
              <div className="d-flex flex-column text-start">
                <span className="small fw-semibold">{selectedSign.label}</span>
                <span className="text-muted small">{selectedSign.sub}</span>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
              {signOptions.map((opt, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() => {
                    setSelectedSign(opt);
                    setFormData({ ...formData, signMethod: opt.label });
                  }}
                  className="d-flex flex-column align-items-start"
                >
                  <span className="small fw-semibold">{opt.label}</span>
                  <span className="text-muted small">{opt.sub}</span>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="btn btn-primary w-100 fw-semibold"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save recipient"}
        </button>

        {success && <p className="text-success small mt-2">Recipient saved!</p>}
        {error && <p className="text-danger small mt-2">{error}</p>}
      </Form>
    </div>
  );
}
