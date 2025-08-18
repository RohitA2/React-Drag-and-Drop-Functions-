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

const layoutOptions = [
  { id: "left-panel", icon: <LayoutPanelLeft size={18} /> },
  { id: "right-panel", icon: <LayoutDashboard size={18} /> },
  { id: "top-panel", icon: <LayoutPanelTop size={18} /> },
  { id: "bottom-panel", icon: <LayoutTemplate size={18} /> },
  {
    id: "grid",
    icon: <LayoutGrid size={18} />,
    description: "Content overlays image background",
  },
  {
    id: "default",
    icon: <Layout size={18} />,
  },
];

const BlockSettingsPanel = ({
  activeBlock,
  onClose,
  blockSettings,
  onSettingsChange,
  isPreview = false,
}) => {
  if (!activeBlock) return null;

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const cropperRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      onSettingsChange(activeBlock.id, {
        backgroundImage: croppedImage,
        backgroundFilter: null, // image upload hone pe filter hata do
      });
      setCropModalOpen(false);
      setImageSrc(null);
    }
  };

  const handleLayoutChange = (layoutType) => {
    const updates = { layoutType };
    if (layoutType === "grid") {
      updates.backgroundColor = blockSettings.backgroundColor;
    }
    onSettingsChange(activeBlock.id, updates);
  };

  const handleColorChange = (field, value) => {
    const updates = { [field]: value };

    // agar filter color select kiya, to image hata do
    if (field === "backgroundFilter") {
      updates.backgroundImage = null;
    }

    onSettingsChange(activeBlock.id, updates);
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
                className={`btn w-100 d-flex flex-column align-items-center justify-content-center border rounded p-1 ${
                  blockSettings?.layoutType === layout.id
                    ? "bg-primary text-white"
                    : "bg-light"
                }`}
                style={{ height: 45, cursor: "pointer", fontSize: "0.7rem" }}
                onClick={() => handleLayoutChange(layout.id)}
                title={layout.description}
              >
                {layout.icon}
                <small className="mt-1">{layout.label}</small>
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
                  {/* Agar image hai aur filter nahi hai to "Change Image" overlay dikhao */}
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
              onHide={() => {}}
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
          <label className="form-label mb-0" style={{ fontSize: "0.8rem" }}>
            Text align
          </label>
          <div className="btn-group" role="group" aria-label="Text align">
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
                  className={`btn btn-sm ${
                    blockSettings?.textAlign === align
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    onSettingsChange(activeBlock.id, { textAlign: align })
                  }
                  style={{ padding: "0.15rem 0.3rem" }}
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