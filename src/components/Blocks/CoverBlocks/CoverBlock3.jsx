import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import EditableQuill from "../HeaderBlocks/EditableQuill";

const DEFAULT_HTML = `<h1>Our Work</h1>`;

const CoverBlock = ({ isPreview = false }) => {
  const [content, setContent] = useState(DEFAULT_HTML);
  const coverRef = useRef(null);

  const exportAsImage = async () => {
    if (!coverRef.current) return;
    const canvas = await html2canvas(coverRef.current, {
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement("a");
    link.download = "cover.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div
      className={`position-relative bg-white border shadow-sm p-4 ${
        isPreview ? "pointer-events-none" : ""
      }`}
      style={{
        maxWidth: "1800px",
        width: "100%",
        minHeight: "400px",
        border: "1px solid #e3e6e8",
        opacity: isPreview ? 0.6 : 1,
        transform: isPreview ? "scale(0.9)" : "none",
      }}
    >
      {/* Cover area with video background */}
      <div
        ref={coverRef}
        className="position-relative overflow-hidden border border-0"
        style={{
          width: "100%",
          minHeight: "400px",
          padding: "48px 24px 240px 24px",
        }}
      >
        <video
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover", zIndex: 0 }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={(e) => console.warn("Video failed to load:", e)}
        >
          <source
            src="/images/cover/sky.webm"
            type="video/webm"
            crossOrigin="anonymous"
          />
          <source
            src="/images/cover/video.mp4"
            type="video/mp4"
            crossOrigin="anonymous"
          />
        </video>

        {/* Title - normal flow so area grows with content */}
        <div
          className="px-3 position-relative"
          style={{ zIndex: 1, width: "72%", maxWidth: "980px" }}
        >
          <EditableQuill
            id="cover3-title"
            value={content}
            onChange={setContent}
            placeholder="Write title..."
            isPreview={isPreview}
            className="text-start"
            style={{
              color: "#ffffff",
              textShadow: "2px 2px 6px rgba(0,0,0,0.55)",
              fontSize: "4rem",
              lineHeight: 1.1,
              fontWeight: 700,
            }}
          />
        </div>

        {/* Bottom white band */}
        <div
          className="position-absolute start-0 end-0"
          style={{ bottom: 0, height: "220px", background: "#ffffff" }}
        />
      </div>
    </div>
  );
};

export default CoverBlock;
