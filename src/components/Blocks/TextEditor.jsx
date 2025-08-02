import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const TextEditor = ({ id, onRemove }) => {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [editorVisible, setEditorVisible] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorVisible && quillRef.current) {
      // Add no-print class to the toolbar when editor becomes visible
      const toolbar = quillRef.current.getEditor().getModule('toolbar').container;
      if (toolbar) {
        toolbar.classList.add('no-print');
      }
    }
  }, [editorVisible]);

  const handleFocusEditor = () => {
    setEditorVisible(true);
    setTimeout(() => {
      if (quillRef.current) {
        quillRef.current.focus();
      }
    }, 100);
  };

  return (
    <div className="d-flex justify-content-center px-2">
      <div
        className="bg-white rounded-4 p-4 position-relative w-100"
        style={{
          maxWidth: "1400px",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Title Field */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-control border-0 fs-4 fw-semibold text-dark ps-0 mb-4"
          style={{
            background: "transparent",
            outline: "none",
            boxShadow: "none",
          }}
        />

        {/* Placeholder */}
        {!editorVisible && (
          <div
            className="border rounded-3 px-3 py-3 text-muted"
            style={{ cursor: "text", minHeight: "120px" }}
            onClick={handleFocusEditor}
          >
            Type something...
          </div>
        )}

        {/* Rich Text Editor */}
        {editorVisible && (
          <div
            className="rounded-3 mt-2"
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={value}
              onChange={setValue}
              placeholder="Type something..."
              className="border-0"
              style={{ minHeight: "180px" }}
              modules={TextEditor.modules}
              formats={TextEditor.formats}
            />
          </div>
        )}
      </div>
    </div>
  );
};

TextEditor.modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "image", "code-block"],
    [{ align: [] }],
    ["clean"],
  ],
};

TextEditor.formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "image",
  "code-block",
  "align",
];

export default TextEditor;