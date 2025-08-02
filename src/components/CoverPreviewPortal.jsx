import React from "react";
import ReactDOM from "react-dom";
import CoverBlock from "./Blocks/CoverBlocks/CoverBlock";
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
      className="bg-white rounded-md shadow-sm p-0 absolute flex flex-col"
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
          scrollBehavior: "smooth"
        }}
      >
        <div className="space-y-1"> {/* Changed from space-y-3 to space-y-1 */}
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

export default CoverPreviewPortal;