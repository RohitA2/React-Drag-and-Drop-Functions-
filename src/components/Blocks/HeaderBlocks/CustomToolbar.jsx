// working code
import React from "react";
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

const defaultOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  pointerEvents: "none",
};

const CustomToolbar = ({
  id,
  showFirstRow,
  showSecondRow,
  positionStyle,
  firstRowStyle,
  secondRowStyle,
}) => (
  <div
    id={`toolbar-${id}`}
    className="custom-quill-toolbar-wrapper"
    style={{ ...defaultOverlayStyle, ...(positionStyle || {}) }}
  >
    {/* Contextual Toolbar (Text Formatting) */}
    <div
      className="custom-quill-toolbar contextual-toolbar"
      style={{
        display: showSecondRow ? "flex" : "none",
        position: "absolute",
        pointerEvents: "auto",
        ...(secondRowStyle || {}),
      }}
    >
      <button className="ql-size" title="Font Size">
        <span style={{ fontSize: "14px" }}>A</span>
        <span style={{ fontSize: "18px" }}>A</span>
      </button>

      <span className="toolbar-divider" />

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

      <button className="ql-background" title="Highlight">
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

      <button className="ql-color" title="Text Color">
        <span
          style={{
            color: "red",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ●
        </span>
      </button>

      <span className="toolbar-divider" />

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

    {/* Global Toolbar (Document Structure) */}
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

export default CustomToolbar;

// not working

// import React from "react";
// import {
//   FaBold,
//   FaItalic,
//   FaUnderline,
//   FaAlignLeft,
//   FaAlignCenter,
//   FaAlignRight,
//   FaQuoteRight,
//   FaListOl,
//   FaListUl,
//   FaImage,
//   FaLink,
//   FaTint,
// } from "react-icons/fa";
// import { BiFontFamily } from "react-icons/bi";
// import "./Custom.css";

// const CustomToolbar = ({ id, showFirstRow, showSecondRow }) => (
//   <div id={`toolbar-${id}`} className="custom-quill-toolbar-wrapper">
//     {/* First Row */}
//     {showFirstRow && (
//       <div className="custom-quill-toolbar">
//         <button className="ql-header" data-value="1" title="Heading 1">H1</button>
//         <button className="ql-header" data-value="2" title="Heading 2">H2</button>
//         <button className="ql-header" data-value="3" title="Heading 3">H3</button>
//         <button className="ql-blockquote" title="Blockquote">
//           <span><FaQuoteRight /></span>
//         </button>

//         <span className="toolbar-divider" />

//         <button className="ql-list" data-value="ordered" title="Numbered List">
//           <FaListOl />
//         </button>
//         <button className="ql-list" data-value="bullet" title="Bullet List">
//           <FaListUl />
//         </button>

//         <span className="toolbar-divider" />

//         <button className="ql-image" title="Insert Image">
//           <FaImage />
//         </button>
//       </div>
//     )}

//     {/* Second Row */}
//     {showSecondRow && (
//       <div className="custom-quill-toolbar">
//         <button title="Font Family">
//           <BiFontFamily />
//         </button>

//         <span className="toolbar-divider" />

//         <button className="ql-bold" title="Bold">
//           <FaBold />
//         </button>
//         <button className="ql-italic" title="Italic">
//           <FaItalic />
//         </button>
//         <button className="ql-underline" title="Underline">
//           <FaUnderline />
//         </button>
//         <button className="ql-link" title="Insert Link">
//           <FaLink />
//         </button>

//         <span className="toolbar-divider" />

//         <button className="ql-color" title="Text Color">
//           <FaTint />
//         </button>

//         <span className="toolbar-divider" />

//         <button className="ql-align" data-value="" title="Align Left">
//           <FaAlignLeft />
//         </button>
//         <button className="ql-align" data-value="center" title="Align Center">
//           <FaAlignCenter />
//         </button>
//         <button className="ql-align" data-value="right" title="Align Right">
//           <FaAlignRight />
//         </button>
//       </div>
//     )}
//   </div>
// );

// export default CustomToolbar;
