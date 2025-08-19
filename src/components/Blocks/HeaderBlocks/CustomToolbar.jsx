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
import "./Custom.css";

// Default overlay (toolbar always floats on top of editor)
const defaultOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  pointerEvents: "none",
};

// Color palette options
const COLORS = [
  "#000000",
  "#2c3e50",
  "#2980b9",
  "#3498db",
  "#8e44ad",
  "#e74c3c",
  "#e67e22",
  "#f39c12",
  "#27ae60",
  "#2ecc71",
];

const CustomToolbar = ({
  id,
  showFirstRow,
  showSecondRow,
  positionStyle,
  firstRowStyle,
  secondRowStyle,
  quill, // Pass in your Quill instance
}) => {
  const [showColors, setShowColors] = useState(false);

  // Apply color to selected text
  const applyColor = (color) => {
    if (quill) {
      quill.format("color", color);
    }
    setShowColors(false);
  };

  return (
    <div
      id={`toolbar-${id}`}
      className="custom-quill-toolbar-wrapper"
      style={{ ...defaultOverlayStyle, ...(positionStyle || {}) }}
    >
      {/* Contextual Toolbar (inline formatting) */}
      <div
        className="custom-quill-toolbar contextual-toolbar"
        style={{
          display: showSecondRow ? "flex" : "none",
          position: "absolute",
          pointerEvents: "auto",
          ...(secondRowStyle || {}),
        }}
      >
        {/* Font Size */}
        <button className="ql-size" title="Font Size">
          <span style={{ fontSize: "14px" }}>A</span>
          <span style={{ fontSize: "18px" }}>A</span>
        </button>

        <span className="toolbar-divider" />

        {/* Inline formatting */}
        <button className="ql-bold" title="Bold"><FaBold /></button>
        <button className="ql-italic" title="Italic"><FaItalic /></button>
        <button className="ql-underline" title="Underline"><FaUnderline /></button>
        <button className="ql-link" title="Insert Link"><FaLink /></button>

        <span className="toolbar-divider" />

        {/* Highlight */}
        <button className="ql-background" title="Highlight">
          <span style={{
            background: "yellow",
            padding: "2px 4px",
            borderRadius: "2px",
            fontSize: "12px",
          }}>
            H
          </span>
        </button>

        {/* 🎨 Color Picker */}
        <div className="color-dropdown">
          <button
            className="ql-color"
            title="Text Color"
            onClick={() => setShowColors(!showColors)}
          >
            <span style={{ color: "red", fontSize: "16px", fontWeight: "bold" }}>●</span>
          </button>

          {showColors && (
            <div className="color-palette">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="color-swatch"
                  style={{ background: c }}
                  onClick={() => applyColor(c)}
                />
              ))}
              {/* Custom Color Picker */}
              <button
                className="color-swatch gradient"
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
        <button className="ql-align" value="" title="Align Left"><FaAlignLeft /></button>
        <button className="ql-align" value="center" title="Align Center"><FaAlignCenter /></button>
        <button className="ql-align" value="right" title="Align Right"><FaAlignRight /></button>
      </div>

      {/* Global Toolbar (document-level tools) */}
      <div
        className="custom-quill-toolbar global-toolbar"
        style={{
          display: showFirstRow ? "flex" : "none",
          position: "absolute",
          pointerEvents: "auto",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "auto",
          ...(firstRowStyle || {}),
        }}
      >
        <button className="ql-header" value="1" title="Heading 1">H1</button>
        <button className="ql-header" value="2" title="Heading 2">H2</button>
        <button className="ql-header" value="3" title="Heading 3">H3</button>

        <span className="toolbar-divider" />

        <button className="ql-blockquote" title="Blockquote"><FaQuoteRight /></button>

        <span className="toolbar-divider" />

        <button className="ql-list" value="ordered" title="Numbered List"><FaListOl /></button>
        <button className="ql-list" value="bullet" title="Bullet List"><FaListUl /></button>

        <span className="toolbar-divider" />

        <button className="ql-image" title="Insert Image"><FaImage /></button>
      </div>
    </div>
  );
};

export default CustomToolbar;
