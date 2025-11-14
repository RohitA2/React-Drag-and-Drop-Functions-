import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import axios from "axios";
import EditableQuill from "./HeaderBlocks/EditableQuill";

const API_URL = import.meta.env.VITE_API_URL;

const TermsBlock = ({ blockId, parentId, initialContent }) => {
  const [content, setContent] = useState(initialContent || "Terms & Conditions");

  // 🔹 Fetch existing terms (if any)
  useEffect(() => {
    if (initialContent) return; // skip fetch if provided
    const fetchTerms = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/terms/get/${blockId}/${parentId}`
        );
        if (res.data?.success && res.data.data) {
          setContent(res.data.data.content || "");
        }
      } catch (err) {
        console.error("Error fetching terms:", err);
      }
    };

    if (blockId && parentId) {
      fetchTerms();
    }
  }, [blockId, parentId, initialContent]);

  // 🔹 Save when content changes
  const handleSave = async (newContent) => {
    try {
      setContent(newContent);
      await axios.post(`${API_URL}/terms/save`, {
        blockId,
        parentId,
        title: "Terms & Conditions",
        content: newContent,
      });
      console.log("✅ Terms saved");
    } catch (err) {
      console.error("❌ Error saving terms:", err);
    }
  };

  return (
    <div
      className="position-relative bg-white shadow-sm p-4"
      style={{
        maxWidth: "1800px",
        width: "100%",
        minHeight: "400px",
        border: "1px solid #e3e6e8",
      }}
    >
      {/* Left Warning Icon */}
      <div className="position-absolute top-0 start-0 p-3">
        <div
          className="d-flex justify-content-center align-items-center rounded-circle"
          style={{
            backgroundColor: "#ffe2e2",
            width: "30px",
            height: "30px",
            border: "1px solid #ffcccc",
          }}
        >
          <AlertCircle size={16} color="#dc3545" />
        </div>
      </div>

      {/* Centered Terms Text */}
      <div className="d-flex justify-content-center align-items-center h-100 text-center mb-3">
        <p className="text-muted">
          By approving this document you agree to the{" "}
          <a href="#" className="text-primary text-decoration-underline">
            terms and conditions
          </a>
          .
        </p>
      </div>

      {/* Editable Quill for Terms */}
      <EditableQuill value={content} onChange={handleSave} />
    </div>
  );
};

export default TermsBlock;
