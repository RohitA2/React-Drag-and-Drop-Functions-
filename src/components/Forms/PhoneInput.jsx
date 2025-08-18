import React from "react";
import Select, { components } from "react-select";
import Flag from "react-world-flags";
import { Form } from "react-bootstrap";

// 🌍 Country options
const countryOptions = [
  { value: "+1", label: "United States", code: "US" },
  { value: "+91", label: "India", code: "IN" },
  { value: "+44", label: "United Kingdom", code: "GB" },
  { value: "+61", label: "Australia", code: "AU" },
];

const PhoneInput = ({ country, onCountryChange, phone, onPhoneChange }) => {
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
        value={country}
        onChange={onCountryChange}
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
      <Form.Control
        placeholder="Cellphone"
        className="border-0 flex-grow-1"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
      />
    </div>
  );
};

export default PhoneInput;
