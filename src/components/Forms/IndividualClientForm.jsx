import React, { useState, useEffect } from "react";
import { Check, Copy, Edit3, ArrowRight, ChevronDown } from "lucide-react";
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
export default function IndividualClientForm({ onCreated, recipient ,mode ="create"}) {
  const [showAdditional, setShowAdditional] = useState(false);
  const [addressType, setAddressType] = useState("work");
  const [roleOpen, setRoleOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading, success, error } = useSelector((state) => state.recipients);

  const defaultFormData = {
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
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Populate form if recipient exists
  useEffect(() => {
    if (recipient) {
      setFormData({
        ...defaultFormData,
        ...recipient,
        user_id: userId,
      });
      // Optionally set showAdditional if zip or city present
      if (recipient.zip || recipient.city) {
        setShowAdditional(true);
      }
    }
  }, [recipient, userId]);

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

  const selectedRole = roleOptions.find((r) => r.label === formData.role);
  const selectedSign = signOptions.find((s) => s.label === formData.signMethod);

  return (
    <div>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        {/* Name */}
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <CustomPhoneInput
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}
        />

        {/* Address */}
        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Toggle additional fields */}
        {!showAdditional && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-blue-600 text-sm p-0 bg-transparent border-none shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setShowAdditional(true)}
          >
            <ArrowRight size={14} />
            Show additional fields
          </button>
        )}

        {showAdditional && (
          <>
            <div className="flex gap-2 mt-2">
              <input
                name="zip"
                placeholder="Zip Code"
                value={formData.zip}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* Radio options */}
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="addressType"
              value="work"
              checked={addressType === "work"}
              onChange={(e) => setAddressType(e.target.value)}
              className="rounded"
            />
            <span className="text-sm">Work address same as above</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="addressType"
              value="other"
              checked={addressType === "other"}
              onChange={(e) => setAddressType(e.target.value)}
              className="rounded"
            />
            <span className="text-sm">Other</span>
          </label>
        </div>

        {addressType === "other" && (
          <>
            <p className="font-semibold text-sm text-gray-500 mt-2">
              Work address (Where work is going to be performed)
            </p>
            <input
              placeholder="Street"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-2 mt-2">
              <input
                placeholder="Zip"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                placeholder="City"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* Document role + Sign method */}
        <div className="flex gap-2 mt-2 w-full items-center">
          {/* Document Role Dropdown */}
          <div className="flex-1 relative">
            <p className="text-sm font-semibold mb-1 text-gray-700">Document role</p>
            <button
              type="button"
              onClick={() => setRoleOpen(!roleOpen)}
              className="w-full border border-gray-300 rounded-md flex justify-between items-center p-2 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center gap-2 text-left flex-1">
                <span className="text-gray-500">
                  {selectedRole?.icon}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">{formData.role}</span>
                  <span className="text-gray-500 text-xs truncate">
                    {selectedRole?.sub}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${roleOpen ? "rotate-180" : ""}`}
              />
            </button>

            {roleOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                {roleOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, role: opt.label });
                      setRoleOpen(false);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-start gap-2"
                  >
                    {opt.icon}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm">{opt.label}</span>
                      <span className="text-gray-500 text-xs">{opt.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign Method Dropdown */}
          <div className="flex-1 relative">
            <p className="text-sm font-semibold mb-1 text-gray-700">Sign method</p>
            <button
              type="button"
              onClick={() => setSignOpen(!signOpen)}
              className="w-full border border-gray-300 rounded-md flex justify-between items-center p-2 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="font-semibold">{formData.signMethod}</span>
                <span
                  className={`text-gray-500 text-xs truncate max-w-[200px] ${
                    formData.signMethod === "Signature" ? "text-xs" : "text-xs"
                  }`}
                >
                  {selectedSign?.sub}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${signOpen ? "rotate-180" : ""}`}
              />
            </button>

            {signOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                {signOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, signMethod: opt.label });
                      setSignOpen(false);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex flex-col items-start"
                  >
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span
                      className="text-gray-500 text-xs max-w-[220px] truncate"
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
       <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? "Saving..." : mode === "edit" ? "Update recipient" : "Save recipient"}
        </button>
      </form>
    </div>
  );
}