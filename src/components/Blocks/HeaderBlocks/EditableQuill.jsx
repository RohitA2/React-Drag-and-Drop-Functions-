import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import "./EditableQuill.css";

const extendedColors = [
  "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#CCCCCC",
  "#D9D9D9", "#EFEFEF", "#F3F3F3", "#FFFFFF", "#FF0000", "#FF9900",
  "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#9900FF", "#FF00FF",
  "#FF99CC", "#FFCC00", "#CCFF00", "#66FF99", "#33CCFF", "#3399FF",
  "#9933FF", "#FF3366",
];

const quillToolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["link", "image"],
  [{ header: [1, 2, 3, false] }],
  ["blockquote", { list: "ordered" }, { list: "bullet" }],
  [{ color: extendedColors }, { background: extendedColors }],
  [{ align: [] }],
];

const EditableQuill = ({
  value,
  onChange,
  placeholder = "Type something...",
  style = {},
  minHeight = "100px",
  isPreview = false,
  className = "",
  textAlign = "left",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const quillRef = useRef(null);
  const wrapperRef = useRef(null);
  const editorId = useRef(`quill-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    if (isEditing && quillRef.current) {
      quillRef.current.getEditor().focus();
    }
  }, [isEditing]);

  // Move Quill bubble toolbar into floating container
  useEffect(() => {
    if (quillRef.current && isEditing) {
      const editor = quillRef.current.getEditor();
      const toolbarContainer = document.getElementById("floating-quill-toolbar-container");
      if (toolbarContainer && editor.theme.tooltip?.root) {
        // Reset position to static so it sits inside container
        editor.theme.tooltip.root.style.position = "static";
        toolbarContainer.appendChild(editor.theme.tooltip.root);
      }
    }
  }, [isEditing]);

  const handleEditClick = () => {
    if (!isPreview) setIsEditing(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (document.activeElement.closest(".ql-toolbar")) return;
      setIsEditing(false);
    }, 100);
  };

  const hasContent = value && value !== "type something...";
  const showQuill = isEditing || hasContent;

  return (
    <div
      ref={wrapperRef}
      className={`editable-quill-wrapper ${className} text-${textAlign} ${hasContent ? "has-content" : ""}`}
      style={{
        ...style,
        minHeight,
        width: "100%",
        position: "relative",
      }}
    >
      {!showQuill && (
        <div
          className="editable-quill-placeholder"
          onClick={handleEditClick}
          style={{
            minHeight,
            cursor: isPreview ? "default" : "pointer",
            width: "100%",
            textAlign: "left",
          }}
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: value || "" }}
        />
      )}

      {showQuill && (
        <ReactQuill
          ref={quillRef}
          theme="bubble"
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          modules={{ toolbar: { container: quillToolbarOptions } }}
          readOnly={isPreview}
          style={{
            width: "100%",
            height: "auto",
            minHeight,
            textAlign: "left",
          }}
          formats={[
            "bold", "italic", "underline", "strike",
            "link", "image", "size", "font", "header",
            "blockquote", "list", "color", "background", "align",
          ]}
        />
      )}
    </div>
  );
};

export default EditableQuill;