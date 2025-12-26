// import React, { useEffect, useState } from "react";
// import { AlertCircle } from "lucide-react";
// import axios from "axios";
// import EditableQuill from "./HeaderBlocks/EditableQuill";

// const API_URL = import.meta.env.VITE_API_URL;

// const TermsBlock = ({ blockId, parentId, initialContent }) => {
//   const [content, setContent] = useState(initialContent || "Terms & Conditions");

//   // 🔹 Fetch existing terms (if any)
//   useEffect(() => {
//     if (initialContent) return; // skip fetch if provided
//     const fetchTerms = async () => {
//       try {
//         const res = await axios.get(
//           `${API_URL}/terms/get/${blockId}/${parentId}`
//         );
//         if (res.data?.success && res.data.data) {
//           setContent(res.data.data.content || "");
//         }
//       } catch (err) {
//         console.error("Error fetching terms:", err);
//       }
//     };

//     if (blockId && parentId) {
//       fetchTerms();
//     }
//   }, [blockId, parentId, initialContent]);

//   // 🔹 Save when content changes
//   const handleSave = async (newContent) => {
//     try {
//       setContent(newContent);
//       await axios.post(`${API_URL}/terms/save`, {
//         blockId,
//         parentId,
//         title: "Terms & Conditions",
//         content: newContent,
//       });
//       console.log("✅ Terms saved");
//     } catch (err) {
//       console.error("❌ Error saving terms:", err);
//     }
//   };

//   return (
//     <div
//       className="position-relative bg-white shadow-sm p-4"
//       style={{
//         maxWidth: "1800px",
//         width: "100%",
//         minHeight: "400px",
//         border: "1px solid #e3e6e8",
//       }}
//     >
//       {/* Left Warning Icon */}
//       <div className="position-absolute top-0 start-0 p-3">
//         <div
//           className="d-flex justify-content-center align-items-center rounded-circle"
//           style={{
//             backgroundColor: "#ffe2e2",
//             width: "30px",
//             height: "30px",
//             border: "1px solid #ffcccc",
//           }}
//         >
//           <AlertCircle size={16} color="#dc3545" />
//         </div>
//       </div>

//       {/* Centered Terms Text */}
//       <div className="d-flex justify-content-center align-items-center h-100 text-center mb-3">
//         <p className="text-muted">
//           By approving this document you agree to the{" "}
//           <a href="#" className="text-primary text-decoration-underline">
//             terms and conditions
//           </a>
//           .
//         </p>
//       </div>

//       {/* Editable Quill for Terms */}
//       <EditableQuill value={content} onChange={handleSave} />
//     </div>
//   );
// };

// export default TermsBlock;


import React, { useEffect, useState } from "react";
import { AlertCircle, FileText, Shield, CheckCircle, Save, Loader2 } from "lucide-react";
import axios from "axios";
import EditableQuill from "./HeaderBlocks/EditableQuill";

const API_URL = import.meta.env.VITE_API_URL;

const TermsBlock = ({ blockId, parentId, initialContent }) => {
  const [content, setContent] = useState(initialContent || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 🔹 Fetch existing terms (if any)
  useEffect(() => {
    if (initialContent) return; // skip fetch if provided
    const fetchTerms = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/terms/get/${blockId}/${parentId}`
        );
        if (res.data?.success && res.data.data) {
          setContent(res.data.data.content || "");
        }
      } catch (err) {
        console.error("Error fetching terms:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (blockId && parentId) {
      fetchTerms();
    }
  }, [blockId, parentId, initialContent]);

  // 🔹 Save when content changes
  const handleSave = async (newContent) => {
    setIsSaving(true);
    try {
      setContent(newContent);
      await axios.post(`${API_URL}/terms/save`, {
        blockId,
        parentId,
        title: "Terms & Conditions",
        content: newContent,
      });
      setLastSaved(new Date());
      console.log("✅ Terms saved");
    } catch (err) {
      console.error("❌ Error saving terms:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="position-relative bg-white shadow-lg overflow-hidden border-0"
      style={{
        maxWidth: "1800px",
        width: "100%",
        transition: "all 0.3s ease",
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
      }}
    >
      {/* Header */}
      <div 
        className="d-flex align-items-center justify-content-between p-4"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          cursor: "pointer",
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <FileText size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-white fw-bold mb-1">Terms & Conditions</h3>
            <p className="text-white-50 mb-0 small">
              Legal agreement for document approval
            </p>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {lastSaved && (
            <span className="text-white-50 small d-none d-md-block">
              Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <div className="bg-white-20 rounded-pill px-3 py-1 d-flex align-items-center gap-2">
            <Shield size={14} className="text-white" />
            <span className="text-white small">Required</span>
          </div>
          <div className="bg-white rounded-circle p-2">
            {isCollapsed ? (
              <span className="text-primary">▼</span>
            ) : (
              <span className="text-primary">▲</span>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <>
          {/* Warning Banner */}
          <div className="alert alert-warning border-0 rounded-0 d-flex align-items-center gap-3 py-3 px-4 m-0"
            style={{ 
              background: "linear-gradient(90deg, #fff3cd 0%, #ffeaa7 100%)",
              borderLeft: "4px solid #ffc107"
            }}>
            <AlertCircle size={20} className="text-warning" />
            <div className="grow">
              <strong className="d-block mb-1">Important Legal Notice</strong>
              <span className="small">
                By approving this document, you legally agree to all terms and conditions specified below.
              </span>
            </div>
            <a 
              href="#" 
              className="btn btn-sm btn-outline-warning rounded-pill px-3 d-flex align-items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText size={14} />
              View Full Terms
            </a>
          </div>

          {/* Main Content */}
          <div className="p-5">
            {isLoading ? (
              <div className="text-center py-5">
                <Loader2 size={32} className="text-primary animate-spin mb-3" />
                <p className="text-muted">Loading terms and conditions...</p>
              </div>
            ) : (
              <>
                {/* Terms Editor */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-semibold mb-1">Terms Content</h5>
                      <p className="text-muted small mb-0">Edit the terms and conditions below</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {isSaving && (
                        <>
                          <Loader2 size={16} className="text-primary animate-spin" />
                          <span className="text-primary small">Saving...</span>
                        </>
                      )}
                      {lastSaved && !isSaving && (
                        <span className="text-success small d-flex align-items-center gap-1">
                          <CheckCircle size={14} />
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden shadow-sm">
                    <EditableQuill 
                      value={content} 
                      onChange={handleSave}
                      placeholder="Enter your terms and conditions here..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-3 mt-4 pt-4 border-top">
                  <button 
                    className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCollapsed(true);
                    }}
                  >
                    <span>Collapse</span>
                  </button>
                  <button 
                    className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(content);
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

                {/* Footer Note */}
                <div className="mt-4 pt-3 text-center">
                  <p className="text-muted small">
                    <strong>Note:</strong> Changes are auto-saved. Users must explicitly agree to these terms before proceeding.
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-4 border-top">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-light rounded-lg p-2">
                <FileText size={20} className="text-primary" />
              </div>
              <div>
                <h6 className="fw-semibold mb-0">Terms & Conditions</h6>
                <p className="text-muted small mb-0">
                  {content ? `${content.substring(0, 80)}...` : "No terms content yet"}
                </p>
              </div>
            </div>
            <button 
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
              onClick={() => setIsCollapsed(false)}
            >
              Expand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsBlock;