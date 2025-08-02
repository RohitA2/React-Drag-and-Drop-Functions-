import { useRef, useState } from "react";
import { Paperclip, X, FileText, Image, File } from "lucide-react";

const getFileIcon = (file) => {
  const type = file.type;
  if (type.startsWith("image/"))
    return <Image size={18} className="text-primary" />;
  if (type === "application/pdf")
    return <FileText size={18} className="text-danger" />;
  return <File size={18} className="text-muted" />;
};

const AttachmentBlock = ({ id, onRemove }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (incomingFiles) => {
    const validFiles = Array.from(incomingFiles);
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card shadow-sm rounded-4 border-0"
    style={{ maxWidth: "1400px", width: "100%" }}>
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center bg-white border-0">
        <h3 className="mb-0 d-flex align-items-center gap-2 fw-semibold fs-5">
          {/* <Paperclip size={18} className="text-secondary" /> */}
          Attachments
        </h3>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        className="card-body bg-light text-center border-top"
        style={{ padding: "3rem 1rem" }}
      >
        <button
          className="btn btn-light d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 shadow-sm w-50"
          onClick={() => fileInputRef.current.click()}
        >
          <Paperclip size={16} />
          Upload file
        </button>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          hidden
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="card-body border-top pt-3 pb-4">
          <div className="d-flex flex-column gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center bg-body-tertiary border rounded-3 px-3 py-2"
              >
                <div className="d-flex align-items-center gap-2">
                  {getFileIcon(file)}
                  <span className="text-truncate" style={{ maxWidth: 250 }}>
                    {file.name}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-light p-1"
                  onClick={() => removeFile(index)}
                  title="Remove file"
                >
                  <X size={16} className="text-danger" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentBlock;
