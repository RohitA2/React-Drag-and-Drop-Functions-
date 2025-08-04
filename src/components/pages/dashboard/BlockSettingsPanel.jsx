import React from "react";
import {
  Layout,
  LayoutPanelLeft,
  LayoutPanelTop,
  LayoutDashboard,
  LayoutTemplate,
  LayoutGrid,
} from "lucide-react";

const layoutOptions = [
  { id: "left-panel", icon: <LayoutPanelLeft size={20} />, label: "Left" },
  { id: "right-panel", icon: <LayoutDashboard size={20} />, label: "Right" },
  { id: "top-panel", icon: <LayoutPanelTop size={20} />, label: "Top" },
  { id: "bottom-panel", icon: <LayoutTemplate size={20} />, label: "Bottom" },
  {
    id: "grid",
    icon: <LayoutGrid size={20} />,
    label: "Grid",
    description: "Content overlays image background",
  },
  { id: "default", icon: <Layout size={20} />, label: "Default" },
];

const BlockSettingsPanel = ({
  activeBlock,
  onClose,
  blockSettings,
  onSettingsChange,
}) => {
  if (!activeBlock) return null;

  const handleLayoutChange = (layoutType) => {
    // Reset background color for grid layout
    const updates = { layoutType };
    if (layoutType === "grid") {
      updates.backgroundColor = "transparent";
    }
    onSettingsChange(activeBlock.id, updates);
  };

  const handleColorChange = (field, value) => {
    onSettingsChange(activeBlock.id, { [field]: value });
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

        {/* Background Image Opacity - Only for grid layout */}
        {blockSettings?.layoutType === "grid" && (
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
