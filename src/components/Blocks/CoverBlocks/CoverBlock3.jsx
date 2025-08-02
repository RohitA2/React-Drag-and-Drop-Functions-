import { useState, useRef } from "react";
import html2canvas from "html2canvas";

const CoverBlock = ({ isPreview = false }) => {
  const [title, setTitle] = useState("Type something...");
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
      className={`position-relative bg-white border rounded-4 shadow-sm p-4 mb-4 ${
        isPreview ? "pointer-events-none" : ""
      }`}
      style={{
        maxWidth: "1400px",
        width: "100%",
        minHeight: "400px",
        border: "1px solid #e3e6e8",
        opacity: isPreview ? 0.6 : 1,
        transform: isPreview ? "scale(0.9)" : "none",
      }}
    >
      {/* Cover Preview */}
      <div
        ref={coverRef}
        className="position-relative rounded-4 overflow-hidden border border-2"
        style={{ width: "100%", height: "400px" }}
      >
        <img
          src="images/sky.webp"
          alt="cover"
          className="w-100 h-100 object-fit-cover"
          style={{ objectPosition: "center" }}
        />

        <div className="position-absolute top-50 start-50 translate-middle text-center px-3 w-100">
          <input
            type="text"
            className="form-control border-0 bg-transparent text-center fw-bold"
            placeholder="Type something..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPreview}
            style={{
              fontSize: "3rem",
              color: "#ffffff",
              textShadow: "2px 2px 5px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverBlock;
