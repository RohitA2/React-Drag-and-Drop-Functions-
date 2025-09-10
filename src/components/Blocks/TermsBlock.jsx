import React from "react";
import { AlertCircle } from "lucide-react";

const TermsBlock = ({ blockId, parentId }) => {
  return (
    <div
      className="position-relative bg-white shadow-sm p-4"
      style={{
        maxWidth: "1800px",
        width: "100%",
        minHeight: "400px",
        border: "1px solid #e3e6e8",
      }}
    >
      {/* Left Warning Icon */}
      <div className="position-absolute top-0 start-0 p-3">
        <div
          className="d-flex justify-content-center align-items-center rounded-circle"
          style={{
            backgroundColor: "#ffe2e2",
            width: "30px",
            height: "30px",
            border: "1px solid #ffcccc",
          }}
        >
          <AlertCircle size={16} color="#dc3545" />
        </div>
      </div>

      {/* Centered Terms Text */}
      <div className="d-flex justify-content-center align-items-center h-100 text-center">
        <p className="text-muted">
          By approving this document you agree to the{" "}
          <a href="#" className="text-primary text-decoration-underline">
            terms and conditions
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default TermsBlock;
