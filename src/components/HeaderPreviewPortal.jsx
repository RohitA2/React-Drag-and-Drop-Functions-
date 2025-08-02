// src/components/HeaderPreviewPortal.jsx
import React from "react";
import ReactDOM from "react-dom";
import HeaderBlock from "./Blocks/HeaderBlocks/HeaderBlock";
import HeaderBlock2 from "./Blocks/HeaderBlocks/HeaderBlock2";
import HeaderBlock3 from "./Blocks/HeaderBlocks/HeaderBlock3";
import HeaderBlock4 from "./Blocks/HeaderBlocks/HeaderBlock4";

const previewBlocks = [
  { id: "header-1", component: HeaderBlock },
  { id: "header-2", component: HeaderBlock2 },
  { id: "header-3", component: HeaderBlock3 },
  { id: "header-4", component: HeaderBlock4 },
];

const HeaderPreviewPortal = ({ position, onSelect, onClose }) => {
  if (!position) return null;

  return ReactDOM.createPortal(
    <div
      className="bg-white border rounded shadow p-2 position-absolute"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 9999,
        backgroundColor: "#fff",
        width: "320px",
        maxHeight: "400px",
        overflowY: "auto",
      }}
      onMouseEnter={() => clearTimeout(window.__hoverTimeout)}
      onMouseLeave={onClose}
    >
      {previewBlocks.map(({ id, component: Component }) => (
        <div
          key={id}
          className="mb-3 border rounded overflow-hidden shadow-sm"
          onClick={() => {
            onSelect(id);
            onClose();
          }}
          style={{ cursor: "pointer" }}
        >
          <Component isPreview />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default HeaderPreviewPortal;
