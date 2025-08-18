import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./PhoneInput.css";

const CustomPhoneInput = ({ value, onChange }) => {
  return (
    <PhoneInput
      country={"us"}               
      value={value}                 
      onChange={onChange}           
      enableSearch={true}           
      inputClass="form-control"    
      containerClass="w-100"        
      dropdownClass="custom-dropdown"
    />
  );
};

export default CustomPhoneInput;
