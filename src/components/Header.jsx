import {
  X,
  LayoutDashboard,
  Save,
  Download,
  Link as LinkIcon,
  Eye,
  Edit3,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import HeaderSidebar from "./HeaderSidebar";
import ConfirmationModal from "./ConfirmationModal";

const HeaderBar = ({
  toggleSidebar,
  hasElementsOnCanvas,
  canvasRef,
  onAddBlock,
  hasSignatureBlock,
  blocks,
  onNewProposal,
  isPreviewMode = false,
  onTogglePreview,
  // Add these props:
 parentId = null,
  projectId = null,
  isEditing = false,
  editProject = null,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleReviewSend = () => {
    // if (!hasElementsOnCanvas) return;
    setIsSidebarOpen(true);
  };

  const handleSaveAction = async (action) => {
    if (action === "save-pdf" && canvasRef?.current) {
      const canvasElement = canvasRef.current;

      // Hide non-printable elements
      const controls = canvasElement.querySelectorAll(".no-print");
      controls.forEach((el) => (el.style.display = "none"));

      // Replace iframes with placeholders
      const iframes = canvasElement.querySelectorAll("iframe");
      const iframeBackups = [];

      for (const iframe of iframes) {
        const src = iframe.getAttribute("src") || "";
        let imgSrc = "";

        // YouTube embed detection
        const youtubeMatch = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
          const videoId = youtubeMatch[1];
          imgSrc = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }

        // PDF detection: src looks like blob: or object URL
        const isPdf =
          src.includes("blob:") || src.includes("data:application/pdf");

        let placeholder;

        if (imgSrc) {
          // YouTube: use thumbnail image
          placeholder = document.createElement("img");
          placeholder.src = imgSrc;
        } else if (isPdf) {
          // PDF: use <iframe>'s current visual content as a scaled down image
          // Note: we can’t capture the content inside iframe, but we can insert a dummy placeholder image
          placeholder = document.createElement("div");
          placeholder.textContent = "PDF Preview (not captured)";
          placeholder.style.width = `${iframe.clientWidth}px`;
          placeholder.style.height = `${iframe.clientHeight}px`;
          placeholder.style.background = "#f0f0f0";
          placeholder.style.display = "flex";
          placeholder.style.alignItems = "center";
          placeholder.style.justifyContent = "center";
          placeholder.style.fontSize = "14px";
          placeholder.style.color = "#888";
        }

        if (placeholder) {
          placeholder.className = "iframe-placeholder";
          placeholder.style.width = `${iframe.clientWidth}px`;
          placeholder.style.height = `${iframe.clientHeight}px`;
          iframeBackups.push({ iframe, placeholder });
          iframe.style.display = "none";
          iframe.parentNode.insertBefore(placeholder, iframe);
        }
      }

      // Generate canvas
      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        windowWidth: canvasElement.scrollWidth,
      });

      // Restore DOM
      controls.forEach((el) => (el.style.display = ""));
      iframeBackups.forEach(({ iframe, placeholder }) => {
        iframe.style.display = "";
        placeholder.remove();
      });

      // Convert to PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = {
        width: pdfWidth,
        height: (canvas.height * pdfWidth) / canvas.width,
      };

      let heightLeft = imgProps.height;
      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgProps.width,
        imgProps.height
      );
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgProps.width,
          imgProps.height
        );
        heightLeft -= pageHeight;
      }

      pdf.save("document.pdf");
    }

    if (action === "generate-link") {
      console.log("Generate link logic here...");
    }
  };

  const handleSaveClick = () => {
    // if (!hasElementsOnCanvas) return;
    setShowSaveOptions(!showSaveOptions);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSaveOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddSignatureBlock = () => {
    if (onAddBlock) {
      const newBlock = {
        id: Date.now(),
        type: "signature",
        settings: {
          width: 400,
          height: 150,
          backgroundColor: "#fff",
          textColor: "#000",
          textAlign: "left",
        },
      };
      onAddBlock(newBlock);
    }
  };

  const handleCloseClick = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmClose = () => {
    localStorage.removeItem("parentId");
    navigate("/");
    setShowConfirmationModal(false);
  };

  const handleModeToggle = (mode) => {
    if (onTogglePreview) {
      onTogglePreview(mode === "preview");
    }
  };

  return (
    <div className="modern-header">
      {/* Left section */}
      <div className="header-left">
        <button
          className="header-btn close-btn"
          onClick={handleCloseClick}
          title="Close"
        >
          <X size={18} />
        </button>
        <button
          className="header-btn sidebar-btn"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        >
          <LayoutDashboard size={18} />
        </button>
        {onNewProposal && (
          <button
            className="new-project-btn"
            onClick={onNewProposal}
            title="New Project"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Center section */}
      {hasElementsOnCanvas && (
        <div className="header-center">
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${!isPreviewMode ? 'active' : ''}`}
              onClick={() => handleModeToggle('edit')}
            >
              <Edit3 size={16} className="me-1" />
              Edit
            </button>
            <button
              type="button"
              className={`mode-btn ${isPreviewMode ? 'active' : ''}`}
              onClick={() => handleModeToggle('preview')}
            >
              <Eye size={16} className="me-1" />
              Preview
            </button>
          </div>
        </div>
      )}

      {/* Right section */}
      <div className="header-right">
        {/* Save Button with Dropdown */}
        <div className="save-container" ref={dropdownRef}>
          <button
            className={`save-btn ${hasElementsOnCanvas ? 'enabled' : 'disabled'}`}
            onClick={handleSaveClick}
            onMouseEnter={() => hasElementsOnCanvas && setShowSaveOptions(true)}
            title="Save Options"
          >
            <Save size={18} />
          </button>

          {showSaveOptions && (
            <div
              className="save-dropdown"
              onMouseLeave={() => setShowSaveOptions(false)}
            >
              <button
                className="dropdown-item"
                onClick={() => handleSaveAction("save-pdf")}
              >
                <Download size={16} />
                <span>Save & Download PDF</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleSaveAction("generate-link")}
              >
                <LinkIcon size={16} />
                <span>Generate Link</span>
              </button>
            </div>
          )}
        </div>

        <button
          className={`review-btn ${hasElementsOnCanvas ? 'enabled' : 'disabled'}`}
          onClick={handleReviewSend}
          title="Review & Send"
        >
          Review & Send
        </button>

        <HeaderSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddBlock={onAddBlock}
          hasSignatureBlock={hasSignatureBlock}
          handleAddSignatureBlock={handleAddSignatureBlock}
          canvasRef={canvasRef}
          blocks={blocks}
          // Pass editing details:
          isEditing={isEditing}
          editProject={editProject}
          parentId={parentId}
          projectId={projectId}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmClose}
          title="Exit Editor"
          message="Are you sure you want to exit the editor? Any unsaved changes will be lost."
          confirmText="Exit"
          cancelText="Cancel"
        />
      </div>

      <style>{`
        .modern-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          position: relative;
          min-height: 64px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .header-btn:hover {
          background: #e2e8f0;
          color: #475569;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .close-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .sidebar-btn:hover {
          background: #f0f9ff;
          color: #0284c7;
        }

        .new-project-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          margin-left: 12px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .new-project-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .new-project-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        .new-project-btn:hover::before {
          left: 100%;
        }

        .new-project-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .header-center {
          display: flex;
          align-items: center;
        }

        .mode-toggle {
          display: flex;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 4px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .mode-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-btn.active {
          background: #ffffff;
          color: #1e293b;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .mode-btn:hover:not(.active) {
          color: #475569;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .save-container {
          position: relative;
        }

        .save-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .save-btn.enabled {
          background: #f1f5f9;
          color: #475569;
        }

        .save-btn.enabled:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .save-btn.disabled {
          background: #f8fafc;
          color: #cbd5e1;
          cursor: not-allowed;
        }

        .save-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          width: 200px;
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .dropdown-item:hover {
          background: #f8fafc;
          color: #1e293b;
        }

        .dropdown-item:first-child {
          border-bottom: 1px solid #f1f5f9;
        }

        .trial-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .trial-text {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
        }

        .trial-progress {
          width: 80px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .trial-progress-bar {
          height: 100%;
          width: 60%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 2px;
          transition: width 0.6s ease;
        }

        .review-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .review-btn.enabled {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #ffffff;
        }

        .review-btn.enabled:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .review-btn.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modern-header {
            padding: 8px 16px;
            gap: 8px;
          }
          
          .header-right {
            gap: 8px;
          }
          
          .trial-info {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HeaderBar;