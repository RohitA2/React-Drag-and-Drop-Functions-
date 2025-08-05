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
      style={{ width: 240, height: "100vh", zIndex: 1040 }}
    >
      <div className="text-end">
        {" "}
        {/* Right-aligns the close button */}
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
        {/* Background Image */}
        <div className="mb-3">
          <div className="d-flex flex-column gap-2">
            {blockSettings?.backgroundImage ? (
              <div className="position-relative">
                <div
                  className="rounded border overflow-hidden position-relative"
                  style={{
                    height: 120,
                    backgroundImage: `url(${blockSettings.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: blockSettings?.imageOpacity || 1,
                  }}
                >
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
        </div>

        {/* Background filter */}
        {/* if i choose a filter then this is show on the image */}
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
                  onClick={() => handleColorChange("textAlign", align)}
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
