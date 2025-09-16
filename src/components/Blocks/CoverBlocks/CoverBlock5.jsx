import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import EditableQuill from "../HeaderBlocks/EditableQuill";

const DEFAULT_HTML = `
<h1>Process</h1>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere purus rhoncus pulvinar aliquam.</p>
`;

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
        minHeight: "600px",
        border: "1px solid #e3e6e8",
        opacity: isPreview ? 0.6 : 1,
        transform: isPreview ? "scale(0.9)" : "none",
      }}
    >
      <div
        ref={coverRef}
        className="position-relative overflow-hidden border border-0"
        style={{
          width: "100%",
          minHeight: "650px",
          padding: "48px 24px 240px 24px",
        }}
      >
        {/* Background image */}
        <img
          src="/images/cover/rose.jpg"
          alt="cover"
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover", objectPosition: "center", zIndex: 0 }}
        />
        {/* Dark overlay for readability */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.25)", zIndex: 0 }}
        />

        {/* Content card with EditableQuill */}
        <div
          className="mx-auto position-relative"
          style={{ zIndex: 1, width: "72%", maxWidth: "980px" }}
        >
          <div
            className="rounded-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "18px 22px",
              color: "#ffffff",
              backdropFilter: "blur(2px)",
            }}
          >
            <EditableQuill
              id="cover5-content"
              value={content}
              onChange={setContent}
              placeholder="Write heading and optional paragraph..."
              isPreview={isPreview}
              className="text-start"
              style={{
                color: "#ffffff",
                textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                fontSize: "1.1rem",
                lineHeight: 1.5,
              }}
            />
          </div>
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
