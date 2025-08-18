import {
  X,
  LayoutDashboard,
  Save,
  Download,
  Link as LinkIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import HeaderSidebar from "./HeaderSidebar";

const HeaderBar = ({ toggleSidebar, hasElementsOnCanvas, canvasRef }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();


   const handleReviewSend = () => {
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

  return (
    <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-[#E8EAED] border-bottom w-100 shadow-sm position-relative">
      {/* Left section */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-[#E8EAED] hover:bg-[#F4FBFA]"
          onClick={() => navigate("/")}
        >
          <X size={16} />
        </button>
        <button
          className="btn btn-sm btn-[#E8EAED] hover:bg-[#F4FBFA]"
          onClick={toggleSidebar}
        >
          <LayoutDashboard size={16} />
        </button>
      </div>

      {/* Center section */}
      {hasElementsOnCanvas && (
        <div className="btn-group btn-group-sm btn-group-toggle font-size-12 font-weight-bold px-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary active"
          >
            Edit
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary">
            Preview
          </button>
        </div>
      )}

      {/* Right section */}
      <div className="d-flex align-items-center gap-4">
        {/* Save Button with Dropdown */}
        <div className="position-relative" ref={dropdownRef}>
          <button
            className="btn btn-sm btn-[#E8EAED] hover:bg-[#F4FBFA] position-relative"
            style={{ width: "32px", height: "32px" }}
            onClick={handleSaveClick}
            onMouseEnter={() => setShowSaveOptions(true)}
          >
            <Save size={16} />
          </button>

          {showSaveOptions && (
            <div
              className="position-absolute end-0 mt-1 bg-white rounded shadow-sm border"
              style={{ width: "180px", zIndex: 1000 }}
              onMouseLeave={() => setShowSaveOptions(false)}
            >
              <button
                className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 border-0 hover:bg-[#F4FBFA] transition-all"
                onClick={() => handleSaveAction("save-pdf")}
              >
                <Download size={14} className="text-muted" />
                <span>Save & Download PDF</span>
              </button>
              <button
                className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 border-0 hover:bg-[#F4FBFA] transition-all"
                onClick={() => handleSaveAction("generate-link")}
              >
                <LinkIcon size={14} className="text-muted" />
                <span>Generate Link</span>
              </button>
            </div>
          )}
        </div>

        {/* Remaining right section elements */}
        <div className="d-flex flex-column align-items-end font-size-12 font-weight-bold">
          <small className="text-muted mb-1">11 days left</small>
          <div
            className="progress"
            style={{ width: "80px", height: "4px", backgroundColor: "#438EA0" }}
          >
            <div
              className="progress-bar bg-color[#438EA0]"
              role="progressbar"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        <button className="btn bg-[#438EA0] text-white btn-sm hover:bg-[#32707F]"   onClick={handleReviewSend}>
          Review & Send
        </button>

         <HeaderSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      </div>

      <style>{`
        .d-flex.gap-3 {
          gap: 0.75rem !important;
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
        }
        .progress-bar {
          transition: width 0.6s ease;
        }
        .hover\:bg-\[\#F4FBFA\]:hover {
          background-color: #f4fbfa;
        }
        .transition-all {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default HeaderBar;
