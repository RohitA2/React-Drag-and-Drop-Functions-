import React from "react";
import "./Loader.css"; // custom CSS

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="custom-spinner"></div>
      <span className="loading-text">Loading clients...</span>
    </div>
  );
};

export default Loader;