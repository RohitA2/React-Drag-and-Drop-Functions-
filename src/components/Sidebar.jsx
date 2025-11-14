import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import HeaderPreviewPortal from "./HeaderPreviewPortal";
import CoverPreviewPortal from "./CoverPreviewPortal";
import PricingPreviewPortal from "./PricingPreviewPortal";
// import VideoPreview from "./VIdeoPreview";

const blockSections = [
  {
    title: "Block",
    blocks: [
      { divider: true },
      { type: "header", label: "Header", hasPreview: true },
      { type: "calender", label: "Calender" },
      { type: "parties", label: "Parties" },
      { type: "price", label: "Pricing & Services", hasPreview: true },
      { type: "text", label: "Text" },
      { type: "signature", label: "Signature" },
      { type: "cover", label: "Cover", hasPreview: true },
      { type: "video", label: "Video", hasPreview: true },
      { type: "link", label: "Attachments" },
      { type: "pdf", label: "PDF" },
      // { type: "embed", label: "Embed", hasPreview: true },
      // { type: "custom", label: "Custom", hasPreview: true },
      { type: "terms", label: "Terms" },
      { type: "tutorial", label: "Tutorial" },
    ],
  },
  { title: "Design", blocks: [] },
  { title: "Fields", blocks: [] },
];

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("Block");
  const [previewPosition, setPreviewPosition] = useState(null);
  const [coverPreviewPosition, setCoverPreviewPosition] = useState(null);
  const [pricingPreviewPosition, setPricingPreviewPosition] = useState(null);
  const [videoPreviewPosition, setVideoPreviewPosition] = useState(null);

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
    window.__hoverTimeout = setTimeout(() => setPreviewPosition(null), 200);
  };

  const closeCoverPreview = () => {
    window.__hoverTimeout = setTimeout(
      () => setCoverPreviewPosition(null),
      200
    );
  };

  const closePricingPreview = () => {
    window.__hoverTimeout = setTimeout(
      () => setPricingPreviewPosition(null),
      200
    );
  };


  const closeVideoPreview = () => {
    clearTimeout(window.__hoverTimeout);
    window.__hoverTimeout = setTimeout(() => setVideoPreviewPosition(null), 200);
  };

  return (
    <div className="sidebar d-flex flex-column p-2 bg-white border-end rounded overflow-auto shadow-sm mt-1">
      {/* Tabs */}
      <div className="d-flex align-items-center mb-3">
        <div className="d-flex tabs-header">
          {blockSections.map((section) => (
            <button
              key={section.title}
              onClick={() => setActiveTab(section.title)}
              className={`tab-btn ${activeTab === section.title ? "active" : ""
                }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        <button className="settings-btn ms-2 d-flex align-items-center justify-content-center">
          <img
            src="./images/sidebar/setting.png"
            alt="setting"
            className="block-item"
          />
        </button>
      </div>

      {/* Block List */}
      {blockSections
        .filter((s) => s.title === activeTab)
        .map((section) => (
          <div key={section.title} className="d-flex flex-column gap-0">
            {section.blocks.map((block, idx) =>
              block.divider ? (
                <hr key={idx} className="my-1" />
              ) : (
                <React.Fragment key={block.type}>
                  {/* Add divider + gap before Tutorial */}
                  {block.type === "tutorial" && (
                    <hr className="my-3" /> // thicker gap than normal my-1
                  )}

                  <div
                    className={`block-item d-flex align-items-center justify-content-between gap-2 p-2 rounded ${block.disabled ? "text-muted bg-light" : ""
                      }`}
                    draggable={!block.disabled}
                    onDragStart={(e) =>
                      !block.disabled && handleDragStart(e, block.type)
                    }
                    onClick={() => handleClick(block.type)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (block.type === "header") {
                        setPreviewPosition({
                          top: rect.top,
                          left: rect.right + 10,
                        });
                      } else if (block.type === "cover") {
                        setCoverPreviewPosition({
                          top: rect.top,
                          left: rect.right + 10,
                        });
                      } else if (block.type === "price") {
                        setPricingPreviewPosition({
                          top: rect.top,
                          left: rect.right + 10,
                        });
                      }
                      else if (block.type === "video") {
                        setVideoPreviewPosition({
                          top: rect.top,
                          left: rect.right + 10,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (block.type === "header") closePreview();
                      else if (block.type === "cover") closeCoverPreview();
                      else if (block.type === "price") closePricingPreview();
                      else if (block.type === "video") closeVideoPreview();
                    }}
                    style={{
                      cursor: block.disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={`./images/sidebar/${block.type}.png`}
                        alt={block.label}
                        className="sidebar-icon"
                        data-type={block.type}
                      />
                      <span className="sidebar-label">{block.label}</span>
                    </div>
                    {block.hasPreview && (
                      <i
                        className="bi bi-chevron-right text-muted"
                        style={{ fontSize: "0.65rem" }}
                      />
                    )}
                  </div>
                </React.Fragment>
              )
            )}
          </div>
        ))}

      {/* Floating Previews */}
      <HeaderPreviewPortal
        position={previewPosition}
        onSelect={(type) => handleClick(type)}
        onClose={closePreview}
      />
      <CoverPreviewPortal
        position={coverPreviewPosition}
        onSelect={(type) => handleClick(type)}
        onClose={closeCoverPreview}
      />
      <PricingPreviewPortal
        position={pricingPreviewPosition}
        onSelect={(type) => handleClick(type)}
        onClose={closePricingPreview}
      />

      {/* <VideoPreview
        position={videoPreviewPosition}
        onSelect={(type) => handleClick(type)}
        onClose={closeVideoPreview}
      /> */}

      {/* CSS */}
      <style>
        {`
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
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          color: #555;
          transition: all 0.2s ease;
        }

        .tabs-header .tab-btn.active {
          background: #007bff;
          color: #fff;
        }

        .settings-btn {
          border: 1px solid #e0e0e0;
          background: #fff;
          border-radius: 50%;
          width: 46px;
          height: 41px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .settings-btn:hover {
          background: #007bff;
          color: #fff;
        }

        .label {
          font-family: Poppins;
          font-weight: 500;
          font-size: 14px;
          line-height: 120%;
        }

        .sidebar {
          width: 270px;
          max-width: 270px;
          font-size: 0.85rem;
          border-right: 2px solid #dee2e6;
          background-color: #fff;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
          height: 100%;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .block-item {
          font-size: 0.8rem;
          transition: background-color 0.2s ease;
        }

        .block-item:hover {
          background-color: #f8f9fa;
        }

        .block-item:hover .sidebar-icon {
          background-color: #007bff;
        }

        .block-item:hover .sidebar-label {
          color: #007bff;
        }

        .sidebar-icon {
          width: 54px;
          height: 37px;
          border-radius: 24px;
          padding: 9px;
          background-color: #f2f2f2;
          object-fit: contain;
          transition: background-color 0.2s ease;
        }

        /* Default icons */
        .sidebar-icon[data-type="header"] { content: url("./images/sidebar/header.png"); }
        .sidebar-icon[data-type="calender"] { content: url("./images/sidebar/calender.png"); }
        .sidebar-icon[data-type="cover"] { content: url("./images/sidebar/cover.png"); }
        .sidebar-icon[data-type="link"] { content: url("./images/sidebar/link.png"); }
        .sidebar-icon[data-type="parties"] { content: url("./images/sidebar/parties.png"); }
        .sidebar-icon[data-type="price"] { content: url("./images/sidebar/price.png"); }
        .sidebar-icon[data-type="text"] { content: url("./images/sidebar/text.png"); }
        .sidebar-icon[data-type="signature"] { content: url("./images/sidebar/signature.png"); }
        .sidebar-icon[data-type="video"] { content: url("./images/sidebar/video.png"); }
        .sidebar-icon[data-type="embed"] { content: url("./images/sidebar/embed.png"); }
        .sidebar-icon[data-type="custom"] { content: url("./images/sidebar/custom.png"); }
        .sidebar-icon[data-type="terms"] { content: url("./images/sidebar/terms.png"); }
        .sidebar-icon[data-type="pdf"] { content: url("./images/sidebar/pdf.png"); }
        .sidebar-icon[data-type="tutorial"] { content: url("./images/sidebar/tutorial.png"); }

        /* Hover icons */
        .block-item:hover .sidebar-icon[data-type="header"] { content: url("./images/sidebar/header-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="calender"] { content: url("./images/sidebar/calender-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="cover"] { content: url("./images/sidebar/cover-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="link"] { content: url("./images/sidebar/lnk-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="parties"] { content: url("./images/sidebar/parties-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="price"] { content: url("./images/sidebar/price-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="text"] { content: url("./images/sidebar/text-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="signature"] { content: url("./images/sidebar/signature-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="video"] { content: url("./images/sidebar/video-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="embed"] { content: url("./images/sidebar/embed-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="custom"] { content: url("./images/sidebar/custom-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="terms"] { content: url("./images/sidebar/terms-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="pdf"] { content: url("./images/sidebar/pdf-hover.png"); }
        .block-item:hover .sidebar-icon[data-type="tutorial"] { content: url("./images/sidebar/tutorial-hover.png"); }



        /* Sidebar scroll but scrollbar invisible */
        .sidebar {
          overflow-y: auto;     /* allow scroll */
          scrollbar-width: none; /* Firefox hide */
          -ms-overflow-style: none; /* IE/Edge legacy */
        }

        .sidebar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      
        

      `}
      </style>
    </div>
  );
};

export default Sidebar;
