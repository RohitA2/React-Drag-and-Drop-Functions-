import React, { useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { X } from "lucide-react";

const HeaderBlock = () => {
  const [title, setTitle] = useState("Sales Proposal");
  const [subtitle, setSubtitle] = useState("Optional");
  const [clientName, setClientName] = useState("Client name");
  const [senderName, setSenderName] = useState("Sender name");
  const [logo, setLogo] = useState(null);

  const fileInputRef = useRef();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
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
            backgroundImage: "url('images/bird.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Right Side (Content) */}
        <div
          className="col-md-7 d-flex flex-column justify-content-between text-white p-4"
          style={{ backgroundColor: "#2d5000" }}
        >
          {/* Top controls and logo */}
          <div className="d-flex justify-content-between">
            {/* Logo upload */}
            <div>
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  style={{ height: "60px", marginRight: "10px" }}
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
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="border-0 bg-transparent text-white mb-2 fs-6"
              style={{
                fontStyle: "stalic",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #66b2ff")}
              onBlur={(e) => (e.target.style.border = "none")}
            />
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 bg-transparent text-white fw-bold fs-3 mb-4"
              style={{
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #66b2ff")}
              onBlur={(e) => (e.target.style.border = "none")}
            />
          </div>

          {/* Bottom content */}
          <div>
            <div className="text-white">
              <span className="fw-semibold me-2">Prepared for</span>
              <Form.Control
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="d-inline-block w-auto px-2 py-1 border border-danger bg-light text-danger rounded"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
            <div className="text-white mt-2">
              <span className="fw-semibold me-2">By</span>
              <Form.Control
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="d-inline-block w-auto px-2 py-1 border bg-light text-primary rounded"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBlock;
