import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button, Form, Modal, Dropdown } from "react-bootstrap";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import EditableQuill from "./EditableQuill";
import CustomToolbar from "./CustomToolbar";
import { useSelector, useDispatch } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";
import { addHeaderId } from "../../../store/headerSlice";

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
      height: "100%",
      minHeight: "600px",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    priceSection: {
      backgroundColor: "transparent",
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

const API_URL = import.meta.env.VITE_API_URL;

const HeaderBlock = ({
  id,
  parentId,
  layoutType = "left-panel",
  onSettingsChange = () => {},
  initialTitle = "Sales Proposal",
  initialSubtitle = "Optional",
  initialClientName = "Prepared by Client name",
  initialSenderName = "By Sender name",
  initialPrice = "INCL.VAT",
  initialLogoUrl = null, // Changed to match database field
  backgroundImage = `${API_URL}/uploads/1758707155754.png`,
  backgroundColor = "#2D5000",
  textColor,
  backgroundFilter,
  textAlign,
  isPreview = false,
  layoutStyles = null,
}) => {
  const userId = useSelector(selectedUserId);
  const [isCreated, setIsCreated] = useState(false);
  const [headerBlock, setHeaderBlock] = useState({
    layoutType,
    title: initialTitle,
    subtitle: initialSubtitle,
    clientName: initialClientName,
    senderName: initialSenderName,
    price: initialPrice,
    logoUrl: initialLogoUrl, // Changed to match database field
    backgroundImage: backgroundImage,
    backgroundColor: backgroundColor,
    textColor: textColor || "#ffffff",
    backgroundFilter: backgroundFilter || null,
    textAlign: textAlign || "left",
    leftWidth: 50,
    layoutStyles: layoutStyles || LAYOUTS[layoutType] || LAYOUTS.default,
  });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(2);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showLogo, setShowLogo] = useState(true);
  const cropperRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [headerId, setHeaderId] = useState(id || null);
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  console.log("i am parentId from header block", parentId);

  // Add useEffect to update state when props change
  useEffect(() => {
    setHeaderBlock((prev) => ({
      ...prev,
      layoutType,
      backgroundImage,
      backgroundColor,
      textColor: textColor || prev.textColor,
      backgroundFilter: backgroundFilter || prev.backgroundFilter,
      textAlign: textAlign || prev.textAlign,
      layoutStyles: layoutStyles || LAYOUTS[layoutType] || LAYOUTS.default,
    }));
  }, [
    layoutType,
    backgroundImage,
    backgroundColor,
    textColor,
    backgroundFilter,
    textAlign,
    layoutStyles,
  ]);

  const updateHeaderBlock = useCallback(
    (partial) => {
      setHeaderBlock((prev) => {
        const next = { ...prev, ...partial };
        onSettingsChange(next);
        return next;
      });
    },
    [onSettingsChange]
  );

  // In HeaderBlock.jsx - update the API call
  useEffect(() => {
    const saveHeaderBlock = async () => {
      if (isPreview) return;

      try {
        let exists = false;

        // 🔍 Step 1: Check if header block exists
        if (id) {
          try {
            const checkRes = await fetch(
              `${API_URL}/api/headerBlock?ids=${id}`
            );
            console.log("checkRes from api", checkRes);
            if (checkRes.ok) {
              exists = true;
            }
          } catch (error) {
            console.log("Header block doesn't exist yet, will create new");
          }
        }

        // Step 2: Decide method and URL
        const url = exists
          ? `${API_URL}/api/headerBlock/${id}` // update
          : `${API_URL}/api/CreateHeaderBlock`; // create

        const method = exists ? "PUT" : "POST";

        // Step 3: Send request
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            parentId,
            layoutType: headerBlock.layoutType,
            title: headerBlock.title,
            subtitle: headerBlock.subtitle,
            clientName: headerBlock.clientName,
            senderName: headerBlock.senderName,
            price: headerBlock.price,
            logoUrl: headerBlock.logoUrl, // Changed to match database field
            backgroundImage: headerBlock.backgroundImage,
            backgroundColor: headerBlock.backgroundColor,
            textColor: headerBlock.textColor,
            backgroundFilter: headerBlock.backgroundFilter,
            textAlign: headerBlock.textAlign,
            leftWidth: headerBlock.leftWidth,
            userId: userId,
            layoutStyles: headerBlock.layoutStyles,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to save header block:", errorData);
        } else {
          const result = await response.json();
          console.log("Header block saved successfully:", result);

          // ✅ If newly created, store ID and mark as created
          if (!exists && result?.data?.id) {
            setIsCreated(true);
            setHeaderId(result.data.id);
            dispatch(addHeaderId(result.data.id));
            console.log("HeaderId saved in localStorage:", result.data.id);
          }
        }
      } catch (error) {
        console.error("Error saving header block:", error);
      }
    };

    // ⏳ Debounce save call by 1 second
    const timeout = setTimeout(() => {
      if (headerBlock.title && headerBlock.title !== "Sales Proposal") {
        saveHeaderBlock();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [headerBlock, id, userId, isPreview]);

  const isWhiteBackground =
    (headerBlock.backgroundColor || "").toLowerCase() === "#ffffff";
  const dynamicTextColor = isWhiteBackground ? "#333" : headerBlock.textColor;
  const dynamicPriceSectionBg = isWhiteBackground ? "#e9ecef" : "#f8f9fa";
  const dynamicPriceTextColor = isWhiteBackground ? "#000" : "#2d5000";

  const handleMouseDown = (e) => {
    if (
      isPreview ||
      !["left-panel", "right-panel"].includes(headerBlock.layoutType)
    )
      return;
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      const percentage = Math.min(
        Math.max((mouseX / containerWidth) * 100, 20),
        80
      );

      // Update width immediately for smoother UX
      updateHeaderBlock({ leftWidth: percentage });
    },
    [isDragging, updateHeaderBlock]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsHovered(false);
    document.body.style.cursor = "";
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // In HeaderBlock.jsx - add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts (block is removed)
      if (headerId && !isPreview) {
        localStorage.removeItem("headerId");
        console.log("HeaderId removed from localStorage:", headerId);
      }
    };
  }, [headerId, isPreview]);

  const handleLogoUpload = (e) => {
    if (isPreview) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoReset = () => {
    if (isPreview) return;

    updateHeaderBlock({ logoUrl: null }); // Changed to match database field
    setImageSrc(null);
    setShowLogo(true);
    setCropModalOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleCropSave = async () => {
    try {
      const cropper = cropperRef.current?.cropper;
      if (!cropper) throw new Error("Cropper instance not found.");

      const canvas = cropper.getCroppedCanvas({ fillColor: "#fff" });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const formData = new FormData();
      formData.append("file", blob, "logo.png");

      const uploadRes = await fetch(`${API_URL}/upload/img`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        console.error("Upload failed:", uploadData.message);
        return;
      }

      const updatedLogoUrl = uploadData.url;

      const url = isCreated
        ? `${API_URL}/api/headerBlock/${headerId}`
        : `${API_URL}/api/CreateHeaderBlock`;

      const method = isCreated ? "PUT" : "POST";

      const saveRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...headerBlock,
          parentId,
          logoUrl: updatedLogoUrl, // Changed to match database field
          userId,
        }),
      });

      const saveData = await saveRes.json();
      console.log("i am from saved data", saveData);

      if (!saveRes.ok) {
        console.error("Failed to save header block with new logo:", saveData);
      } else {
        console.log("Header block saved with updated logo:", saveData);

        updateHeaderBlock({ logoUrl: updatedLogoUrl }); // Changed to match database field
        setCropModalOpen(false);

        // Update local ID if newly created
        if (!isCreated && saveData?.data?.id) {
          setIsCreated(true);
          setHeaderId(saveData.data.id);
          localStorage.setItem("headerId", saveData.data.id);
        }
      }
    } catch (err) {
      console.error("Error uploading and saving logo:", err);
    }
  };

  const handleTextChange = (field, value) => {
    if (isPreview) return;
    updateHeaderBlock({ [field]: value });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const {
    container,
    imageCol: originalImageCol,
    contentCol: originalContentCol,
    imageStyle,
    priceSection,
    contentStyle,
  } = useMemo(() => {
    return LAYOUTS[headerBlock.layoutType] || LAYOUTS.default;
  }, [headerBlock.layoutType]);

  // Adjust columns for resizable layouts
  const getAdjustedColumns = () => {
    if (
      isPreview ||
      !["left-panel", "right-panel"].includes(headerBlock.layoutType)
    ) {
      return { imageCol: originalImageCol, contentCol: originalContentCol };
    }

    // Use flexbox for resizable layouts instead of Bootstrap grid
    const imageCol = `flex-shrink-0 ${
      headerBlock.layoutType === "left-panel" ? "order-1" : "order-2"
    }`;
    const contentCol = `flex-grow-1 ${
      headerBlock.layoutType === "left-panel" ? "order-2" : "order-1"
    }`;

    return { imageCol, contentCol };
  };

  const { imageCol, contentCol } = getAdjustedColumns();

  const wrapperStyle = isPreview
    ? {}
    : {
        maxWidth: "1800px",
      };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="logo-dropdown-anchor"
    >
      {children}
    </a>
  ));

  return (
    <div
      className={`container-fluid px-3 ${isPreview ? "p-0 my-0" : ""}`}
      style={wrapperStyle}
    >
      <div
        className={`row  overflow-hidden shadow ${container}`}
        ref={containerRef}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          // Use flexbox for resizable layouts
          ...(isPreview ||
          !["left-panel", "right-panel"].includes(headerBlock.layoutType)
            ? {}
            : {
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
              }),
        }}
      >
        {/* Image Section */}
        <div
          className={imageCol}
          style={{
            ...(headerBlock.backgroundFilter
              ? { background: headerBlock.backgroundFilter }
              : headerBlock.backgroundImage
              ? {
                  backgroundImage: `url('${headerBlock.backgroundImage}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { backgroundColor: headerBlock.backgroundColor || "#f8f9fa" }),
            ...imageStyle,
            // Add dynamic width for resizable layouts
            ...(isPreview ||
            !["left-panel", "right-panel"].includes(headerBlock.layoutType)
              ? {}
              : {
                  width: `${headerBlock.leftWidth}%`,
                  minWidth: "200px",
                  maxWidth: "80%",
                }),
          }}
        />

        {/* Resizable handle for left/right panels */}
        {!isPreview &&
          ["left-panel", "right-panel"].includes(headerBlock.layoutType) && (
            <div
              style={{
                width: "6px",
                cursor: "col-resize",
                backgroundColor: "#ddd",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${headerBlock.leftWidth}%`,
                transform: "translateX(-50%)",
                zIndex: 1,
                opacity: isHovered || isDragging ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
              onMouseDown={handleMouseDown}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => !isDragging && setIsHovered(false)}
            />
          )}

        {/* Content Section */}
        <div
          className={`${contentCol} ${
            headerBlock.layoutType === "grid"
              ? ""
              : "d-flex flex-column justify-content-between"
          }`}
          style={{
            ...(headerBlock.layoutType === "grid"
              ? {
                  ...contentStyle,
                  color: dynamicTextColor,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10rem",
                  height: "100%",
                }
              : {
                  backgroundColor: headerBlock.backgroundColor,
                  color: dynamicTextColor,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }),
            // Add dynamic width for resizable layouts
            ...(isPreview ||
            !["left-panel", "right-panel"].includes(headerBlock.layoutType)
              ? {}
              : {
                  width: `${100 - headerBlock.leftWidth}%`,
                  minWidth: "200px",
                }),
          }}
        >
          {/* Logo and Controls */}
          {headerBlock.layoutType !== "default" && (
            <div
              className="logo-management-container"
              style={{ textAlign: headerBlock.textAlign }}
            >
              <div className="logo-actions-wrapper">
                {headerBlock.logoUrl ? ( // Changed to match database field
                  <Dropdown>
                    <Dropdown.Toggle
                      as={CustomToggle}
                      id="logo-actions-dropdown"
                      className="logo-dropdown-toggle"
                    >
                      <div className="logo-preview-container">
                        {showLogo ? (
                          <img
                            src={headerBlock.logoUrl} // Changed to match database field
                            alt="Logo"
                            className="logo-preview"
                          />
                        ) : (
                          <span
                            className="logo-placeholder"
                            style={{
                              color: "#040404",
                            }}
                          >
                            Logo
                          </span>
                        )}
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="logo-dropdown-menu">
                      <div className="px-1 py-2 d-flex align-items-center justify-content-between">
                        <span className="me-3 fw-semibold ">Show Logotype</span>
                        <Form.Check
                          type="switch"
                          id="show-logo-switch"
                          checked={showLogo}
                          onChange={() => setShowLogo(!showLogo)}
                          className="ms-2"
                        />
                      </div>
                      {showLogo && (
                        <>
                          <Dropdown.Item
                            onClick={() => fileInputRef.current.click()}
                            className="logo-dropdown-item"
                          >
                            Change Logotype
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={handleLogoReset}
                            className="logo-dropdown-item"
                          >
                            Reset
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => fileInputRef.current.click()}
                    className="logo-placeholder-btn"
                    style={{
                      color: dynamicTextColor,
                    }}
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
              backdrop="static"
              keyboard={false}
            >
              <Modal.Body>
                {imageSrc && (
                  <Cropper
                    src={imageSrc}
                    style={{ height: 500, width: "100%" }}
                    initialAspectRatio={1}
                    guides={true}
                    viewMode={1}
                    background={false}
                    responsive={true}
                    autoCropArea={1}
                    checkOrientation={false}
                    ref={cropperRef}
                  />
                )}
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

          {/* Special for the default layout */}
          {headerBlock.layoutType === "default" && (
            <>
              {/* Overlayed Title/SubTitle Box */}
              <div
                style={{
                  ...LAYOUTS.default.titleBox,
                  textAlign: headerBlock.textAlign,
                }}
              >
                {/* Logo inside title box */}
                <div className="d-flex justify-content-start align-items-start mb-2">
                  {headerBlock.logoUrl ? ( // Changed to match database field
                    <img
                      src={headerBlock.logoUrl} // Changed to match database field
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
                  id={`default-title-${id}`}
                  value={headerBlock.title}
                  onChange={(value) => handleTextChange("title", value)}
                  placeholder="Sales Proposal"
                  textColor="#000"
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "3.5rem",
                    color: "#000",
                  }}
                />
              </div>

              {/* Price Section */}
              <div
                style={{
                  ...priceSection,
                  backgroundColor: "#ECECEC",
                  textAlign: headerBlock.textAlign,
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
                    value={headerBlock.price}
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

          {/* Main Content */}
          {headerBlock.layoutType !== "default" && (
            <div
              className="w-full bg-gray-800 rounded-xl overflow-hidden editable-quill-wrapper"
              style={{ textAlign: headerBlock.textAlign }}
            >
              <div
                className="w-full px-6 py-8 space-y-3"
                style={{ color: dynamicTextColor, textAlign: "inherit" }}
              >
                <EditableQuill
                  id={`subtitle-${id}`}
                  value={headerBlock.subtitle}
                  onChange={(value) => handleTextChange("subtitle", value)}
                  placeholder="Enter subtitle..."
                  className="text-xl"
                  style={{ textAlign: "inherit", fontSize: "2rem" }}
                />
                <EditableQuill
                  id={`title-${id}`}
                  value={headerBlock.title}
                  onChange={(value) => handleTextChange("title", value)}
                  placeholder="Enter title..."
                  className="text-3xl font-bold"
                  style={{
                    textAlign: "inherit",
                    fontSize: "3rem",
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>
          )}

          {/* Client/Sender Info */}
          {headerBlock.layoutType !== "default" && (
            <div
              className="mt-1"
              style={{
                color: dynamicTextColor,
                textAlign: headerBlock.textAlign,
              }}
            >
              {/* Prepared for Client */}
              <div
                className="mb-1 d-flex align-items-center"
                style={{
                  justifyContent:
                    headerBlock.textAlign === "left"
                      ? "flex-start"
                      : headerBlock.textAlign === "center"
                      ? "center"
                      : "flex-end",
                  color: dynamicTextColor,
                }}
              >
                <div
                  className={`d-inline-flex align-items-center ${
                    (headerBlock.clientName || "").trim() === ""
                      ? "rounded-pill"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      (headerBlock.clientName || "").trim() === ""
                        ? "#fff"
                        : "transparent",
                    padding:
                      (headerBlock.clientName || "").trim() === ""
                        ? "0.5px 2px"
                        : "0",
                    fontSize: "0.15rem",
                    lineHeight: 1,
                    flexWrap: "wrap",
                    minHeight: "10px",
                    fontFamily: "Arial",
                  }}
                >
                  <EditableQuill
                    id={`clientName-${id}`}
                    value={
                      headerBlock.clientName === "" ||
                      headerBlock.clientName === "Prepared by Client name"
                        ? `<span style="color:${dynamicTextColor}; font-size:0.15rem;">Prepared for </span><span style=\"color:#F80B1E; font-size:0.25rem;\">Client name</span>`
                        : headerBlock.clientName
                    }
                    onChange={(value) => handleTextChange("clientName", value)}
                    placeholder=""
                    textColor="#dc3545"
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "0.25rem",
                      padding: 0,
                      margin: 0,
                    }}
                    minHeight="10px"
                    maxHeight="none"
                    isPreview={isPreview}
                  />
                </div>
              </div>

              {/* By Sender */}
              <div
                className="d-flex align-items-center"
                style={{
                  justifyContent:
                    headerBlock.textAlign === "left"
                      ? "flex-start"
                      : headerBlock.textAlign === "center"
                      ? "center"
                      : "flex-end",
                  color: dynamicTextColor,
                }}
              >
                <div
                  className={`d-inline-flex align-items-center ${
                    (headerBlock.senderName || "").trim() === ""
                      ? "rounded-pill"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      (headerBlock.senderName || "").trim() === ""
                        ? "#cce5ff"
                        : "transparent",
                    padding:
                      (headerBlock.senderName || "").trim() === ""
                        ? "0.5px 2px"
                        : "0",
                    fontSize: "0.15rem",
                    lineHeight: 1,
                    flexWrap: "wrap",
                    minHeight: "10px",
                    fontFamily: "Arial",
                  }}
                >
                  <EditableQuill
                    id={`senderName-${id}`}
                    value={
                      headerBlock.senderName === "" ||
                      headerBlock.senderName === "By Sender name"
                        ? `<span style=\"color:${dynamicTextColor}; font-size:0.15rem;\">By </span><span style=\"color:#0d6efd; font-size:0.25rem;\">Sender name</span>`
                        : headerBlock.senderName
                    }
                    onChange={(value) => handleTextChange("senderName", value)}
                    placeholder=""
                    textColor="#0d6efd"
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "0.25rem",
                      padding: 0,
                      margin: 0,
                    }}
                    minHeight="10px"
                    maxHeight="none"
                    isPreview={isPreview}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .logo-management-container {
          margin: 4px 0;
        }

        .logo-preview-container {
          display: inline-block;
        }

        .logo-preview {
          height: 100px;
          max-width: 120px;
          object-fit: contain;
          cursor: pointer;
        }

        .logo-placeholder {
          display: inline-block;
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 4px;
          background: #f5f5f5;
          cursor: pointer;
        }

        .logo-dropdown-toggle {
          color: #FC0404;
          background: none;
          border: none;
          padding: 0;
        }

        .logo-dropdown-toggle:after {
          display: none;
        }

        .logo-dropdown-menu {
          padding: 4px 0;
          min-width: 100px;
          border: 1px solid #e1e1e1;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .logo-dropdown-item {
          padding: 4px 8px;
          font-size: 12px;
          color: "inherit",
          cursor: pointer;
        }

        .logo-dropdown-item:hover {
          background-color: #f5f5f5;
        }

        .logo-placeholder-btn {
          background: none;
          border: none;
          color: "inherit",
          font-size: 14px;
          font-weight: 500;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          boxShadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default HeaderBlock;
