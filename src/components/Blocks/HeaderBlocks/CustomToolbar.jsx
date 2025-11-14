import React, { useState } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaQuoteRight,
  FaListOl,
  FaListUl,
  FaImage,
  FaLink,
} from "react-icons/fa";
import { DropletHalf } from "react-bootstrap-icons";
import { createPortal } from "react-dom";
import "react-quill/dist/quill.snow.css";
import "./Custom.css";

const defaultOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  pointerEvents: "none",
};

const COLORS = [
  "#000000",
  "#444444",
  "#666666",
  "#999999",
  "#cccccc",
  "#ffffff",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
];

const CustomToolbar = ({
  id,
  showFirstRow,
  showSecondRow,
  positionStyle,
  firstRowStyle,
  secondRowStyle,
  quill,
}) => {
  const [showColors, setShowColors] = useState(false);
  const [showHeading, setShowHeading] = useState(false);

  const applyColor = (color) => {
    if (quill) quill.format("color", color);
    setShowColors(false);
  };

  const applyHeading = (type) => {
    if (!quill) return;

    switch (type) {
      case "title":
        quill.format("header", 1);
        quill.format("size", "huge");
        break;
      case "1":
        quill.format("header", 1);
        break;
      case "2":
        quill.format("header", 2);
        break;
      case "3":
        quill.format("header", 3);
        break;
      case "blockquote":
        quill.format("blockquote", true);
        break;
      case "text":
        quill.format("header", false);
        quill.format("size", false);
        quill.format("blockquote", false);
        break;
      default:
        break;
    }
    setShowHeading(false);
  };

  const portalTarget =
    typeof document !== "undefined" &&
    (document.getElementById("floating-quill-toolbar-container") ||
      document.body);

  const toolbar = (
    <div
      id={`toolbar-${id}`}
      className="custom-quill-toolbar-wrapper"
      style={{ ...defaultOverlayStyle, ...(positionStyle || {}) }}
    >
      {/* Contextual Toolbar */}
      <div
        className="custom-quill-toolbar contextual-toolbar"
        style={{
          display: showSecondRow ? "flex" : "none",
          pointerEvents: "auto",
          ...(secondRowStyle || {}),
        }}
      >
        {/* Font/Heading Dropdown */}
        <div className="heading-dropdown-wrapper">
          <button
            className="heading-dropdown-trigger"
            onClick={() => setShowHeading(!showHeading)}
            title="Font Style"
          >
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>AA</span>
          </button>
          {showHeading && (
            <div
              className="heading-dropdown custom-quill-toolbar ql-snow "
              style={{ display: "block" }}
            >
              <div onClick={() => applyHeading("title")}>Title</div>
              <div onClick={() => applyHeading("1")}>Heading 1</div>
              <div onClick={() => applyHeading("2")}>Heading 2</div>
              <div onClick={() => applyHeading("3")}>Heading 3</div>
              <div onClick={() => applyHeading("text")}>Text</div>
              <div onClick={() => applyHeading("blockquote")}>Quote</div>
            </div>
          )}
        </div>
        <span className="toolbar-divider" />

        {/* Inline formatting */}
        <button className="ql-bold" title="Bold">
          <FaBold />
        </button>
        <button className="ql-italic" title="Italic">
          <FaItalic />
        </button>
        <button className="ql-underline" title="Underline">
          <FaUnderline />
        </button>
        <button className="ql-link" title="Insert Link">
          <FaLink />
        </button>

        <span className="toolbar-divider" />

        {/* Highlight */}
        <button
          className="ql-background"
          title="Highlight"
          onClick={() => applyColor("yellow")}
        >
          <span
            style={{
              background: "yellow",
              padding: "2px 4px",
              borderRadius: "2px",
              fontSize: "12px",
            }}
          >
            H
          </span>
        </button>

        {/* Color Picker */}
        <div className="custom-color-dropdown">
          <button
            className="custom-color-trigger"
            title="Text Color"
            onClick={() => setShowColors(!showColors)}
          >
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              <DropletHalf />
            </span>
          </button>
          {showColors && (
            <div className="custom-color-palette">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="custom-color-swatch"
                  style={{ background: c }}
                  onClick={() => applyColor(c)}
                />
              ))}
              <button
                className="custom-color-swatch gradient"
                title="More Colors"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "color";
                  input.style.display = "none";
                  input.addEventListener("input", (e) => {
                    applyColor(e.target.value);
                  });
                  input.click();
                }}
              />
            </div>
          )}
        </div>

        <span className="toolbar-divider" />

        {/* Alignment */}
        <button className="ql-align" value="" title="Align Left">
          <FaAlignLeft />
        </button>
        <button className="ql-align" value="center" title="Align Center">
          <FaAlignCenter />
        </button>
        <button className="ql-align" value="right" title="Align Right">
          <FaAlignRight />
        </button>
      </div>

      {/* Global Toolbar */}
      <div
        className="custom-quill-toolbar global-toolbar"
        style={{
          display: showFirstRow ? "flex" : "none",
          position: "fixed",
          pointerEvents: "auto",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "auto",
          marginLeft: "-200px",
          zIndex: 3000,
          ...(firstRowStyle || {}),
        }}
      >
        <button className="ql-header" value="1" title="Heading 1">
          H1
        </button>
        <button className="ql-header" value="2" title="Heading 2">
          H2
        </button>
        <button className="ql-header" value="3" title="Heading 3">
          H3
        </button>

        <span className="toolbar-divider" />

        <button className="ql-blockquote" title="Blockquote">
          <FaQuoteRight />
        </button>

        <span className="toolbar-divider" />

        <button className="ql-list" value="ordered" title="Numbered List">
          <FaListOl />
        </button>
        <button className="ql-list" value="bullet" title="Bullet List">
          <FaListUl />
        </button>

        <span className="toolbar-divider" />

        <button className="ql-image" title="Insert Image">
          <FaImage />
        </button>
      </div>
    </div>
  );

  return portalTarget ? createPortal(toolbar, portalTarget) : toolbar;
};

export default CustomToolbar;
