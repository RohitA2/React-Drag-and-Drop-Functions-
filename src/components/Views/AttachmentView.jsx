// src/components/AttachmentView.jsx
import React from "react";
import {
  FileText,
  Image as ImageIcon,
  File,
  FileSpreadsheet,
  Download,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL; // backend base

// 🔹 Decide which icon to show
const getFileIcon = (mime) => {
  if (!mime) return <File size={20} className="text-muted" />;

  if (mime.startsWith("image/"))
    return <ImageIcon size={20} className="text-primary" />;
  if (mime === "application/pdf")
    return <FileText size={20} className="text-danger" />;
  if (
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return <FileSpreadsheet size={20} className="text-success" />;

  return <File size={20} className="text-muted" />;
};

const AttachmentView = ({ attachments = [] }) => {
  if (!attachments.length) return null;

  return (
    <div
      className="card shadow-sm  border-0 mx-auto"
      style={{
        maxWidth: "1400px",
        width: "100%",
        minHeight: "450px",
        border: "1px solid #e0e7ff",
      }}
    >
      <div className="card-header bg-white border-0">
        <h5 className="mb-0 fw-semibold">Attachments</h5>
      </div>

      <div className="card-body pt-3">
        <div className="d-flex flex-column gap-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="d-flex justify-content-between align-items-center border rounded-3 px-3 py-2 bg-white shadow-sm"
            >
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                {getFileIcon(file.mime)}
                <span
                  className="fw-medium text-truncate"
                  style={{ maxWidth: 400 }}
                  title={file.displayName}
                >
                  {file.displayName || file.originalName}
                </span>
              </div>

              {/* Download link */}
              <a
                href={`${API_BASE}${file.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-light btn-sm d-flex align-items-center gap-1"
              >
                <Download size={16} /> Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttachmentView;
