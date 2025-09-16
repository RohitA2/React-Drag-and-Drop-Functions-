import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import EditableQuill from "../HeaderBlocks/EditableQuill";

const DEFAULT_HTML = `<h1>Our work</h1>`;

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
      {/* Cover area */}
      <div
        ref={coverRef}
        className="position-relative  overflow-hidden border border-0"
        style={{
          width: "100%",
          minHeight: "600px",
          padding: "48px 24px 240px 24px",
        }}
      >
        <img
          src="images/people2.avif"
          alt="cover"
          className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
          style={{ objectPosition: "center", zIndex: 0 }}
        />

        {/* Big title - in normal flow so height grows with content */}
        <div
          className="px-3 position-relative"
          style={{ zIndex: 1, width: "72%", maxWidth: "980px" }}
        >
          <EditableQuill
            id="cover2-title"
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

        {/* Bottom white band like screenshot */}
        <div
          className="position-absolute start-0 end-0"
          style={{ bottom: 0, height: "100px", background: "#ffffff" }}
        />
      </div>
    </div>
  );
};

export default CoverBlock;
