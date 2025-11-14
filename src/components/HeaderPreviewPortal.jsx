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

  // Ensure the preview appears to the right of the sidebar (≈230px wide)
  const sidebarWidth = 230;
  const gutter = 10;
  const safeLeft = Math.max(position.left, sidebarWidth + gutter);

  return ReactDOM.createPortal(
    <div
      className="rounded-md shadow-lg p-0 position-fixed d-flex flex-column"
      style={{
        top: Math.max(60, position.top || 60),
        left: safeLeft,
        zIndex: 1050,
        width: "200px",
        marginTop: "-45px",
        height: "950px",
        marginLeft: "0px",
        borderRadius: "5px",
        maxHeight: "calc(100vh - 68px)",
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
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
              className="rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-gray-50"
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
              {/* Scale down preview */}
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

export default HeaderPreviewPortal;
