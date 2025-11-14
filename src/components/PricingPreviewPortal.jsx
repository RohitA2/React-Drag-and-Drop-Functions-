import React from "react";
import ReactDOM from "react-dom";
import PricingAndServices from "./Blocks/PricingAndServices";
import PricingAndServices2 from "./Blocks/PricingAndServices2";
import PricingAndServices3 from "./Blocks/PricingAndServices3";

const previewBlocks = [
  { id: "price", component: PricingAndServices },
  { id: "price-2", component: PricingAndServices2 },
  { id: "price-3", component: PricingAndServices3 },
];

const PricingPreviewPortal = ({ position, onSelect, onClose }) => {
  if (!position) return null;

  const headerOffset = 56; // header height
  const sidebarWidth = 270;
  const gutter = 12;
  const leftOffset = sidebarWidth + gutter;

  return ReactDOM.createPortal(
    <div
      className=" p-0 position-fixed d-flex flex-column border border-gray-200 rounded-md shadow-sm"
      style={{
        top: headerOffset,
        left: leftOffset,
        zIndex: 1050,
        width: "200px",
        height: `calc(100vh - ${headerOffset + 12}px)`,
        borderRadius: "5px",
        maxHeight: `calc(100vh - ${headerOffset + 12}px)`,
        overflow: "hidden",
        backgroundColor: "white",
      }}
      onMouseEnter={() => clearTimeout(window.__hoverTimeout)}
      onMouseLeave={onClose}
    >
      <div
        className="flex-grow-1"
        style={{
          overflow: "auto",
          scrollBehavior: "smooth",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <div className="space-y-2">
          {previewBlocks.map(({ id, component: Component }) => (
            <div
              key={id}
              className=" overflow-hidden cursor-pointer bg-gray-50"
              onClick={() => {
                onSelect(id);
                onClose();
              }}
              style={{
                marginTop: "-40px",
                padding: "40px",
                height: "180px",
                marginRight: "10px",
                marginLeft: "-32px",
              }}
            >
              <div
                style={{
                  transform: "scale(0.3)",
                  transformOrigin: "top left",
                  width: "500%",
                  height: "200%",
                }}
              >
                <Component isPreview />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .flex-grow-1::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PricingPreviewPortal;


