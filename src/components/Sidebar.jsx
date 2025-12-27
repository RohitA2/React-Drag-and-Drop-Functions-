// import React, { useState } from "react";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import HeaderPreviewPortal from "./HeaderPreviewPortal";
// import CoverPreviewPortal from "./CoverPreviewPortal";
// import PricingPreviewPortal from "./PricingPreviewPortal";
// // import VideoPreview from "./VIdeoPreview";

// const blockSections = [
//   {
//     title: "Block",
//     blocks: [
//       { divider: true },
//       { type: "header", label: "Header", hasPreview: true },
//       { type: "calender", label: "Calender" },
//       { type: "parties", label: "Parties" },
//       { type: "price", label: "Pricing & Services", hasPreview: true },
//       { type: "text", label: "Text" },
//       { type: "signature", label: "Signature" },
//       { type: "cover", label: "Cover", hasPreview: true },
//       { type: "video", label: "Video"},
//       { type: "link", label: "Attachments" },
//       { type: "pdf", label: "PDF" },
//       // { type: "embed", label: "Embed", hasPreview: true },
//       // { type: "custom", label: "Custom", hasPreview: true },
//       { type: "terms", label: "Terms" },
//       { type: "tutorial", label: "Tutorial" },
//     ],
//   },
//   { title: "Design", blocks: [] },
//   { title: "Fields", blocks: [] },
// ];

// const Sidebar = () => {
//   const [activeTab, setActiveTab] = useState("Block");
//   const [previewPosition, setPreviewPosition] = useState(null);
//   const [coverPreviewPosition, setCoverPreviewPosition] = useState(null);
//   const [pricingPreviewPosition, setPricingPreviewPosition] = useState(null);
//   const [videoPreviewPosition, setVideoPreviewPosition] = useState(null);

//   const handleDragStart = (e, blockType) => {
//     e.dataTransfer.setData("blockType", blockType);
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const handleClick = (blockType) => {
//     if (!blockType) return;
//     window.dispatchEvent(
//       new CustomEvent("sidebar-block-click", { detail: blockType })
//     );
//   };

//   const closePreview = () => {
//     window.__hoverTimeout = setTimeout(() => setPreviewPosition(null), 200);
//   };

//   const closeCoverPreview = () => {
//     window.__hoverTimeout = setTimeout(
//       () => setCoverPreviewPosition(null),
//       200
//     );
//   };

//   const closePricingPreview = () => {
//     window.__hoverTimeout = setTimeout(
//       () => setPricingPreviewPosition(null),
//       200
//     );
//   };


//   const closeVideoPreview = () => {
//     clearTimeout(window.__hoverTimeout);
//     window.__hoverTimeout = setTimeout(() => setVideoPreviewPosition(null), 200);
//   };

//   return (
//     <div className="sidebar d-flex flex-column p-2 bg-white border-end rounded overflow-auto shadow-sm mt-1">
//       {/* Tabs */}
//       <div className="d-flex align-items-center mb-3">
//         <div className="d-flex tabs-header">
//           {blockSections.map((section) => (
//             <button
//               key={section.title}
//               onClick={() => setActiveTab(section.title)}
//               className={`tab-btn ${activeTab === section.title ? "active" : ""
//                 }`}
//             >
//               {section.title}
//             </button>
//           ))}
//         </div>

//         <button className="settings-btn ms-2 d-flex align-items-center justify-content-center">
//           <img
//             src="./images/sidebar/setting.png"
//             alt="setting"
//             className="block-item"
//           />
//         </button>
//       </div>

//       {/* Block List */}
//       {blockSections
//         .filter((s) => s.title === activeTab)
//         .map((section) => (
//           <div key={section.title} className="d-flex flex-column gap-0">
//             {section.blocks.map((block, idx) =>
//               block.divider ? (
//                 <hr key={idx} className="my-1" />
//               ) : (
//                 <React.Fragment key={block.type}>
//                   {/* Add divider + gap before Tutorial */}
//                   {block.type === "tutorial" && (
//                     <hr className="my-3" /> // thicker gap than normal my-1
//                   )}

//                   <div
//                     className={`block-item d-flex align-items-center justify-content-between gap-2 p-2 rounded ${block.disabled ? "text-muted bg-light" : ""
//                       }`}
//                     draggable={!block.disabled}
//                     onDragStart={(e) =>
//                       !block.disabled && handleDragStart(e, block.type)
//                     }
//                     onClick={() => handleClick(block.type)}
//                     onMouseEnter={(e) => {
//                       const rect = e.currentTarget.getBoundingClientRect();
//                       if (block.type === "header") {
//                         setPreviewPosition({
//                           top: rect.top,
//                           left: rect.right + 10,
//                         });
//                       } else if (block.type === "cover") {
//                         setCoverPreviewPosition({
//                           top: rect.top,
//                           left: rect.right + 10,
//                         });
//                       } else if (block.type === "price") {
//                         setPricingPreviewPosition({
//                           top: rect.top,
//                           left: rect.right + 10,
//                         });
//                       }
//                       else if (block.type === "video") {
//                         setVideoPreviewPosition({
//                           top: rect.top,
//                           left: rect.right + 10,
//                         });
//                       }
//                     }}
//                     onMouseLeave={() => {
//                       if (block.type === "header") closePreview();
//                       else if (block.type === "cover") closeCoverPreview();
//                       else if (block.type === "price") closePricingPreview();
//                       else if (block.type === "video") closeVideoPreview();
//                     }}
//                     style={{
//                       cursor: block.disabled ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     <div className="d-flex align-items-center gap-2">
//                       <img
//                         src={`./images/sidebar/${block.type}.png`}
//                         alt={block.label}
//                         className="sidebar-icon"
//                         data-type={block.type}
//                       />
//                       <span className="sidebar-label">{block.label}</span>
//                     </div>
//                     {block.hasPreview && (
//                       <i
//                         className="bi bi-chevron-right text-muted"
//                         style={{ fontSize: "0.65rem" }}
//                       />
//                     )}
//                   </div>
//                 </React.Fragment>
//               )
//             )}
//           </div>
//         ))}

//       {/* Floating Previews */}
//       <HeaderPreviewPortal
//         position={previewPosition}
//         onSelect={(type) => handleClick(type)}
//         onClose={closePreview}
//       />
//       <CoverPreviewPortal
//         position={coverPreviewPosition}
//         onSelect={(type) => handleClick(type)}
//         onClose={closeCoverPreview}
//       />
//       <PricingPreviewPortal
//         position={pricingPreviewPosition}
//         onSelect={(type) => handleClick(type)}
//         onClose={closePricingPreview}
//       />

//       {/* <VideoPreview
//         position={videoPreviewPosition}
//         onSelect={(type) => handleClick(type)}
//         onClose={closeVideoPreview}
//       /> */}

//       {/* CSS */}
//       <style>
//         {`
//         .tabs-header {
//           border: 1px solid #e0e0e0;
//           border-radius: 30px;
//           padding: 4px;
//           background: #fff;
//           display: inline-flex;
//         }

//         .tabs-header .tab-btn {
//           border: none;
//           background: transparent;
//           padding: 6px 14px;
//           border-radius: 20px;
//           cursor: pointer;
//           font-size: 14px;
//           color: #555;
//           transition: all 0.2s ease;
//         }

//         .tabs-header .tab-btn.active {
//           background: #007bff;
//           color: #fff;
//         }

//         .settings-btn {
//           border: 1px solid #e0e0e0;
//           background: #fff;
//           border-radius: 50%;
//           width: 46px;
//           height: 41px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           transition: background 0.2s ease, color 0.2s ease;
//         }

//         .settings-btn:hover {
//           // background: #007bff;
//           // color: #fff;
//         }

//         .label {
//           font-family: Poppins;
//           font-weight: 500;
//           font-size: 14px;
//           line-height: 120%;
//         }

//         .sidebar {
//           width: 270px;
//           max-width: 270px;
//           font-size: 0.85rem;
//           border-right: 2px solid #dee2e6;
//           background-color: #fff;
//           border-radius: 6px;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.08);
//           height: 100%;
//         }

//         .sidebar::-webkit-scrollbar {
//           width: 6px;
//         }

//         .block-item {
//           font-size: 0.8rem;
//           transition: background-color 0.2s ease;
//         }

//         .block-item:hover {
//           background-color: #f8f9fa;
//         }

//         .block-item:hover .sidebar-icon {
//           background-color: #007bff;
//         }

//         .block-item:hover .sidebar-label {
//           color: #007bff;
//         }

//         .sidebar-icon {
//           width: 54px;
//           height: 37px;
//           border-radius: 24px;
//           padding: 9px;
//           background-color: #f2f2f2;
//           object-fit: contain;
//           transition: background-color 0.2s ease;
//         }

//         /* Default icons */
//         .sidebar-icon[data-type="header"] { content: url("./images/sidebar/header.png"); }
//         .sidebar-icon[data-type="calender"] { content: url("./images/sidebar/calender.png"); }
//         .sidebar-icon[data-type="cover"] { content: url("./images/sidebar/cover.png"); }
//         .sidebar-icon[data-type="link"] { content: url("./images/sidebar/link.png"); }
//         .sidebar-icon[data-type="parties"] { content: url("./images/sidebar/parties.png"); }
//         .sidebar-icon[data-type="price"] { content: url("./images/sidebar/price.png"); }
//         .sidebar-icon[data-type="text"] { content: url("./images/sidebar/text.png"); }
//         .sidebar-icon[data-type="signature"] { content: url("./images/sidebar/signature.png"); }
//         .sidebar-icon[data-type="video"] { content: url("./images/sidebar/video.png"); }
//         .sidebar-icon[data-type="embed"] { content: url("./images/sidebar/embed.png"); }
//         .sidebar-icon[data-type="custom"] { content: url("./images/sidebar/custom.png"); }
//         .sidebar-icon[data-type="terms"] { content: url("./images/sidebar/terms.png"); }
//         .sidebar-icon[data-type="pdf"] { content: url("./images/sidebar/pdf.png"); }
//         .sidebar-icon[data-type="tutorial"] { content: url("./images/sidebar/tutorial.png"); }

//         /* Hover icons */
//         .block-item:hover .sidebar-icon[data-type="header"] { content: url("./images/sidebar/header-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="calender"] { content: url("./images/sidebar/calender-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="cover"] { content: url("./images/sidebar/cover-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="link"] { content: url("./images/sidebar/lnk-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="parties"] { content: url("./images/sidebar/parties-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="price"] { content: url("./images/sidebar/price-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="text"] { content: url("./images/sidebar/text-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="signature"] { content: url("./images/sidebar/signature-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="video"] { content: url("./images/sidebar/video-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="embed"] { content: url("./images/sidebar/embed-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="custom"] { content: url("./images/sidebar/custom-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="terms"] { content: url("./images/sidebar/terms-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="pdf"] { content: url("./images/sidebar/pdf-hover.png"); }
//         .block-item:hover .sidebar-icon[data-type="tutorial"] { content: url("./images/sidebar/tutorial-hover.png"); }



//         /* Sidebar scroll but scrollbar invisible */
//         .sidebar {
//           overflow-y: auto;     /* allow scroll */
//           scrollbar-width: none; /* Firefox hide */
//           -ms-overflow-style: none; /* IE/Edge legacy */
//         }

//         .sidebar::-webkit-scrollbar {
//           display: none; /* Chrome, Safari, Opera */
//         }



//       `}
//       </style>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import HeaderPreviewPortal from "./HeaderPreviewPortal";
import CoverPreviewPortal from "./CoverPreviewPortal";
import PricingPreviewPortal from "./PricingPreviewPortal";



const blockItems = [
  { type: "header", label: "Header", hasPreview: true },
  { type: "calender", label: "Calender" },
  { type: "parties", label: "Participants", hasPreview: false },
  { type: "price", label: "Costing", hasPreview: true },
  { type: "text", label: "Content", hasPreview: false },
  { type: "signature", label: "Authorization", hasPreview: false },
  { type: "cover", label: "Cover Page", hasPreview: true },
  { type: "video", label: "Media", hasPreview: false },
  { type: "link", label: "Resources", hasPreview: false },
  { type: "pdf", label: "PDF", hasPreview: false },
  { type: "terms", label: "Terms", hasPreview: false },
  { type: "tutorial", label: "Tutorial", hasPreview: false },
];

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("Block");
  const [previewPosition, setPreviewPosition] = useState(null);
  const [coverPreviewPosition, setCoverPreviewPosition] = useState(null);
  const [pricingPreviewPosition, setPricingPreviewPosition] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const handleDragStart = (e, blockType) => {
    e.dataTransfer.setData("blockType", blockType);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (blockType) => {
    if (!blockType) return;
    window.dispatchEvent(
      new CustomEvent("sidebar-block-click", { detail: blockType })
    );
  };

  const closePreview = () => {
    if (window.__hoverTimeout) {
      clearTimeout(window.__hoverTimeout);
    }
    window.__hoverTimeout = setTimeout(() => {
      setPreviewPosition(null);
      setCoverPreviewPosition(null);
      setPricingPreviewPosition(null);
      setVideoPreviewPosition(null);
    }, 200);
  };

  const handleMouseEnter = (e, block) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredBlock(block.type);

    if (block.hasPreview) {
      const position = {
        top: rect.top + window.scrollY,
        left: rect.right + 10
      };

      switch (block.type) {
        case "header":
          setPreviewPosition(position);
          break;
        case "cover":
          setCoverPreviewPosition(position);
          break;
        case "price":
          setPricingPreviewPosition(position);
          break;
        case "video":
          setVideoPreviewPosition(position);
          break;
        default:
          break;
      }
    }
  };

  const handleMouseLeave = (block) => {
    setHoveredBlock(null);
    if (block.hasPreview && block.type !== "tutorial") {
      closePreview();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Block":
        return (
          <div className="d-flex flex-column gap-1">
            {blockItems.map((block) => (
              <React.Fragment key={block.type}>
                {block.type === "tutorial" && (
                  <hr className="my-3 border-secondary opacity-25" />
                )}

                <div
                  className={`block-item d-flex align-items-center justify-content-between gap-2 px-3 py-2 rounded-3 ${hoveredBlock === block.type ? "hover-active" : ""
                    }`}
                  draggable={block.type !== "tutorial"}
                  onDragStart={(e) => block.type !== "tutorial" && handleDragStart(e, block.type)}
                  onClick={() => handleClick(block.type)}
                  onMouseEnter={(e) => handleMouseEnter(e, block)}
                  onMouseLeave={() => handleMouseLeave(block)}
                  style={{
                    cursor: block.type === "tutorial" ? "default" : "pointer",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    {block.type === "tutorial" ? (
                      <div className="d-flex align-items-center justify-content-center sidebar-icon bg-light rounded-3">
                        <i className="bi bi-question-circle text-primary fs-4"></i>
                      </div>
                    ) : (
                      <img
                        src={`./images/sidebar/${block.type}.png`}
                        alt={block.label}
                        className="sidebar-icon"
                        data-type={block.type}
                      />
                    )}
                    <span className="sidebar-label">{block.label}</span>
                  </div>
                  {block.hasPreview && (
                    <i
                      className="bi bi-chevron-right text-muted"
                      style={{ fontSize: "0.8rem" }}
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        );

      case "Design":
        return (
          <div className="text-center py-5">
            <i className="bi bi-palette fs-1 text-muted mb-3"></i>
            <p className="text-muted">Design options will appear here</p>
          </div>
        );

      case "Fields":
        return (
          <div className="text-center py-5">
            <i className="bi bi-input-cursor-text fs-1 text-muted mb-3"></i>
            <p className="text-muted">Form fields will appear here</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sidebar d-flex flex-column bg-white border-end rounded shadow-sm">
      <div className="flex justify-between items-center p-4">
        <div className="flex justify-between items-center gap-4 border px-5 py-1 ">
          <div><span className="fw-medium">Block</span></div>
          <div><i className="bi bi-chevron-down"></i></div>
        </div>
        <button className="border px-3 py-1 rounded-md">
          <i className="bi bi-gear text-[#ff6a00]"></i>
        </button>
      </div>

      {/* Tab Content */}
      <div className="grow overflow-auto px-2">
        {renderTabContent()}
      </div>

      {/* Floating Previews */}
      <HeaderPreviewPortal
        position={previewPosition}
        onSelect={(type) => handleClick(type)}
        onClose={() => setPreviewPosition(null)}
      />
      <CoverPreviewPortal
        position={coverPreviewPosition}
        onSelect={(type) => handleClick(type)}
        onClose={() => setCoverPreviewPosition(null)}
      />
      <PricingPreviewPortal
        position={pricingPreviewPosition}
        onSelect={(type) => handleClick(type)}
        onClose={() => setPricingPreviewPosition(null)}
      />

      <style>
        {`
        .sidebar {
          width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .sidebar::-webkit-scrollbar {
          display: none;
        }

        .tabs-header {
          border: 1px solid #e0e0e0;
          border-radius: 30px;
          padding: 4px;
          background: #fff;
          display: inline-flex;
        }

        .tabs-header .tab-btn {
          border: none;
          background: transparent;
          padding: 8px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #555;
          transition: all 0.2s ease;
          min-width: 80px;
          text-align: center;
        }

        .tabs-header .tab-btn.active {
          background: #007bff;
          color: #fff;
        }

        .block-item {
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .block-item:hover {
          background-color: #f0f7ff;
          border-color: #d0e3ff;
        }

        .block-item.hover-active {
          background-color: #ff6a00;
          border-color: #ff6a00;
        }

        .block-item.hover-active .sidebar-label {
          color: #fff;
        }

        .block-item.hover-active .bi-chevron-right {
          color: #fff;
        }

        .block-item:hover .sidebar-label {
          color: #FFFFFF;
        }

        .sidebar-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          padding: 8px;
          background-color: #f2f2f2;
          object-fit: contain;
          transition: all 0.2s ease;
        }

        .block-item:hover .sidebar-icon {
          background-color: #e6f2ff;
        }

        .block-item.hover-active .sidebar-icon {
          background-color: #ffffff;
        }

        .sidebar-label {
          font-size: 0.9rem;
          color: #333;
          transition: color 0.2s ease;
          font-weight: 500;
        }

        /* Icon styles - simplified for clarity */
        .sidebar-icon[data-type="header"] { content: url("./images/sidebar/header.png"); }
         .sidebar-icon[data-type="calender"] { content: url("./images/sidebar/calender.png"); }
        .sidebar-icon[data-type="parties"] { content: url("./images/sidebar/parties.png"); }
        .sidebar-icon[data-type="price"] { content: url("./images/sidebar/price.png"); }
        .sidebar-icon[data-type="text"] { content: url("./images/sidebar/text.png"); }
        .sidebar-icon[data-type="signature"] { content: url("./images/sidebar/signature.png"); }
        .sidebar-icon[data-type="cover"] { content: url("./images/sidebar/cover.png"); }
        .sidebar-icon[data-type="video"] { content: url("./images/sidebar/video.png"); }
        .sidebar-icon[data-type="link"] { content: url("./images/sidebar/link.png"); }
        .sidebar-icon[data-type="pdf"] { content: url("./images/sidebar/pdf.png"); }
        .sidebar-icon[data-type="embed"] { content: url("./images/sidebar/embed.png"); }
        .sidebar-icon[data-type="custom"] { content: url("./images/sidebar/custom.png"); }
        .sidebar-icon[data-type="terms"] { content: url("./images/sidebar/terms.png"); }
        .sidebar-icon[data-type="tutorial"] { content: url("./images/sidebar/tutorial.png"); }

        // .block-item:hover .sidebar-icon[data-type="header"] { content: url("./images/sidebar/header.svg"); }
        .block-item:hover .sidebar-icon[data-type="parties"] { content: url("./images/sidebar/parties-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="price"] { content: url("./images/sidebar/price-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="text"] { content: url("./images/sidebar/text-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="signature"] { content: url("./images/sidebar/signature-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="cover"] { content: url("./images/sidebar/cover-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="video"] { content: url("./images/sidebar/video-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="link"] { content: url("./images/sidebar/link-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="pdf"] { content: url("./images/sidebar/pdf-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="embed"] { content: url("./images/sidebar/embed-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="custom"] { content: url("./images/sidebar/custom-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="terms"] { content: url("./images/sidebar/terms-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="tutorial"] { content: url("./images/sidebar/tutorial-hover.png"); }

        .block-item.hover-active .sidebar-icon[data-type="header"] { content: url("./images/sidebar/header.svg"); }
        .block-item.hover-active .sidebar-icon[data-type="calender"] { content: url("./images/sidebar/calender.png"); }
        .block-item.hover-active .sidebar-icon[data-type="parties"] { content: url("./images/sidebar/parties.png"); }
        .block-item.hover-active .sidebar-icon[data-type="price"] { content: url("./images/sidebar/price.png"); }
        .block-item.hover-active .sidebar-icon[data-type="text"] { content: url("./images/sidebar/text.png"); }
        .block-item.hover-active .sidebar-icon[data-type="signature"] { content: url("./images/sidebar/signature.png"); }
        .block-item.hover-active .sidebar-icon[data-type="cover"] { content: url("./images/sidebar/cover.png"); }
        .block-item.hover-active .sidebar-icon[data-type="video"] { content: url("./images/sidebar/video.png"); }
        .block-item.hover-active .sidebar-icon[data-type="link"] { content: url("./images/sidebar/link.png"); }
        .block-item.hover-active .sidebar-icon[data-type="pdf"] { content: url("./images/sidebar/pdf.png"); }
        .block-item.hover-active .sidebar-icon[data-type="embed"] { content: url("./images/sidebar/embed.png"); }
        .block-item.hover-active .sidebar-icon[data-type="custom"] { content: url("./images/sidebar/custom.png"); }
        .block-item.hover-active .sidebar-icon[data-type="terms"] { content: url("./images/sidebar/terms.png"); }
        .block-item.hover-active .sidebar-icon[data-type="tutorial"] { content: url("./images/sidebar/tutorial.png"); }
        `}
      </style>
    </div>
  );
};

export default Sidebar;