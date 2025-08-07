import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import "./EditableQuill.css";

// Your existing toolbar configuration
const quillToolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["link", "image"],
  [{ header: [1, 2, 3, false] }],
  ["blockquote", { list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["clean"],
];

const quillModules = {
  toolbar: {
    container: quillToolbarOptions,
  },
};

const EditableQuill = ({
  value,
  onChange,
  placeholder = "Type something...",
  style = {},
  minHeight = "100px",
  isPreview = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const quillRef = useRef(null);

  // Use a useEffect hook to focus the editor after it becomes visible
  useEffect(() => {
    if (isEditing && quillRef.current) {
      quillRef.current.getEditor().focus();
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.getEditor().blur();
      }
    };
  }, [isEditing]); 

  const handleEditClick = () => {
    if (!isPreview) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (document.activeElement.closest(".ql-toolbar")) {
        return;
      }
      setIsEditing(false);
    }, 100);
  };

  const hasContent = value && value !== "<p><br></p>";
  const showQuill = isEditing || hasContent;

  return (
    <div className="editable-quill-wrapper" style={{ ...style, minHeight }}>
      {!showQuill && (
        <div
          className="editable-quill-placeholder"
          onClick={handleEditClick} // Changed back to a more descriptive name
          style={{ minHeight: minHeight }}
          dangerouslySetInnerHTML={{ __html: value || placeholder }}
        />
      )}

      {showQuill && (
        <ReactQuill
          ref={quillRef}
          theme="bubble"
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          modules={quillModules}
          readOnly={isPreview}
          style={{ minHeight: minHeight }}
        />
      )}
    </div>
  );
};

export default EditableQuill;
