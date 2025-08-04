import React from "react";
import {
  Layout,
  LayoutPanelLeft,
  LayoutPanelTop,
  LayoutDashboard,
  LayoutTemplate,
} from "lucide-react";

const layoutOptions = [
  { id: "left-panel", icon: <LayoutPanelLeft size={20} />, label: "Left" },
  { id: "top-panel", icon: <LayoutPanelTop size={20} />, label: "Top" },
  { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { id: "template", icon: <LayoutTemplate size={20} />, label: "Template" },
  { id: "default", icon: <Layout size={20} />, label: "Default" },
  { id: "custom", icon: <Layout size={20} />, label: "Custom" },
];

const BlockSettingsPanel = ({
  activeBlock,
  onClose,
  layoutType,
  setLayoutType,
}) => {
  if (!activeBlock) return null;

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
                className={`btn w-100 d-flex align-items-center justify-content-center border rounded p-2 ${
                  layoutType === layout.id
                    ? "bg-primary text-white"
                    : "bg-light"
                }`}
                style={{ height: 60 }}
                onClick={() => setLayoutType(layout.id)}
                title={layout.label}
              >
                {layout.icon}
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr />

      {/* Background Section */}
      <div>
        <p className="fw-bold">Background</p>
        <img
          src="images/bird.jpg"
          alt="bg"
          className="img-fluid rounded mb-3"
        />

        {/* Background Filter */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-2">
          <label className="form-label mb-0">Background filter</label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            defaultValue="#C4FBFB"
            style={{ width: 36, height: 36 }}
          />
        </div>

        {/* Background Color */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-2">
          <label className="form-label mb-0">Background color</label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            defaultValue="#558B2F"
            style={{ width: 36, height: 36 }}
          />
        </div>

        {/* Text Color */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-2">
          <label className="form-label mb-0">Text color</label>
          <input
            type="color"
            className="form-control form-control-color border rounded-circle"
            defaultValue="#ffffff"
            style={{ width: 36, height: 36 }}
          />
        </div>

        {/* Text Align */}
        <div className="d-flex justify-content-between align-items-center border-bottom py-2">
          <label className="form-label mb-0">Text align</label>
          <div className="btn-group">
            <button className="btn btn-primary">
              {" "}
              {/* Active */}
              <i className="bi bi-text-left"></i>
            </button>
            <button className="btn btn-outline-secondary">
              <i className="bi bi-text-center"></i>
            </button>
            <button className="btn btn-outline-secondary">
              <i className="bi bi-text-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockSettingsPanel;
