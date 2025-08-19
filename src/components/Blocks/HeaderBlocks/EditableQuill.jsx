import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CustomToolbar from "./CustomToolbar";
import "./Custom.css";

const EditableQuill = ({
  id = "editor",
  value,
  onChange,
  placeholder = "",
  className = "",
  style = {},
  isPreview = false,
  onTypingChange,
  onSelectionChange,
}) => {
  const [hasContent, setHasContent] = useState(!!value);
  const quillRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSelection, setIsSelection] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);

  useEffect(() => {
    const quillInstance = quillRef.current?.getEditor();
    if (!quillInstance) return;

    const handleTextChange = (delta, oldDelta, source) => {
      if (source === "user") {
        setHasContent(quillInstance.getText().trim().length > 0);
        setIsTyping(true);

        // Debounce typing end
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 5000);
      }
    };

    const handleSelectionChange = (range) => {
      const hasSelection = !!(range && range.length && range.length > 0);
      // Compute selection position in viewport
      let selectionRect = null;
      try {
        const selection = quillInstance.getSelection();
        if (selection) {
          const bounds = quillInstance.getBounds(selection);
          const editorRoot = quillInstance.root;
          if (editorRoot && editorRoot.getBoundingClientRect) {
            const editorRect = editorRoot.getBoundingClientRect();
            selectionRect = {
              top: editorRect.top + bounds.top,
              left: editorRect.left + bounds.left,
              width: bounds.width || 0,
              height: bounds.height || 0,
            };
          }
        }
      } catch (_) {}
      setIsSelection(hasSelection);
      setSelectionRect(selectionRect);
    };

    quillInstance.on("text-change", handleTextChange);
    quillInstance.on("selection-change", handleSelectionChange);

    return () => {
      quillInstance.off("text-change", handleTextChange);
      quillInstance.off("selection-change", handleSelectionChange);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [onTypingChange, onSelectionChange]);

  const handleChange = (content, delta, source, editor) => {
    setHasContent(editor.getText().trim().length > 0);
    onChange(content);
  };

  const modules = {
    toolbar: {
      container: `#toolbar-${id}`,
    },
  };

  const formats = [
    "header",
    "font",
    "bold",
    "italic",
    "underline",
    "color",
    "align",
    "blockquote",
    "list",
    "bullet",
    "image",
    "link",
  ];

  return (
    <div
      className={`editable-quill-wrapper ${className} ${
        hasContent ? "has-content" : ""
      }`}
      style={style}
    >
      {!hasContent && (
        <div
          className="editable-quill-placeholder"
          data-placeholder={placeholder}
        />
      )}

      <CustomToolbar
        id={id}
        showFirstRow={isTyping}
        showSecondRow={isSelection}
        firstRowStyle={{
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 12,
        }}
        secondRowStyle={selectionRect ? {
          top: Math.max(8, selectionRect.top - 44),
          left: selectionRect.left + Math.max(0, selectionRect.width / 2) - 150,
        } : { display: "none" }}
      />

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={isPreview}
      />
    </div>
  );
};

export default EditableQuill;