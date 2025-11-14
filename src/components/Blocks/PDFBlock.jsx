import { useRef, useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { selectedUserId } from "../../store/authSlice";
import { uploadPdf } from "../../store/pdfSlice";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const API_URL = import.meta.env.VITE_API_URL; // http://localhost:5000

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFBlock = ({ blockId, parentId, initialPdfUrl }) => {
  const user_id = useSelector(selectedUserId);
  const [file, setFile] = useState(null);
  const [existingUrl, setExistingUrl] = useState(initialPdfUrl || null);
  const [numPages, setNumPages] = useState(null);
  const fileInputRef = useRef(null);

  console.log("i am parentId from pdf block", parentId);

  // Modal states
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile?.type === "application/pdf") {
      setFile(uploadedFile);
      setExistingUrl(null); // switching to a new local file
      setShowModal(true); // open modal to confirm save
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Save PDF to backend
  const dispatch = useDispatch();
  const handleSave = async () => {
    if (!file) return;
    try {
      const result = await dispatch(
        uploadPdf({ blockId, parentId, user_id, file })
      ).unwrap();

      console.log("Uploaded PDF result:", result);
      console.log("PDF ID:", result.id);
      console.log("PDF parent ID:", result.parentId);

      // ✅ Save PDF ID into localStorage
      localStorage.setItem("lastUploadedPdfId", result.id);

      setShowModal(false);
    } catch (err) {
      console.error("Error uploading PDF:", err);
    }
  };

  return (
    <div
      className="position-relative bg-white border shadow-sm overflow-hidden"
      style={{ maxWidth: "1800px", width: "100%" }}
    >
      {/* Upload prompt */}
      {!file && !existingUrl && (
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

      {/* PDF Preview */}
      {(file || existingUrl) && (
        <div className="position-relative d-flex justify-content-center bg-light p-4">
          <div
            style={{
              width: "600px", // adjust size here
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: "2px",
              padding: "10px",
              position: "relative",
              overflow: "hidden",
            }}
            className="pdf-container group"
          >
            {/* 🔹 Hover Overlay */}
            <div
              className="position-absolute top-0 start-0 w-100 d-flex align-items-center justify-content-between px-3 py-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderBottom: "1px solid #ddd",
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px",
                transition: "opacity 0.3s ease",
                opacity: 0,
                zIndex: 999,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = 1;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = 0;
              }}
            >
              <div className="d-flex align-items-center">
                <img
                  src="images/pdf.png"
                  alt="PDF"
                  style={{ width: 24, height: 24 }}
                  className="me-2"
                />
                <div>
                  <div className="fw-semibold">PDF</div>
                  <div className="text-muted small">
                    Embedded – {numPages || 0} pages
                  </div>
                </div>
              </div>
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => fileInputRef.current.click()}
              >
                Change file
              </button>
            </div>

            {/* PDF Pages */}
            <Document
              file={file || `${API_URL}${existingUrl}`}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={580}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </Document>

            {/* Hidden file input */}
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

      {/* Modal for Save */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to save this PDF block?
          <br />
          <strong>BlockId:</strong> {blockId} <br />
          <strong>UserId:</strong> {user_id}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <style>
        {`
       .pdf-container:hover > div:first-child {
          opacity: 1 !important;
        }
      `}
      </style>
    </div>
  );
};

export default PDFBlock;
