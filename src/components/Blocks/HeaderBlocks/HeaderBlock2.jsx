import React, { useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { X } from "lucide-react";

const HeaderBlock = ({
  id,
  onSettingsChange,
  title: initialTitle = "Sales Proposal",
  subtitle: initialSubtitle = "Optional",
  clientName: initialClientName = "Client name",
  senderName: initialSenderName = "Sender name",
  logo: initialLogo = null,
  backgroundImage = "images/headers/header1.jpg",
  backgroundColor = "#ACCCFC",
  textColor = "#ffffff",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [clientName, setClientName] = useState(initialClientName);
  const [senderName, setSenderName] = useState(initialSenderName);
  const [logo, setLogo] = useState(initialLogo);
  const fileInputRef = useRef();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const logoUrl = URL.createObjectURL(file);
      setLogo(logoUrl);
      if (onSettingsChange) {
        onSettingsChange(id, { logo: logoUrl });
      }
    }
  };

  const handleTextChange = (field, value) => {
    const setters = {
      title: setTitle,
      subtitle: setSubtitle,
      clientName: setClientName,
      senderName: setSenderName,
    };
    setters[field](value);
    if (onSettingsChange) {
      onSettingsChange(id, { [field]: value });
    }
  };

  return (
    <div
      className="container-fluid my-4 px-3"
      style={{ maxWidth: "1400px", width: "100%" }}
    >
      <div
        className="row rounded-3 overflow-hidden shadow"
        style={{ minHeight: "400px" }}
      >
        {/* Left Side (Image) */}
        <div
          className="col-md-5 p-0"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Right Side (Content) */}
        <div
          className="col-md-7 d-flex flex-column justify-content-between p-4"
          style={{ backgroundColor, color: textColor }}
        >
          {/* Top controls and logo */}
          <div className="d-flex justify-content-between">
            {/* Logo upload */}
            <div>
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  style={{ height: "60px", maxWidth: "200px", objectFit: "contain" }}
                />
              ) : (
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => fileInputRef.current.click()}
                >
                  Logo
                </Button>
              )}
              <Form.Control
                type="file"
                onChange={handleLogoUpload}
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
              />
            </div>
          </div>

          {/* Middle content */}
          <div className="mt-5">
            <Form.Control
              as="textarea"
              rows={1}
              value={subtitle}
              onChange={(e) => handleTextChange("subtitle", e.target.value)}
              className="border-0 bg-transparent mb-2 fs-6 p-0"
              style={{
                fontStyle: "italic",
                color: textColor,
                resize: "none",
                overflow: "hidden",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #66b2ff")}
              onBlur={(e) => (e.target.style.border = "none")}
            />
            <Form.Control
              as="textarea"
              rows={2}
              value={title}
              onChange={(e) => handleTextChange("title", e.target.value)}
              className="border-0 bg-transparent fw-bold fs-2 mb-4 p-0"
              style={{
                color: textColor,
                resize: "none",
                overflow: "hidden",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #66b2ff")}
              onBlur={(e) => (e.target.style.border = "none")}
            />
          </div>

          {/* Bottom content */}
          <div>
            <div>
              <span className="fw-semibold me-2">Prepared for</span>
              <Form.Control
                type="text"
                value={clientName}
                onChange={(e) => handleTextChange("clientName", e.target.value)}
                className="d-inline-block px-2 py-1 border bg-white text-dark rounded"
                style={{ width: "auto", minWidth: "150px", fontSize: "0.875rem" }}
              />
            </div>
            <div className="mt-2">
              <span className="fw-semibold me-2">By</span>
              <Form.Control
                type="text"
                value={senderName}
                onChange={(e) => handleTextChange("senderName", e.target.value)}
                className="d-inline-block px-2 py-1 border bg-white text-dark rounded"
                style={{ width: "auto", minWidth: "150px", fontSize: "0.875rem" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBlock;