// src/components/PdfView.jsx
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfView = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState(null);

  if (!fileUrl) return null;

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-white shadow-sm"
      style={{
        width: "100%",
        padding: "20px 20px 0 20px",
        backgroundColor: "#F5F5F5",
      }}
    >
      <div
        style={{
          width: "800px", // fixed width (A4-ish ratio)
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: "10px",
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p className="text-center">Loading PDF...</p>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={780} // keeps ratio inside 800px container
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfView;
