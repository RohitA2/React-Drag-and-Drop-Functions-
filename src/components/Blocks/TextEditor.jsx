import { useState, useEffect } from "react";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import axios from "axios";

const TextEditor = ({ blockId, parentId, initialTitle, initialContent }) => {
  const [title, setTitle] = useState(initialTitle || "");
  const [value, setValue] = useState(initialContent || "");
  const [editorVisible, setEditorVisible] = useState(Boolean(initialTitle || initialContent));
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Load saved block
  useEffect(() => {
    // If initial values provided, use them and skip fetch
    if (initialTitle || initialContent) {
      setEditorVisible(true);
      return;
    }
    const fetchBlock = async () => {
      try {
        const res = await axios.get(
          `${VITE_API_URL}/text/${blockId}/${parentId}`
        );
        if (res.data.success) {
          setTitle(res.data.block.title || "");
          setValue(res.data.block.content || "");
          setEditorVisible(true);
        }
      } catch (err) {
        console.log("No existing block found");
      }
    };
    fetchBlock();
  }, [blockId, parentId, initialTitle, initialContent]);

  // Save block whenever title or value changes
  useEffect(() => {
    if (!editorVisible) return;

    const timeout = setTimeout(async () => {
      await axios.post(`${VITE_API_URL}/text/createorupdatetextblock`, {
        blockId,
        parentId,
        title,
        content: value,
      });
    }, 1000); // debounce save (1 sec after typing)

    return () => clearTimeout(timeout);
  }, [title, value, blockId, parentId, editorVisible]);

  const handleFocusEditor = () => {
    setEditorVisible(true);
  };

  return (
    <div
      className="position-relative mx-auto"
      style={{
        backgroundColor: "#ffffff",
        padding: "40px 30px",
        maxWidth: "1800px",
        minHeight: "100vh",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Title Field */}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="form-control text-center fs-3 fw-bold border-0 mb-4"
        style={{
          background: "transparent",
          boxShadow: "none",
          color: "#4b5563",
        }}
      />

      {/* Quill Editor or Placeholder */}
      <div onClick={handleFocusEditor} style={{ minHeight: "200px" }}>
        {!editorVisible ? (
          <p className="text-muted">Start typing here...</p>
        ) : (
          <EditableQuill
            id={`editor-${blockId}`}
            value={value}
            onChange={setValue}
            placeholder="Start typing here..."
            style={{
              minHeight: "150px",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TextEditor;
