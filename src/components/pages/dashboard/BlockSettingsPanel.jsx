import React from "react";
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
  Image,
  Upload,
} from "lucide-react";

const layoutOptions = [
  { id: "left-panel", icon: <LayoutPanelLeft size={20} /> },
  { id: "right-panel", icon: <LayoutDashboard size={20} /> },
  { id: "top-panel", icon: <LayoutPanelTop size={20} /> },
  { id: "bottom-panel", icon: <LayoutTemplate size={20} /> },
  {
    id: "grid",
    icon: <LayoutGrid size={20} />,
    description: "Content overlays image background",
  },
  {
    id: "default",
    icon: <Layout size={20} />,
  },
];

const BlockSettingsPanel = ({
  activeBlock,
  onClose,
  blockSettings,
  onSettingsChange,
}) => {
  if (!activeBlock) return null;

  const handleLayoutChange = (layoutType) => {
    const updates = { layoutType };
    if (layoutType === "grid") {
      updates.backgroundColor = "transparent";
    }
    onSettingsChange(activeBlock.id, updates);
  };

  const handleColorChange = (field, value) => {
    onSettingsChange(activeBlock.id, { [field]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSettingsChange(activeBlock.id, { backgroundImage: reader.result });
      };
      reader.readAsDataURL(file);
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
      style={{ width: 320, height: "100vh", zIndex: 1040 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Block Settings</h6>
        <button className="btn-close" onClick={onClose} />
      </div>

      {/* Layout Section */}
      <div className="mb-4">
        <p className="fw-bold">Layouts</p>
        <div className="row g-2">
          {layoutOptions.map((layout) => (
            <div key={layout.id} className="col-4">
              <button
                className={`btn w-100 d-flex flex-column align-items-center justify-content-center border rounded p-2 ${
                  blockSettings?.layoutType === layout.id
                    ? "bg-primary text-white"
                    : "bg-light"
                }`}
                style={{ height: 80 }}
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
          <p className="text-muted small mt-2 mb-0">
            {getActiveLayout().description}
          </p>
        )}
      </div>

      <hr />

      {/* Background Section */}
      <div>
        <p className="fw-bold">Background</p>

        {/* Background Image */}
        <div className="mb-3">
          <label className="form-label">Background Image</label>
          <div className="d-flex align-items-center gap-2">
            {blockSettings?.backgroundImage && (
              <div className="position-relative">
                <img
                  src={blockSettings.backgroundImage}
                  alt="Background preview"
                  className="rounded border"
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: "cover",
                    opacity: blockSettings?.imageOpacity || 1,
                  }}
                />
                <label
                  htmlFor="background-image-upload"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                >
                  <Upload size={16} />
                  Upload
                </label>
                <input
                  id="background-image-upload"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleImageUpload}
                />
                <button
                  className="position-absolute top-0 end-0 translate-middle btn btn-sm btn-danger rounded-circle p-0"
                  style={{ width: 16, height: 16 }}
                  onClick={() =>
                    onSettingsChange(activeBlock.id, { backgroundImage: null })
                  }
                >
                  <span className="visually-hidden">Remove image</span>×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Background Color - Disabled for grid layout */}
        <div
          className={`d-flex justify-content-between align-items-center border-bottom py-2 ${
            blockSettings?.layoutType === "grid" ? "opacity-50" : ""
          }`}
        >
          <label className="form-label mb-0">Background color</label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            value={blockSettings?.backgroundColor || "#2d5000"}
            onChange={(e) =>
              handleColorChange("backgroundColor", e.target.value)
            }
            style={{ width: 36, height: 36 }}
            disabled={blockSettings?.layoutType === "grid"}
          />
        </div>

        {/* Text Color */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-2">
          <label className="form-label mb-0">Text color</label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            value={blockSettings?.textColor || "#ffffff"}
            onChange={(e) => handleColorChange("textColor", e.target.value)}
            style={{ width: 36, height: 36 }}
          />
        </div>

        {/* Text Alignment */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-2">
          <label className="form-label mb-0">Text align</label>
          <div className="btn-group" role="group" aria-label="Text align">
            {["left", "center", "right"].map((align) => {
              const icons = {
                left: <AlignLeft size={16} />,
                center: <AlignCenter size={16} />,
                right: <AlignRight size={16} />,
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
                  onClick={() => handleColorChange("textAlign", align)}
                >
                  {icons[align]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Image Opacity - Only when image exists */}
        {blockSettings?.backgroundImage && (
          <div className="d-flex justify-content-between align-items-center border-bottom py-2">
            <label className="form-label mb-0">Image opacity</label>
            <input
              type="range"
              className="form-range"
              min="0.1"
              max="1"
              step="0.1"
              value={blockSettings?.imageOpacity || 0.8}
              onChange={(e) =>
                handleColorChange("imageOpacity", e.target.value)
              }
              style={{ width: "60%" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockSettingsPanel;
