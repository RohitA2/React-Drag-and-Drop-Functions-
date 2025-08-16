import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import HeaderPreviewPortal from "./HeaderPreviewPortal";
import CoverPreviewPortal from "./CoverPreviewPortal";

const blockSections = [
  {
    title: "Block",
    blocks: [
      {
        type: "header",
        icon: "bi-layout-text-window-reverse",
        label: "Header",
        hasPreview: true,
      },
      // { type: "parties", icon: "bi-person-badge", label: "Parties" },
      // {
      //   type: "pricing & services",
      //   icon: "bi-currency-dollar",
      //   label: "Pricing & Services",
      //   hasPreview: true,
      // },
      // { type: "text", icon: "bi-type", label: "Text" },
      // { type: "signature", icon: "bi-pencil", label: "Signature" },
      // { divider: true },
      // { type: "cover", icon: "bi-image", label: "Cover", hasPreview: true },
      // {
      //   type: "video",
      //   icon: "bi-camera-video",
      //   label: "Video",
      //   hasPreview: true,
      // },
      // { type: "attachment", icon: "bi-paperclip", label: "Attachments" },
      // { type: "pdf", icon: "bi-file-earmark-pdf", label: "PDF" },
      // { type: "embed", icon: "bi-box", label: "Embed", hasPreview: true },
      // {
      //   type: "custom",
      //   icon: "bi-code-slash",
      //   label: "Custom",
      //   hasPreview: true,
      // },
      // {type:"schedule", icon: "bi-calendar-event", label: "Schedule"},
      // { type: "terms", icon: "bi-file-text", label: "Terms" },
    ],
  },
  // {
  //   title: "Design",
  //   blocks: [],
  // },
  // {
  //   title: "Fields",
  //   blocks: [],
  // },
  // {
  //   title: "settings",
  //   iconOnly: true,
  //   icon: "bi-gear",
  //   blocks: [],
  // },
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
    <div className="sidebar  d-flex flex-column p-2 bg-white border-end h-100 mb-6 border rounded overflow-hidden shadow-sm mt-1">
      {/* Tabs */}
      <div className="d-flex align-items-center border-bottom mb-2">
        {blockSections.map((section) => (
          <button
            key={section.title}
            onClick={() => setActiveTab(section.title)}
            className={`btn btn-sm position-relative tab-btn ${
              activeTab === section.title ? "active" : ""
            } ${section.iconOnly ? "px-1" : "me-1"}`}
            title={section.iconOnly ? "Settings" : ""}
          >
            {section.iconOnly ? (
              <i className={`bi ${section.icon}`} />
            ) : (
              <>
                {section.title}
                {activeTab === section.title && (
                  <div className="tab-underline" />
                )}
              </>
            )}
          </button>
        ))}
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
                  className={`block-item d-flex align-items-center justify-content-between gap-1 p-1 rounded ${
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
                  <div className="d-flex align-items-center gap-3">
                    <i className={`bi ${block.icon} fs-6`} />
                    <span className="text-secondary font-femily-sans-serif fw-bold">
                      {block.label}
                    </span>
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
        <button className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1 shadow-sm border">
          <i className="bi bi-question-circle"></i>
          <span>Tutorial</span>
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
        .sidebar {
          width: 230px;
          min-width: 200px;
          max-width: 230px;
          font-size: 0.85rem;
          border-right: 2px solid #dee2e6;
          background-color: #fff;
          overflow-y: hidden;
        }
  
        .tab-btn {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          position: relative;
          font-size: 0.8rem;
          min-width: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.5rem;
        }

        .tab-btn.active {
          color: #000;
          font-weight: 600;
        }

        .tab-underline {
          position: absolute;
          bottom: -2px;
          left: 0;
          height: 1px;
          width: 100%;
          background-color: #3C3C3C;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          0% {
            width: 0;
            opacity: 0;
          }
          50% {
            width: 50%;
            opacity: 0.5;
          }
          100% {
            width: 100%;
            opacity: 1;
          }
        }

        .block-item {
          font-size: 0.8rem;
        }

        .block-item:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .block-item:active {
          background-color: #e9ecef;
        }

        .block-item i {
          width: 14px;
          text-align: center;
          font-size: 0.9rem;
        }
      `}
      </style>
    </div>
  );
};

export default Sidebar;
