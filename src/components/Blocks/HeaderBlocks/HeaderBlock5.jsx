import React, { useRef, useState, useCallback } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../../../utils/cropImage";

const HeaderBlock = ({
  id,
  layoutType = "default",
  onSettingsChange,
  title: initialTitle = "Sales Proposal",
  subtitle: initialSubtitle = "Optional",
  clientName: initialClientName = "Client name",
  senderName: initialSenderName = "Sender name",
  price: initialPrice = "INCL.VAT",
  logo: initialLogo = null,
  backgroundImage = "images/headers/bird.jpg",
  backgroundColor = "#B4D2E5",
  textColor = "#CFCFCF",
  textAlign = "left",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [clientName, setClientName] = useState(initialClientName);
  const [senderName, setSenderName] = useState(initialSenderName);
  const [price, setPrice] = useState(initialPrice);
  const [logo, setLogo] = useState(initialLogo);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(2);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    const croppedImageUrl = await getCroppedImg(
      imageSrc,
      crop,
      zoom,
      croppedAreaPixels
    );
    setLogo(croppedImageUrl);
    onSettingsChange(id, { logo: croppedImageUrl });
    setCropModalOpen(false);
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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getLayoutClasses = () => {
    const layouts = {
      "left-panel": {
        container: "flex-row",
        imageCol: "col-md-5 p-0 order-1",
        contentCol: "col-md-7 p-4 order-2",
        imageStyle: {
          minHeight: "600px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
      },
      "right-panel": {
        container: "flex-row",
        imageCol: "col-md-5 p-0 order-2",
        contentCol: "col-md-7 p-4 order-1",
        imageStyle: {
          minHeight: "600px",
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
          minHeight: "600px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        },
        contentStyle: {
          backgroundColor: "#B40404",
          minHeight: "600px",
        },
      },
      default: {
        container: "flex-row",
        imageCol: "col-md-5 p-0 order-1",
        contentCol: "col-md-7 p-4 order-2 d-flex flex-column",
        imageStyle: {
          minHeight: "600px",
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
    <div
      className="container-fluid my-4 px-3 "
      style={{ maxWidth: "1400px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          <div
            className="d-flex justify-content-between align-items-start control-panel"
            style={{ textAlign }}
          >
            <div>
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: "80px",
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

          {/* Crop Modal */}
          <Modal
            show={cropModalOpen}
            onHide={() => setCropModalOpen(false)}
            centered
            size="lg"
          >
            <Modal.Body>
              <div style={{ position: "relative", width: "100%", height: 500 }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={undefined}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
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

          {/* Main Content */}
          <div
            className={layoutType.includes("panel") ? "mt-3" : "mt-5"}
            style={{ textAlign }}
          >
            <Form.Control
              as="textarea"
              rows={1}
              value={subtitle}
              onChange={(e) => handleTextChange("subtitle", e.target.value)}
              className="border-0 bg-transparent mb-2 fs-6 p-0 control-panel"
              style={{
                color: textColor,
                resize: "none",
                overflow: "hidden",
                textAlign: "inherit",
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
                textAlign: "inherit",
              }}
            />
          </div>

          {/* Price Section - Only shown in default layout */}
          {layoutType === "default" && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginTop: "auto",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                ...priceSection,
                textAlign,
              }}
            >
              <h3
                className="mb-3"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Price
              </h3>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "4px",
                  padding: "0.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Form.Control
                  type="text"
                  value={price}
                  onChange={(e) => handleTextChange("price", e.target.value)}
                  className="border-0 bg-transparent text-center fw-bold"
                  style={{
                    width: "100%",
                    fontSize: "1.5rem",
                    color: "#2d5000",
                    padding: "0.25rem",
                  }}
                />
              </div>
            </div>
          )}

          {/* Client/Sender Info - Not shown in default layout */}
         {layoutType !== "default" && (
  <div className="mt-2" style={{ textAlign }}>
    {/* Prepared for - Client name with error badge */}
    <div 
      className="mb-1 d-flex"
      style={{ 
        justifyContent: textAlign === "left" ? "flex-start" : 
                      textAlign === "center" ? "center" : "flex-end" 
      }}
    >
      <span
        className="fw-semibold me-1 text-white"
        style={{ fontSize: "0.9rem" }}
      >
        Prepared for
      </span>
      <span className="badge bg-white text-danger d-flex align-items-center py-1 px-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          fill="currentColor"
          className="bi bi-exclamation-circle me-1"
          viewBox="0 0 16 16"
        >
          <path d="M7.001 4a.905.905 0 0 1 .999 1l-.35 3.481a.55.55 0 0 1-1.098 0L6.2 5a.905.905 0 0 1 .801-1zm.002 7a1 1 0 1 1-.002-2 1 1 0 0 1 .002 2z" />
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z" />
        </svg>
        <Form.Control
          type="text"
          value={clientName}
          onChange={(e) => handleTextChange("clientName", e.target.value)}
          placeholder="Client name"
          className="bg-transparent border-0 text-danger p-0 m-0"
          style={{
            width: "90px",
            fontSize: "0.85rem",
            outline: "none",
            boxShadow: "none",
            textAlign: "inherit" // Inherit from parent
          }}
        />
      </span>
    </div>

    {/* Prepared by - Sender name with blue badge */}
    <div 
      className="d-flex"
      style={{ 
        justifyContent: textAlign === "left" ? "flex-start" : 
                      textAlign === "center" ? "center" : "flex-end" 
      }}
    >
      <span
        className="fw-semibold me-1 text-white"
        style={{ fontSize: "0.9rem" }}
      >
        By
      </span>
      <span className="badge bg-white text-primary py-1 px-2">
        <Form.Control
          type="text"
          value={senderName}
          onChange={(e) => handleTextChange("senderName", e.target.value)}
          placeholder="Sender name"
          className="bg-transparent border-0 text-primary p-0 m-0"
          style={{
            width: "90px",
            fontSize: "0.85rem",
            outline: "none",
            boxShadow: "none",
            textAlign: "inherit" // Inherit from parent
          }}
        />
      </span>
    </div>
  </div>
)}
        </div>
      </div>
      <style>{`
          .hover-wrapper:hover .control-panel {
            opacity: 1;
            pointer-events: auto;
          }
          
          .block-container:hover {
            transform: translateY(-2px);
          }
          
          .control-panel {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
          }
          
          .hover-wrapper:hover .control-panel {
            opacity: 1;
          }
        `}</style>
    </div>
  );
};

export default HeaderBlock;
