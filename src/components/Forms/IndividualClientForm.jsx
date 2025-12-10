import React, { useState } from "react";
import { Check, Copy, Edit3, ArrowRight } from "lucide-react";
import { Form, Dropdown } from "react-bootstrap";
import CustomPhoneInput from "./PhoneInput";
import { useSelector, useDispatch } from "react-redux";
import { createRecipient, updateRecipient } from "../../store/recipientSlice";
import { selectedUserId } from "../../store/authSlice";

const roleOptions = [
  { label: "Needs to sign", sub: "Signee", icon: <Edit3 size={16} /> },
  { label: "Receives a copy", sub: "Recipient", icon: <Copy size={16} /> },
  { label: "Needs to approve", sub: "Approver", icon: <Check size={16} /> },
];

const signOptions = [
  {
    label: "BankId",
    sub: "Signature via BankId authentication",
  },
  {
    label: "Signature",
    sub: "Level of proof: IP address, timestamp and device",
  },
  { label: "In Person", sub: "Signature on print document" },
];

// 📌 Main Form Component
export default function IndividualClientForm({ onCreated, recipient }) {
  const [showAdditional, setShowAdditional] = useState(false);
  const [addressType, setAddressType] = useState("work");

  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading, success, error } = useSelector((state) => state.recipients);

  const [formData, setFormData] = useState({
    type: "individual",
    name: "",
    email: "",
    phone: "",
    address: "",
    zip: "",
    city: "",
    role: roleOptions[0].label,
    signMethod: signOptions[0].label,
    user_id: userId,
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let resultAction;

    if (recipient?.id) {
      // 🔹 Update existing
      resultAction = await dispatch(
        updateRecipient({ id: recipient.id, data: formData })
      );
    } else {
      // 🔹 Create new
      resultAction = await dispatch(createRecipient(formData));
    }

    if (
      (createRecipient.fulfilled.match(resultAction) ||
        updateRecipient.fulfilled.match(resultAction)) &&
      onCreated
    ) {
      onCreated(resultAction.payload);
    }
  };

  return (
    <div>
      <Form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
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

        <CustomPhoneInput
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}
        />

        {/* Address */}
        <Form.Control
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

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
            <div className="d-flex gap-2 mt-2">
              <Form.Control
                name="zip"
                placeholder="Zip Code"
                value={formData.zip}
                onChange={handleChange}
              />
              <Form.Control
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Radio options */}
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
            <Dropdown.Toggle
              variant="light"
              className="w-100 border rounded d-flex justify-content-between align-items-center small"
            >
              <div className="d-flex align-items-center gap-2 text-start">
                <span className="text-secondary">
                  {roleOptions.find((r) => r.label === formData.role)?.icon}
                </span>
                <div className="d-flex flex-column">
                  <span className="small fw-semibold">{formData.role}</span>
                  <span className="text-muted small">
                    {roleOptions.find((r) => r.label === formData.role)?.sub}
                  </span>
                </div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              {roleOptions.map((opt, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() => setFormData({ ...formData, role: opt.label })}
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
                <span className="small fw-semibold">{formData.signMethod}</span>
                <span
                  className={`text-muted ${
                    formData.signMethod === "Signature" ? "text-truncate" : ""
                  }`}
                  style={{
                    fontSize:
                      formData.signMethod === "Signature" ? "10px" : "12px",
                    maxWidth: "200px",
                  }}
                >
                  {
                    signOptions.find((s) => s.label === formData.signMethod)
                      ?.sub
                  }
                </span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              {signOptions.map((opt, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() =>
                    setFormData({ ...formData, signMethod: opt.label })
                  }
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
        <button
          type="submit"
          className="btn btn-primary w-100 fw-semibold"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save recipient"}
        </button>
      </Form>
    </div>
  );
}
