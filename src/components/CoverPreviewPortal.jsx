// src/components/CoverPreviewPortal.jsx
import React from "react";
import ReactDOM from "react-dom";
import CoverBlock from "./Blocks/CoverBlocks/CoverBlock";
import CoverBlock1 from "./Blocks/CoverBlocks/CoverBlock";
import CoverBlock2 from "./Blocks/CoverBlocks/CoverBlock2";
import CoverBlock3 from "./Blocks/CoverBlocks/CoverBlock3";
import CoverBlock4 from "./Blocks/CoverBlocks/CoverBlock4";
import CoverBlock5 from "./Blocks/CoverBlocks/CoverBlock5";

const previewBlocks = [
  { id: "cover-1", component: CoverBlock },
  { id: "cover-2", component: CoverBlock2 },
  { id: "cover-3", component: CoverBlock3 },
  { id: "cover-4", component: CoverBlock4 },
  { id: "cover-5", component: CoverBlock5 },
];


const CoverPreviewPortal = ({ position, onSelect, onClose }) => {
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
        //   className="mb-3 border rounded overflow-hidden shadow-sm bg-[#FC040C]"
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

export default CoverPreviewPortal;
