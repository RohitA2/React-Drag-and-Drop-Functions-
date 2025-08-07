import React, { useRef, useState, useCallback, useMemo } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../../../utils/cropImage";
import EditableQuill from "./EditableQuill";

const LAYOUTS = {
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
    contentStyle: { flex: "1 1 auto" },
  },
  grid: {
    container: "position-relative w-100 h-100",
    imageCol: "position-absolute top-0 start-0 w-100 h-100",
    contentCol:
      "position-relative d-flex justify-content-center align-items-center w-100 h-100 z-index-1",
    imageStyle: {
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      width: "100%",
      height: "600px",
      minHeight: "600px",
      zIndex: 0,
    },
    contentStyle: {
      minHeight: "600px",
      padding: "2rem",
      textAlign: "center",
    },
  },
  default: {
    container: "position-relative flex-column w-100",
    imageCol: "w-100",
    contentCol:
      "position-absolute top-50 start-50 translate-middle w-100 px-3 z-2 d-flex flex-column align-items-center",
    imageStyle: {
      width: "100%",
      height: "600px",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    priceSection: {
      backgroundColor: "transparent", // Remove default color
      padding: "1rem",
      borderRadius: "0.5rem",
      textAlign: "center",
      marginTop: "1rem",
      width: "100%",
      maxWidth: "500px",
    },
    titleBox: {
      backgroundColor: "#f8f9fa",
      padding: "1rem",
      borderRadius: "0.5rem",
      width: "100%",
      maxWidth: "500px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    },
  },
};

const HeaderBlock = ({
  id,
  layoutType = "left-panel",
  onSettingsChange = () => {},
  initialTitle = "Sales Proposal",
  initialSubtitle = "Optional",
  initialClientName = "Client name",
  initialSenderName = "Sender name",
  initialPrice = "INCL.VAT",
  initialLogo = null,
  backgroundImage = "images/headers/leaf.avif",
  backgroundColor = "#2d5000",
  textColor = "#CFCFCF",
  textAlign = "left",
  isPreview = false, // Add isPreview property
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

  const isWhiteBackground = backgroundColor.toLowerCase() === "#ffffff";
  const dynamicTextColor = isWhiteBackground ? "#333" : textColor;
  const dynamicPriceSectionBg = isWhiteBackground ? "#e9ecef" : "#f8f9fa";
  const dynamicPriceTextColor = isWhiteBackground ? "#000" : "#2d5000";

  const handleLogoUpload = (e) => {
    if (isPreview) return; // Prevent interaction in preview mode
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
    if (isPreview) return;
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

  const {
    container,
    imageCol,
    contentCol,
    imageStyle,
    priceSection,
    contentStyle,
  } = useMemo(() => {
    return LAYOUTS[layoutType] || LAYOUTS.default;
  }, [layoutType]);

  const wrapperStyle = isPreview
    ? {}
    : {
        maxWidth: "1400px",
      };

  return (
    <div
      className={`container-fluid  my-4 px-3 ${isPreview ? "p-0 my-0" : ""}`}
      style={wrapperStyle}
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
          className={`${contentCol} ${
            layoutType === "grid"
              ? ""
              : "d-flex flex-column justify-content-between"
          }`}
          style={{
            ...(layoutType === "grid"
              ? { ...contentStyle, color: dynamicTextColor }
              : { backgroundColor, color: dynamicTextColor }),
          }}
        >
          {/* Logo and Controls */}
          {layoutType !== "default" && (
            <div
              className="d-flex justify-content-between align-items-start"
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
                    onClick={
                      !isPreview
                        ? () => fileInputRef.current.click()
                        : undefined
                    }
                  />
                ) : (
                  <Button
                    variant="light"
                    size="sm"
                    onClick={
                      !isPreview
                        ? () => fileInputRef.current.click()
                        : undefined
                    }
                  >
                    Logo
                  </Button>
                )}
                {!isPreview && (
                  <Form.Control
                    type="file"
                    onChange={handleLogoUpload}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                )}
              </div>
            </div>
          )}

          {/* Crop Modal */}
          {!isPreview && (
            <Modal
              show={cropModalOpen}
              onHide={() => setCropModalOpen(false)}
              centered
              size="lg"
            >
              <Modal.Body>
                <div
                  style={{ position: "relative", width: "100%", height: 500 }}
                >
                  {imageSrc && (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={undefined}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  )}
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
          )}

          {/* Main Content */}
          <div className="w-full bg-gray-800 text-white rounded-xl overflow-hidden editable-quill-wrapper">
            <div className="w-full px-6 py-8 text-center space-y-3">
              <EditableQuill
                value={subtitle}
                onChange={setSubtitle}
                placeholder="Enter subtitle..."
                className="text-xl"
              />
              <EditableQuill
                value={title}
                onChange={setTitle}
                placeholder="Enter title..."
                className="text-3xl font-bold"
              />
            </div>
          </div>

          {/* special for the default layout */}
          {layoutType === "default" && (
            <>
              {/* Overlayed Title/SubTitle Box */}
              <div style={{ ...LAYOUTS.default.titleBox, textAlign }}>
                {/* Logo inside title box */}
                <div className="d-flex justify-content-start align-items-start mb-2">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      style={{
                        height: "80px",
                        maxWidth: "200px",
                        objectFit: "contain",
                        cursor: !isPreview ? "pointer" : "default",
                      }}
                      onClick={
                        !isPreview
                          ? () => fileInputRef.current.click()
                          : undefined
                      }
                    />
                  ) : (
                    <Button
                      variant="light"
                      size="sm"
                      onClick={
                        !isPreview
                          ? () => fileInputRef.current.click()
                          : undefined
                      }
                    >
                      Logo
                    </Button>
                  )}
                  {!isPreview && (
                    <Form.Control
                      type="file"
                      onChange={handleLogoUpload}
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                    />
                  )}
                </div>

                {/* Title */}
                <EditableQuill
                  value={title}
                  onChange={(value) => handleTextChange("title", value)}
                  placeholder="Sales Proposal"
                  textColor="#000"
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "2rem",
                    color: "#000",
                  }}
                />
              </div>

              {/* Price Section */}
              <div
                style={{
                  ...priceSection,
                  backgroundColor: dynamicPriceSectionBg,
                  textAlign,
                }}
              >
                <h3
                  className="mb-3"
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    color: dynamicPriceTextColor,
                  }}
                >
                  Price
                </h3>
                <div
                  style={{
                    backgroundColor: dynamicPriceSectionBg,
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
                      color: dynamicPriceTextColor,
                      padding: "0.25rem",
                      outline: "none",
                      boxShadow: "none",
                    }}
                    readOnly={isPreview}
                  />
                </div>
              </div>
            </>
          )}

          {/* Client/Sender Info */}
          {layoutType !== "default" && (
            <div className="mt-2" style={{ textAlign }}>
              {/* Prepared for */}
              <div
                className="mb-1 d-flex align-items-center"
                style={{
                  justifyContent:
                    textAlign === "left"
                      ? "flex-start"
                      : textAlign === "center"
                      ? "center"
                      : "flex-end",
                }}
              >
                <span
                  className="fw-semibold me-1"
                  style={{
                    fontSize: "0.65rem",
                    color: dynamicTextColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  Prepared for
                </span>

                <div
                  className={`d-inline-flex align-items-center ${
                    clientName.trim() === "" ? "rounded-pill" : ""
                  }`}
                  style={{
                    backgroundColor:
                      clientName.trim() === "" ? "#fff" : "transparent",
                    padding: clientName.trim() === "" ? "1px 3px" : "0",
                    fontSize: "0.4rem",
                    color: "#dc3545",
                    lineHeight: 1,
                    flexWrap: "wrap",
                    minHeight: "14px",
                  }}
                >
                  {clientName.trim() === "" && (
                    <div style={{ marginRight: "3px", fontSize: "6px" }}>●</div>
                  )}
                  <EditableQuill
                    value={clientName}
                    onChange={(value) => handleTextChange("clientName", value)}
                    placeholder="Client name"
                    textColor="#dc3545"
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "0.4rem",
                      padding: 0,
                      margin: 0,
                    }}
                    minHeight="12px"
                    maxHeight="none"
                    isPreview={isPreview}
                  />
                </div>
              </div>

              {/* By */}
              <div
                className="d-flex align-items-center"
                style={{
                  justifyContent:
                    textAlign === "left"
                      ? "flex-start"
                      : textAlign === "center"
                      ? "center"
                      : "flex-end",
                }}
              >
                <span
                  className="fw-semibold me-1"
                  style={{
                    fontSize: "0.65rem",
                    color: dynamicTextColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  By
                </span>

                <div
                  className={`d-inline-flex align-items-center ${
                    senderName.trim() === "" ? "rounded-pill" : ""
                  }`}
                  style={{
                    backgroundColor:
                      senderName.trim() === "" ? "#cce5ff" : "transparent",
                    padding: senderName.trim() === "" ? "1px 3px" : "0",
                    fontSize: "0.4rem",
                    color: "#0d6efd",
                    lineHeight: 1,
                    flexWrap: "wrap",
                    minHeight: "14px",
                  }}
                >
                  <EditableQuill
                    value={senderName}
                    onChange={(value) => handleTextChange("senderName", value)}
                    placeholder="Sender name"
                    textColor="#0d6efd"
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "0.4rem",
                      padding: 0,
                      margin: 0,
                    }}
                    minHeight="12px"
                    maxHeight="none"
                    isPreview={isPreview}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBlock;
