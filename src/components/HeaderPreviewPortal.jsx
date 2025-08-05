import React from "react";
import ReactDOM from "react-dom";
import HeaderBlock from "./Blocks/HeaderBlocks/HeaderBlock";
import HeaderBlock2 from "./Blocks/HeaderBlocks/HeaderBlock2";
import HeaderBlock3 from "./Blocks/HeaderBlocks/HeaderBlock3";
import HeaderBlock4 from "./Blocks/HeaderBlocks/HeaderBlock4";
import HeaderBlock5 from "./Blocks/HeaderBlocks/HeaderBlock5";

const previewBlocks = [
  { id: "header-1", component: HeaderBlock },
  { id: "header-2", component: HeaderBlock2 },
  { id: "header-3", component: HeaderBlock3 },
  { id: "header-4", component: HeaderBlock4 },
  { id: "header-5", component: HeaderBlock5 },
];

const HeaderPreviewPortal = ({ position, onSelect, onClose }) => {
  if (!position) return null;

  return ReactDOM.createPortal(
    <div
      className="bg-white rounded-lg shadow-lg p-2 absolute flex flex-col"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: "300px",
        maxHeight: `min(620px, calc(100vh - ${position.top}px - 20px))`,
      }}
      onMouseEnter={() => clearTimeout(window.__hoverTimeout)}
      onMouseLeave={onClose}
    >
      <div
        className="overflow-y-auto thin-scrollbar pr-1 flex-grow"
        style={{
          maxHeight: "600px",
          scrollBehavior: "smooth", // For smooth scrolling
        }}
      >
        <div className="space-y-2">
          {" "}
          {/* Changed from mb-2 to space-y-2 for consistent spacing */}
          {previewBlocks.map(({ id, component: Component }) => (
            <div
              key={id}
              className="rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                onSelect(id);
                onClose();
              }}
            >
              <Component isPreview />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HeaderPreviewPortal;
