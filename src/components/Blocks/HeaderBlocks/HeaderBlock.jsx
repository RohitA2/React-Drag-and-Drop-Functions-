import React, { useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";

const HeaderBlock = ({
  id,
  layoutType = "left-panel",
  onSettingsChange,
  title: initialTitle = "Sales Proposal",
  subtitle: initialSubtitle = "Optional",
  clientName: initialClientName = "Client name",
  senderName: initialSenderName = "Sender name",
  price: initialPrice = "INCL.VAT",
  logo: initialLogo = null,
  backgroundImage = "images/bird.jpg",
  backgroundColor = "#2d5000",
  textColor = "#ffffff",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [clientName, setClientName] = useState(initialClientName);
  const [senderName, setSenderName] = useState(initialSenderName);
  const [price, setPrice] = useState(initialPrice);
  const [logo, setLogo] = useState(initialLogo);
  const fileInputRef = useRef();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const logoUrl = URL.createObjectURL(file);
      setLogo(logoUrl);
      onSettingsChange(id, { logo: logoUrl });
    }
  };

  const handleTextChange = (field, value) => {
    const setters = {
      title: setTitle,
      subtitle: setSubtitle,
      clientName: setClientName,
      senderName: setSenderName,
      price: setPrice,
    };
    setters[field](value);
    onSettingsChange(id, { [field]: value });
  };

  const getLayoutClasses = () => {
    const layouts = {
      "left-panel": {
        container: "flex-row",
        imageCol: "col-md-5 p-0 order-1",
        contentCol: "col-md-7 p-4 order-2",
        imageStyle: {
          minHeight: "400px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
      },
      "right-panel": {
        container: "flex-row",
        imageCol: "col-md-5 p-0 order-2",
        contentCol: "col-md-7 p-4 order-1",
        imageStyle: {
          minHeight: "400px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
      },
      "top-panel": {
        container: "flex-column",
        imageCol: "col-12 p-0 order-1",
        contentCol: "col-12 p-4 order-2",
        imageStyle: {
          height: "250px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
      },
      "bottom-panel": {
        container: "flex-column-reverse h-100",
        imageCol: "col-12 p-0",
        contentCol: "col-12 p-4",
        imageStyle: {
          height: "250px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          flex: "0 0 auto",
        },
        contentStyle: {
          flex: "1 1 auto",
        },
      },
      grid: {
        container: "position-relative",
        imageCol: "position-absolute w-100 h-100",
        contentCol: "position-relative col-md-6 p-4 z-index-1",
        imageStyle: {
          minHeight: "400px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        },
        contentStyle: {
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#ffffff",
          minHeight: "400px",
        },
      },
      default: {
        container: "flex-row",
        imageCol: "col-md-5 p-0 order-1",
        contentCol: "col-md-7 p-4 order-2 d-flex flex-column",
        imageStyle: {
          minHeight: "400px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
        priceSection: {
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderRadius: "0.5rem",
          textAlign: "center",
          marginTop: "auto",
        },
      },
    };

    return layouts[layoutType] || layouts.default;
  };

  const { container, imageCol, contentCol, imageStyle, priceSection } =
    getLayoutClasses();

  return (
    <div className="container-fluid my-4 px-3" style={{ maxWidth: "1400px" }}>
      <div
        className={`row rounded-3 overflow-hidden shadow d-flex ${container}`}
      >
        {/* Image Section */}
        <div
          className={`${imageCol}`}
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            ...imageStyle,
          }}
        />

        {/* Content Section */}
        <div
          className={`${contentCol} d-flex flex-column justify-content-between`}
          style={{ backgroundColor, color: textColor }}
        >
          {/* Logo and Controls */}
          <div className="d-flex justify-content-between align-items-start">
            <div>
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: "60px",
                    maxWidth: "200px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => fileInputRef.current.click()}
                >
                  Upload Logo
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

          {/* Main Content */}
          <div className={layoutType.includes("panel") ? "mt-3" : "mt-5"}>
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
            />
            <Form.Control
              as="textarea"
              rows={2}
              value={title}
              onChange={(e) => handleTextChange("title", e.target.value)}
              className="border-0 bg-transparent fw-bold fs-3 mb-4 p-0"
              style={{
                color: textColor,
                resize: "none",
                overflow: "hidden",
              }}
            />
          </div>

          {/* Price Section - Only shown in default layout */}
          {layoutType === "default" && (
            <div style={priceSection}>
              <h3 className="mb-2">Price</h3>
              <Form.Control
              type="text"
              value={price}
              onChange={(e) => handleTextChange("price", e.target.value)}
              className="border-0 bg-transparent text-center fw-bold fs-4"
              style={{ width: "100%" }}
            />
            </div>
          )}

          {/* Client/Sender Info - Not shown in default layout */}
          {layoutType !== "default" && (
            <div>
              <div className="mb-2">
                <span className="fw-semibold me-2">Prepared for</span>
                <Form.Control
                  type="text"
                  value={clientName}
                  onChange={(e) =>
                    handleTextChange("clientName", e.target.value)
                  }
                  className="d-inline-block px-2 py-1 border bg-white text-dark rounded"
                  style={{ width: "auto", minWidth: "150px" }}
                />
              </div>
              <div>
                <span className="fw-semibold me-2">Prepared by</span>
                <Form.Control
                  type="text"
                  value={senderName}
                  onChange={(e) =>
                    handleTextChange("senderName", e.target.value)
                  }
                  className="d-inline-block px-2 py-1 border bg-white text-dark rounded"
                  style={{ width: "auto", minWidth: "150px" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBlock;
