import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

const PDFBlock = ({ id, onRemove }) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") {
      const fileURL = URL.createObjectURL(file);
      setEmbedUrl(fileURL);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (embedUrl) {
        URL.revokeObjectURL(embedUrl);
      }
    };
  }, [embedUrl]);

  return (
    <div
      className="position-relative bg-white border rounded-3 shadow-sm overflow-hidden mb-4"
      style={{ maxWidth: "1400px", width: "100%" }}
    >
      {/* Upload prompt */}
      {!embedUrl && (
        <div className="d-flex justify-content-center align-items-center bg-light p-5">
          <div
            className="d-flex align-items-center bg-white p-3 rounded shadow-sm w-100"
            style={{ maxWidth: 600 }}
          >
            <img
              src="images/pdf.png"
              alt="PDF"
              style={{ width: 40, height: 40 }}
              className="me-3"
            />
            <div className="flex-grow-1">
              <div className="fw-semibold mb-1">PDF</div>
              <div className="text-muted small">
                Click to upload and preview
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="btn btn-primary"
            >
              Upload PDF
            </button>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              hidden
            />
          </div>
        </div>
      )}

      {/* Embedded PDF Preview */}
      {embedUrl && (
        <div
          style={{
            width: "100%",
            aspectRatio: "8.5 / 11", // for A4-like view
            overflow: "hidden",
          }}
        >
          <iframe
            src={`${embedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title="PDF Preview"
            width="100%"
            height="100%"
            style={{
              border: "none",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PDFBlock;
