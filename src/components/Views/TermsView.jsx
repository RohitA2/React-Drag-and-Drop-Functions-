import React from "react";

const TermsView = ({ terms }) => {
  if (!terms) return null;
  return (
    <div
      style={{
        padding: "16px",
        background: "#fff",
        border: "1px solid #ddd",
      }}
    >
      <h4>{terms.title || "Terms & Conditions"}</h4> 
      <div
        className="text-muted"
        dangerouslySetInnerHTML={{ __html: terms.content || "" }}
      />
    </div>
  );
};

export default TermsView;
