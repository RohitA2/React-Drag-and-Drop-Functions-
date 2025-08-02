import React from "react";

const BlockSettingsPanel = ({ activeBlock, onClose }) => {
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

      <div>
        <p className="fw-bold">Layouts</p>
        {/* Render your layout buttons here like in your screenshot */}

        <hr />
        <p className="fw-bold">Background</p>
        <img
          src="/path/to/bg.jpg"
          alt="bg"
          className="img-fluid rounded mb-2"
        />

        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="bgFilter" />
          <label className="form-check-label" htmlFor="bgFilter">
            Background filter
          </label>
        </div>

        <div className="my-2">
          <label className="form-label">Background color</label>
          <input
            type="color"
            className="form-control form-control-color"
            defaultValue="#558B2F"
          />
        </div>

        <div className="my-2">
          <label className="form-label">Text color</label>
          <input
            type="color"
            className="form-control form-control-color"
            defaultValue="#000000"
          />
        </div>

        <div className="my-2">
          <label className="form-label">Text align</label>
          <div className="btn-group w-100">
            <button className="btn btn-outline-secondary active">L</button>
            <button className="btn btn-outline-secondary">C</button>
            <button className="btn btn-outline-secondary">R</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockSettingsPanel;
