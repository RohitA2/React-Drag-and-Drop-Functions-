import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import EditableQuill from "../HeaderBlocks/EditableQuill";

const DEFAULT_HTML = `
<p>Include a testimonial from a happy client here. The key is to have your client talk about why they enjoyed working with you.</p>
<p><br></p>
<p>- Client Name</p>
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
        minHeight: "400px",
        border: "1px solid #e3e6e8",
        opacity: isPreview ? 0.6 : 1,
        transform: isPreview ? "scale(0.9)" : "none",
      }}
    >
      {/* Cover area */}
      <div
        ref={coverRef}
        className="position-relative rounded-4 overflow-hidden border border-0"
        style={{
          width: "100%",
          minHeight: "400px",
          backgroundColor: "#401C47",
          padding: "48px 24px 220px 24px",
        }}
      >
        {/* Quote card - now in normal flow so the block grows with content */}
        <div
          className="mx-auto"
          style={{
            width: "72%",
            maxWidth: "980px",
          }}
        >
          <div
            className="rounded-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "18px 22px",
              color: "#f3c6ff",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              style={{
                borderLeft: "4px solid rgba(255,255,255,0.25)",
                paddingLeft: "16px",
              }}
            >
              <EditableQuill
                id="cover-quote"
                value={content}
                onChange={setContent}
                placeholder="Write quote..."
                isPreview={isPreview}
                className="text-start"
                style={{ color: "#f3c6ff" }}
              />
            </div>
          </div>
        </div>

        {/* Bottom white band like screenshot */}
        <div
          className="position-absolute start-0 end-0"
          style={{ bottom: 0, height: "180px", background: "#ffffff" }}
        />
      </div>
    </div>
  );
};

export default CoverBlock;
