import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import HeaderPreviewPortal from "./HeaderPreviewPortal";
import CoverPreviewPortal from "./CoverPreviewPortal";

const blockSections = [
  {
    title: "Block",
    blocks: [
      { divider: true },
      {
        type: "header",
        icon: (
          <img
            src="./images/sidebar/header.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Header",
        hasPreview: true,
      },
      {
        type: "parties",
        icon: (
          <img
            src="./images/sidebar/parties.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Parties",
      },
      {
        type: "pricing & services",
        icon: (
          <img
            src="./images/sidebar/price.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Pricing & Services",
        hasPreview: true,
      },
      {
        type: "text",
        icon: (
          <img
            src="./images/sidebar/text.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Text",
      },
      {
        type: "signature",
        icon: (
          <img
            src="./images/sidebar/signature.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Signature",
      },
      {
        type: "cover",
        icon: (
          <img
            src="./images/sidebar/cover.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Cover",
        hasPreview: true,
      },
      {
        type: "video",
        icon: (
          <img
            src="./images/sidebar/video.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Video",
        hasPreview: true,
      },
      {
        type: "attachment",
        icon: (
          <img
            src="./images/sidebar/link.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Attachments",
      },
      {
        type: "pdf",
        icon: (
          <img
            src="./images/sidebar/pdf.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "PDF",
      },
      {
        type: "embed",
        icon: (
          <img
            src="./images/sidebar/embed.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Embed",
        hasPreview: true,
      },
      {
        type: "custom",
        icon: (
          <img
            src="./images/sidebar/custom.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Custom",
        hasPreview: true,
      },
      // { type: "schedule", icon: "bi-calendar-event", label: "Schedule" },
      {
        type: "terms",
        icon: (
          <img
            src="./images/sidebar/terms.png"
            alt="header"
            className="sidebar-icon"
          />
        ),
        label: "Terms",
      },
    ],
  },
  {
    title: "Design",
    blocks: [],
  },
  {
    title: "Fields",
    blocks: [],
  },
  {
    title: "settings",
    iconOnly: true,
    icon: "bi-gear",
    blocks: [],
  },
];

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("Block");
  const [previewPosition, setPreviewPosition] = useState(null);
  const [coverPreviewPosition, setCoverPreviewPosition] = useState(null);

  const handleDragStart = (e, blockType) => {
    e.dataTransfer.setData("blockType", blockType);
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

  return (
    <div className="sidebar d-flex flex-column p-2 bg-white border-end rounded overflow-hidden shadow-sm mt-1">
      {/* Tabs */}
      <div className="d-flex align-items-center justify-content-between mb-1 tabs-container">
        <div className="d-flex tabs">
          {blockSections.map((section, idx) => (
            <button
              key={section.title}
              onClick={() => setActiveTab(section.title)}
              className={`tab-btn ${
                activeTab === section.title ? "active" : ""
              }`}
            >
              {section.iconOnly ? (
                <i className={`bi ${section.icon}`} />
              ) : (
                section.title
              )}
            </button>
          ))}
        </div>
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
                <div
                  key={block.type}
                  className={`block-item d-flex align-items-center justify-content-between gap-2 p-2 rounded ${
                    block.disabled ? "text-muted bg-light" : ""
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
                    }
                  }}
                  onMouseLeave={() => {
                    if (block.type === "header") closePreview();
                    else if (block.type === "cover") closeCoverPreview();
                  }}
                  style={{
                    cursor: block.disabled ? "not-allowed" : "pointer",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {block.icon}
                    <span className="sidebar-label">{block.label}</span>
                  </div>
                  {block.hasPreview && (
                    <i
                      className="bi bi-chevron-right text-muted"
                      style={{ fontSize: "0.65rem" }}
                    />
                  )}
                </div>
              )
            )}
          </div>
        ))}

      {/* Bottom Tutorial */}
      <div className="mt-auto pt-2">
        <button className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-start justify-content-start p-2 border-0 gap-2 ">
          <div>
            <img
              src="./images/sidebar/tutorial.png"
              alt="tutorial"
              className="sidebar-icon me-2"
            />
            <span className="label">Tutorial</span>
          </div>
        </button>
      </div>

      {/* Floating Preview Panels */}
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

      <style>
        {`

        .label{
        width: 39;
        height: 14;
        angle: 0 deg;
        opacity: 1;
        font-family: Poppins;
        font-weight: 500;
        font-style: Medium;
        font-size: 14px;
        leading-trim: NONE;
        line-height: 120%;
        letter-spacing: 1.6%;
        }
        
       .sidebar {
          position: absolute;
          top: 62px;
          bottom: 9px;
          left: 0;
          width: 230px;
          min-width: 200px;
          max-width: 230px;
          font-size: 0.85rem;
          border-right: 2px solid #dee2e6;
          background-color: #fff;
          overflow-y: auto;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }

        .tabs-container {
              background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 999px;
            padding: 6px 4px;
            gap: 6px;
        }

        .tabs {
          display: flex;
          gap: 0px;
        }

        .tab-btn {
          background-color: transparent;
          border: none;
          color: #555;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background-color: #007bff;
          color: #fff;
          font-weight: 600;
        }


        .block-item {
          font-size: 0.8rem;
        }

        .block-item:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        // .block-item:active {
        //   background-color: #e9ecef;
        // }

        // .block-item i {
        //   width: 14px;
        //   text-align: center;
        //   font-size: 0.9rem;
        // }

        .block-item {
          font-size: 0.8rem;
          transition: background-color 0.2s ease;
        }

        // .block-item:hover {
        //   background-color: #f0f8ff; /* light blue, or use #e7f1ff or your brand color */
        // }

        .block-item:hover .sidebar-icon {
          background-color: #007bff;
        }

        .block-item:hover .sidebar-label {
          color: #007bff;
        }


      /* Icon styles */
        .sidebar-icon {
                 width: 54px;
                height: 37px;
                border-radius: 24px;
                padding: 9px;
                background-color: #f2f2f2;
                object-fit: contain;
                transition: background-color 0.2s ease;
        }
  

      `}
      </style>
    </div>
  );
};

export default Sidebar;
