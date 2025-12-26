// import React from "react";
// import ReactDOM from "react-dom";
// import CoverBlock from "./Blocks/CoverBlocks/CoverBlock";
// import CoverBlock2 from "./Blocks/CoverBlocks/CoverBlock2";
// import CoverBlock3 from "./Blocks/CoverBlocks/CoverBlock3";
// import CoverBlock4 from "./Blocks/CoverBlocks/CoverBlock4";
// import CoverBlock5 from "./Blocks/CoverBlocks/CoverBlock5";

// const previewBlocks = [
//   { id: "cover-1", component: CoverBlock },
//   { id: "cover-2", component: CoverBlock2 },
//   { id: "cover-3", component: CoverBlock3 },
//   { id: "cover-4", component: CoverBlock4 },
//   { id: "cover-5", component: CoverBlock5 },
// ];

// const CoverPreviewPortal = ({ position, onSelect, onClose }) => {
//   if (!position) return null;

//   // Stick preview to the very top (below header) and to the right of the sidebar
//   const headerOffset = 56; // header height
//   const sidebarWidth = 270;
//   const gutter = 12;
//   const leftOffset = sidebarWidth + gutter;

//   return ReactDOM.createPortal(
//     <div
//       className=" p-0 position-fixed d-flex flex-column border border-gray-200 rounded-md shadow-sm"
//       style={{
//         top: headerOffset,
//         left: leftOffset,
//         zIndex: 1050,
//         width: "200px",
//         height: `calc(100vh - ${headerOffset + 12}px)`,
//         borderRadius: "5px",
//         maxHeight: `calc(100vh - ${headerOffset + 12}px)`,
//         overflow: "hidden",
//         backgroundColor: "white",
//       }}
//       onMouseEnter={() => clearTimeout(window.__hoverTimeout)}
//       onMouseLeave={onClose}
//     >
//       <div
//         className="flex-grow-1"
//         style={{
//           overflow: "auto",
//           scrollBehavior: "smooth",
//           msOverflowStyle: "none",
//           scrollbarWidth: "none",
//         }}
//       >
//         <div className="space-y-2">
//           {previewBlocks.map(({ id, component: Component }) => (
//             <div
//               key={id}
//               className=" overflow-hidden cursor-pointer bg-gray-50"
//               onClick={() => {
//                 onSelect(id);
//                 onClose();
//               }}
//               style={{
//                 marginTop: "-40px",
//                 padding: "40px",
//                 height: "180px",
//                 marginRight: "10px",
//                 marginLeft: "-32px",
//               }}
//             >
//               {/* Scale down preview */}
//               <div
//                 style={{
//                   transform: "scale(0.3)",
//                   transformOrigin: "top left",
//                   width: "500%",
//                   height: "200%",
//                 }}
//               >
//                 <Component isPreview />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <style>{`
//         .flex-grow-1::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>,
//     document.body
//   );
// };

// export default CoverPreviewPortal;



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

  // Stick preview to the very top (below header) and to the right of the sidebar
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
        width: "440px", // Increased width to comfortably fit 2 columns
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
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 px-8 pt-12"> {/* 2-column grid, adjusted gaps & padding to keep tight spacing similar to original (accounting for negative marginTop) */}
          {previewBlocks.map(({ id, component: Component }) => (
            <div
              key={id}
              className="rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-gray-50" // Added rounded + hover effects for consistency with Header version and better visuals
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
              {/* Scale down preview – kept exactly the same */}
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

export default CoverPreviewPortal;