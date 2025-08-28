import React, { useState, useRef } from "react";
import {
  Layout,
  LayoutPanelLeft,
  LayoutPanelTop,
  LayoutDashboard,
  LayoutTemplate,
  LayoutGrid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
} from "lucide-react";
import { Modal, Button } from "react-bootstrap";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const layoutOptions = [
  { id: "left-panel", icon: <LayoutPanelLeft size={18} />, label: "Left" },
  { id: "right-panel", icon: <LayoutDashboard size={18} />, label: "Right" },
  { id: "top-panel", icon: <LayoutPanelTop size={18} />, label: "Top" },
  { id: "bottom-panel", icon: <LayoutTemplate size={18} />, label: "Bottom" },
  {
    id: "grid",
    icon: <LayoutGrid size={18} />,
    label: "Grid",
    description: "Content overlays image background",
  },
  {
    id: "default",
    icon: <Layout size={18} />,
    label: "Default",
  },
];

const BlockSettingsPanel = ({
  activeBlock,
  onClose,
  block,
  onSettingsChange,
  isPreview = false,
}) => {
  if (!activeBlock || !block) return null;

  const blockSettings = block?.settings || {};
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const cropperRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleLayoutChange = async (layoutType) => {
    const updates = { layoutType };
    if (layoutType === "grid") {
      updates.backgroundColor = blockSettings.backgroundColor;
    }

    // Update local state
    onSettingsChange(activeBlock.id, updates);

    // Send to API
    try {
      await axios.put(`${API_URL}/api/headerBlock/${activeBlock.id}`, {
        ...blockSettings,
        layoutType,
        id: activeBlock.id,
        userId: activeBlock.userId || blockSettings.userId,
      });
      console.log("Layout updated in backend:", layoutType);
    } catch (err) {
      console.error("Error updating layout in backend:", err.message);
    }
  };

  const handleColorChange = async (field, value) => {
    const updates = { [field]: value };

    // If filter color is selected, remove the image
    if (field === "backgroundFilter") {
      updates.backgroundImage = null;
    }

    // Update local state
    onSettingsChange(activeBlock.id, updates);

    // Send to API
    try {
      await axios.put(`${API_URL}/api/headerBlock/${activeBlock.id}`, {
        ...blockSettings,
        [field]: value,
        layoutType: blockSettings.layoutType,
        id: activeBlock.id,
        userId: activeBlock.userId || blockSettings.userId,
      });
      console.log(`${field} updated in backend:`, value);
    } catch (err) {
      console.error(`Error updating ${field} in backend:`, err.message);
    }
  };

  const handleCropSave = async () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("file", blob, "cropped.png");

        try {
          // Upload cropped image
          const res = await axios.post(`${API_URL}/upload/img`, formData);
          const data = res.data;

          if (data.success) {
            // Update parent state
            onSettingsChange(activeBlock.id, {
              backgroundImage: data.url,
              backgroundFilter: null,
            });

            // Save to backend with layout info
            try {
              await axios.put(`${API_URL}/api/headerBlock/${activeBlock.id}`, {
                ...blockSettings,
                backgroundImage: data.url,
                backgroundFilter: null,
                layoutType: blockSettings.layoutType,
                id: activeBlock.id,
                userId: activeBlock.userId || blockSettings.userId,
              });

              console.log(
                "Header block updated with new background and layout info."
              );
            } catch (err) {
              console.error("Error saving to backend:", err.message);
            }
          }
        } catch (err) {
          console.error("Error uploading background:", err.message);
        }

        setCropModalOpen(false);
      }, "image/png");
    }
  };

  const getActiveLayout = () => {
    return (
      layoutOptions.find((layout) => layout.id === blockSettings?.layoutType) ||
      layoutOptions.find((layout) => layout.id === "default")
    );
  };

  return (
    <div
      className="position-fixed top-0 end-0 bg-white shadow p-3"
      style={{ width: 240, height: "100vh", zIndex: 1040 }}
    >
      <div className="text-end">
        <button
          className="btn-close"
          onClick={onClose}
          style={{ transform: "scale(0.8)" }}
        />
      </div>

      {/* Layout Section */}
      <div className="mb-3">
        <p className="fw-bold" style={{ fontSize: "0.85rem" }}>
          Layouts
        </p>
        <div className="row g-2">
          {layoutOptions.map((layout) => (
            <div key={layout.id} className="col-4">
              <button
                className={`btn w-100 d-flex flex-column align-items-center justify-content-center border rounded p-0 ${
                  blockSettings?.layoutType === layout.id
                    ? "bg-primary text-white"
                    : "bg-light"
                }`}
                style={{
                  height: 36,
                  cursor: "pointer",
                  fontSize: "0.6rem",
                  gap: "2px",
                  minWidth: 40,
                }}
                onClick={() => handleLayoutChange(layout.id)}
                title={layout.description}
              >
                {layout.icon}
              </button>
            </div>
          ))}
        </div>
        {getActiveLayout()?.description && (
          <p
            className="text-muted small mt-2 mb-0"
            style={{ fontSize: "0.7rem" }}
          >
            {getActiveLayout().description}
          </p>
        )}
      </div>

      <hr className="my-2" />

      {/* Background Section */}
      <div>
        <p className="fw-bold" style={{ fontSize: "0.85rem" }}>
          Background
        </p>
        {/* Background Preview */}
        <div className="mb-3">
          <div className="d-flex flex-column gap-2">
            {blockSettings?.backgroundImage ||
            blockSettings?.backgroundFilter ? (
              <div className="position-relative">
                <div
                  className="rounded border overflow-hidden position-relative"
                  style={{
                    height: 120,
                    backgroundColor:
                      blockSettings?.backgroundFilter || "#f8f9fa",
                    backgroundImage: blockSettings?.backgroundFilter
                      ? "none"
                      : blockSettings?.backgroundImage
                      ? `url(${blockSettings.backgroundImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {blockSettings?.backgroundImage &&
                    !blockSettings?.backgroundFilter && (
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                      >
                        <label
                          htmlFor="background-image-upload"
                          className="btn btn-light btn-sm d-flex align-items-center gap-1"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <Upload size={14} />
                          Change Image
                        </label>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <label
                htmlFor="background-image-upload"
                className="border rounded d-flex flex-column align-items-center justify-content-center py-3"
                style={{
                  height: 100,
                  cursor: "pointer",
                  borderStyle: "dashed",
                  backgroundColor: "rgba(0,0,0,0.05)",
                }}
              >
                <Upload size={18} className="mb-1" />
                <span style={{ fontSize: "0.8rem" }}>Upload Background</span>
              </label>
            )}
            <input
              id="background-image-upload"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleImageUpload}
            />
          </div>

          {/* Crop Modal */}
          {!isPreview && (
            <Modal
              show={cropModalOpen}
              onHide={() => setCropModalOpen(false)}
              centered
              size="lg"
              backdrop="static"
              keyboard={false}
            >
              <Modal.Body>
                {imageSrc && (
                  <Cropper
                    src={imageSrc}
                    style={{ height: 500, width: "100%" }}
                    initialAspectRatio={1}
                    guides={true}
                    viewMode={1}
                    background={false}
                    responsive={true}
                    autoCropArea={1}
                    checkOrientation={false}
                    ref={cropperRef}
                  />
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setCropModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCropSave}>Save</Button>
              </Modal.Footer>
            </Modal>
          )}
        </div>

        {/* Background filter */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-1">
          <label className="form-label mb-0" style={{ fontSize: "0.8rem" }}>
            Background filter
          </label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            value={blockSettings?.backgroundFilter || "#2d5000"}
            onChange={(e) =>
              handleColorChange("backgroundFilter", e.target.value)
            }
            style={{ width: 30, height: 30 }}
          />
        </div>

        {/* Background Color - Disabled for grid layout */}
        <div
          className={`d-flex justify-content-between align-items-center border-bottom py-1 ${
            blockSettings?.layoutType === "grid" ? "opacity-50" : ""
          }`}    
        >
          <label className="form-label mb-0" style={{ fontSize: "0.8rem" }}>
            Background color
          </label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            value={blockSettings?.backgroundColor || "#2d5000"}
            onChange={(e) =>
              handleColorChange("backgroundColor", e.target.value)
            }
            style={{ width: 30, height: 30 }}
            disabled={blockSettings?.layoutType === "grid"}
          />
        </div>

        {/* Text Color */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-1">
          <label className="form-label mb-0" style={{ fontSize: "0.8rem" }}>
            Text color
          </label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            value={blockSettings?.textColor || "#ffffff"}
            onChange={(e) => handleColorChange("textColor", e.target.value)}
            style={{ width: 30, height: 30 }}
          />
        </div>

        {/* Text Alignment */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-1">
          <label
            className="form-label mb-0"
            style={{ fontSize: "0.75rem", marginRight: "0.5rem" }}
          >
            Text align
          </label>

          <div
            className="btn-group btn-group-sm"
            role="group"
            aria-label="Text align"
          >
            {["left", "center", "right"].map((align) => {
              const icons = {
                left: <AlignLeft size={14} />,
                center: <AlignCenter size={14} />,
                right: <AlignRight size={14} />,
              };
              return (
                <button
                  key={align}
                  type="button"
                  className={`btn ${
                    blockSettings?.textAlign === align
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={async () => {
                    // Update local state
                    onSettingsChange(activeBlock.id, { textAlign: align });

                    // Send to API
                    try {
                      await axios.put(
                        `${API_URL}/api/headerBlock/${activeBlock.id}`,
                        {
                          ...blockSettings,
                          textAlign: align,
                          layoutType: blockSettings.layoutType,
                          id: activeBlock.id,
                          userId: activeBlock.userId || blockSettings.userId,
                        }
                      );
                      console.log("Text alignment updated in backend:", align);
                    } catch (err) {
                      console.error(
                        "Error updating text alignment in backend:",
                        err.message
                      );
                    }
                  }}
                  style={{
                    padding: "0.15rem 0.35rem",
                    minWidth: "26px",
                  }}
                >
                  {icons[align]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockSettingsPanel;
