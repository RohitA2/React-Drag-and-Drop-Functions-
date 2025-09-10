import React, { useRef, useState } from "react";
import {
  Paperclip,
  FileText,
  Image,
  File,
  FileSpreadsheet,
  MoreVertical,
  Check,
} from "lucide-react";
import { Dropdown, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { uploadAttachments } from "../../store/attachmentSlice";
import { selectedUserId } from "../../store/authSlice"; // adjust to your auth slice

const getFileIcon = (file) => {
  const type = file.type || "";
  if (type.startsWith("image/"))
    return <Image size={20} className="text-primary" />;
  if (type === "application/pdf")
    return <FileText size={20} className="text-danger" />;
  if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return <FileSpreadsheet size={20} className="text-success" />;
  return <File size={20} className="text-muted" />;
};

const AttachmentBlock = ({ blockId }) => {
  const dispatch = useDispatch();
  const user_id = useSelector(selectedUserId);
  const { loading, error } = useSelector((s) => s.attachments);

  const [items, setItems] = useState([]);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [tempName, setTempName] = useState("");

  const fileInputRef = useRef();

  const handleFiles = (incomingFiles) => {
    const valid = Array.from(incomingFiles).map((f) => ({
      file: f,
      displayName: f.name, // default to original
    }));
    setItems((prev) => [...prev, ...valid]);
  };

  const handleFileChange = (e) => handleFiles(e.target.files);
  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => e.preventDefault();

  const removeFile = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));
  const startRenaming = (idx) => {
    setRenamingIndex(idx);
    setTempName(items[idx].displayName);
  };
  const confirmRename = (idx) => {
    const copy = [...items];
    copy[idx].displayName = tempName || copy[idx].file.name;
    setItems(copy);
    setRenamingIndex(null);
  };

  const handleUpload = async () => {
    if (!items.length) return;
    await dispatch(uploadAttachments({ blockId, user_id, items }));
    setItems([]); // clear after upload
  };

  return (
    <div
      className="card shadow-sm border-0 mx-auto"
      style={{ maxWidth: "1800px", width: "100%" }}
    >
      <div className="card-header bg-white border-0 d-flex justify-content-between">
        <h5 className="mb-0 fw-semibold">Attachments</h5>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleUpload}
          disabled={!items.length || loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Upload Files"}
        </button>
      </div>

      {error && <div className="alert alert-danger m-2">{error}</div>}

      {items.length > 0 && (
        <div className="card-body pt-3">
          <div className="d-flex flex-column gap-2">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="d-flex justify-content-between align-items-center border rounded-3 px-3 py-2 bg-white shadow-sm"
              >
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  {getFileIcon(it.file)}
                  {renamingIndex === idx ? (
                    <>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ maxWidth: 300 }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && confirmRename(idx)
                        }
                      />
                      <button
                        className="btn btn-sm btn-success p-1"
                        onClick={() => confirmRename(idx)}
                      >
                        <Check size={16} />
                      </button>
                    </>
                  ) : (
                    <span
                      className="fw-medium text-truncate"
                      style={{ maxWidth: 350 }}
                    >
                      {it.displayName}
                    </span>
                  )}
                </div>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="button"
                    bsPrefix="btn"
                    className="p-1 border-0 bg-transparent shadow-none"
                  >
                    <MoreVertical size={18} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => startRenaming(idx)}>
                      Rename
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => removeFile(idx)}>
                      Remove
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        className="card-body bg-light text-center border-top"
        style={{ padding: "2rem 1rem" }}
      >
        <button
          className="btn btn-light d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 shadow-sm"
          onClick={() => fileInputRef.current.click()}
        >
          <Paperclip size={16} /> Add files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default AttachmentBlock;
