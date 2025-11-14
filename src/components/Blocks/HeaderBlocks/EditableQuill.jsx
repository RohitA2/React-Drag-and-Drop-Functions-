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
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 10000);
      }
    };

    const handleSelectionChange = (range) => {
      const hasSelection = !!(range && range.length && range.length > 0);
      let rect = null;
      try {
        const selection = quillInstance.getSelection();
        if (selection) {
          const bounds = quillInstance.getBounds(selection);
          const editorRoot = quillInstance.root;
          if (editorRoot && editorRoot.getBoundingClientRect) {
            const editorRect = editorRoot.getBoundingClientRect();
            rect = {
              top: editorRect.top + bounds.top,
              left: editorRect.left + bounds.left,
              width: bounds.width || 0,
              height: bounds.height || 0,
            };
          }
        }
      } catch (_) {}
      setIsSelection(hasSelection);
      setSelectionRect(rect);
    };

    quillInstance.on("text-change", handleTextChange);
    quillInstance.on("selection-change", handleSelectionChange);

    return () => {
      quillInstance.off("text-change", handleTextChange);
      quillInstance.off("selection-change", handleSelectionChange);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleChange = (content, delta, source, editor) => {
    setHasContent(editor.getText().trim().length > 0);
    onChange(content);
  };

  const modules = {
    toolbar: { container: `#toolbar-${id}` },
  };

  const formats = [
    "header",
    "size",
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
    "background",
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
        quill={quillRef.current?.getEditor()}
        firstRowStyle={{
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 12,
        }}
        secondRowStyle={
          selectionRect
            ? {
                top: Math.max(8, selectionRect.top - 10),
                left:
                  selectionRect.left + Math.max(0, (selectionRect.width || 0) / 2),
                transform: "translate(-50%, -100%)",
              }
            : { display: "none" }
        }
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
