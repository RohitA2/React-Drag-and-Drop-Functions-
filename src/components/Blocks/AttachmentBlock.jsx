import React, { useRef, useState, useEffect } from "react";
import {
  Paperclip,
  Image,
  FileText,
  FileSpreadsheet,
  File,
  MoreVertical,
  Check,
} from "lucide-react";
import { Dropdown, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { uploadAttachments, removeAttachment, updateAttachment } from "../../store/attachmentSlice";
import { selectedUserId } from "../../store/authSlice";

const getFileIcon = (file) => {
  const type = file.type || "";
  if (type.startsWith("image/")) return <Image size={20} className="text-primary" />;
  if (type === "application/pdf") return <FileText size={20} className="text-danger" />;
  if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return <FileSpreadsheet size={20} className="text-success" />;
  return <File size={20} className="text-muted" />;
};

const AttachmentBlock = ({ blockId, parentId, data, isExisting }) => {
  const dispatch = useDispatch();
  const user_id = useSelector(selectedUserId);
  const { items: storeItems, loading, error } = useSelector((s) => s.attachments);

  // Initialize from existing data if in edit mode
  const getInitialItems = () => {
    if (isExisting && data) {
      const attachments = Array.isArray(data) ? data : [data];
      return attachments.map(att => ({
        id: att.id,
        displayName: att.displayName || att.name || att.filename || "Attachment",
        preview: att.preview || att.url || null,
        type: att.type || att.mimeType || "",
        url: att.url || att.fileUrl || "",
      }));
    }
    return [];
  };

  const [items, setItems] = useState(getInitialItems);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [tempName, setTempName] = useState("");
  const [isInitialized, setIsInitialized] = useState(isExisting || false);

  const fileInputRef = useRef();

  // Initialize from data prop if it loads later
  useEffect(() => {
    if (isExisting && data && !isInitialized) {
      const attachments = Array.isArray(data) ? data : [data];
      const mappedItems = attachments.map(att => ({
        id: att.id,
        displayName: att.displayName || att.name || att.filename || "Attachment",
        preview: att.preview || att.url || null,
        type: att.type || att.mimeType || "",
        url: att.url || att.fileUrl || "",
      }));
      setItems(mappedItems);
      setIsInitialized(true);
      console.log("AttachmentBlock loaded existing data:", mappedItems);
    }
  }, [data, isExisting, isInitialized]);

  // Sync local items with Redux store (only for new items)
  useEffect(() => {
    if (!isInitialized && storeItems.length > 0) {
      setItems(storeItems);
    }
  }, [storeItems, isInitialized]);

  const handleFiles = async (incomingFiles) => {
    const valid = Array.from(incomingFiles).map((f) => ({
      file: f,
      displayName: f.name,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    setItems((prev) => [...prev, ...valid]);
    await dispatch(uploadAttachments({ blockId, user_id, items: valid }));
  };

  const handleFileChange = (e) => handleFiles(e.target.files);
  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => e.preventDefault();

  const removeFile = async (idx) => {
    const itemToRemove = items[idx];
    if (itemToRemove.id) {
      await dispatch(removeAttachment({ id: itemToRemove.id }));
    }
    itemToRemove.preview && URL.revokeObjectURL(itemToRemove.preview);
  };

  const startRenaming = (idx) => {
    setRenamingIndex(idx);
    setTempName(items[idx].displayName);
  };
  const confirmRename = async (idx) => {
    const item = items[idx];
    if (item.id && tempName && tempName !== item.displayName) {
      await dispatch(updateAttachment({ id: item.id, displayName: tempName }));
    }
    setRenamingIndex(null);
  };

  return (
    <div
      className="card shadow-sm border-0 mx-auto"
      style={{ maxWidth: "1800px", width: "100%" }}
    >
      <div className="card-header bg-white border-0">
        <h5 className="mb-0 fw-semibold">Attachments</h5>
      </div>

      {error && <div className="alert alert-danger m-2">{error}</div>}

      {items.length > 0 && (
        <div className="card-body pt-3">
          <div className="d-flex flex-column gap-2">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="d-flex justify-content-between align-items-center border rounded-3 px-3 py-2 bg-white shadow-sm"
                style={{ position: "relative" }}
              >
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  {it.preview ? (
                    <img
                      src={it.preview}
                      alt={it.displayName}
                      style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                    />
                  ) : (
                    getFileIcon({ type: it.mime || "" })
                  )}
                  {renamingIndex === idx ? (
                    <>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ maxWidth: 300 }}
                        onKeyDown={(e) => e.key === "Enter" && confirmRename(idx)}
                      />
                      <button
                        className="btn btn-sm btn-success p-1"
                        onClick={() => confirmRename(idx)}
                        disabled={loading}
                      >
                        <Check size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="fw-medium text-truncate" style={{ maxWidth: 350 }}>
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
                    <Dropdown.Item onClick={() => startRenaming(idx)}>Change name</Dropdown.Item>
                    <Dropdown.Item onClick={() => removeFile(idx)}>Remove</Dropdown.Item>
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
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : <><Paperclip size={16} /> Add files</>}
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