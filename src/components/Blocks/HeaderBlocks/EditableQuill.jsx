import React, { useState, useRef, useEffect } from "react";
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
  const [isTyping, setIsTyping] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const quillRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const quillInstance = quillRef.current?.getEditor();
    if (!quillInstance) return;

    const handleTextChange = (delta, oldDelta, source) => {
      if (source === "user") {
        setIsTyping(true);

        // Clear previous typing timeout if it exists
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to hide toolbar after 2 seconds of no typing
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 4000);

        setHasContent(quillInstance.getText().trim().length > 0);
      }
    };

    const handleSelectionChange = (range) => {
      setHasSelection(range && range.length > 0);
    };

    quillInstance.on("text-change", handleTextChange);
    quillInstance.on("selection-change", handleSelectionChange);

    return () => {
      quillInstance.off("text-change", handleTextChange);
      quillInstance.off("selection-change", handleSelectionChange);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
        showSecondRow={hasSelection}
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
