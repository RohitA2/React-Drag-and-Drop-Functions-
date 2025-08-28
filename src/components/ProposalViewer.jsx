// src/ProposalViewer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";

const API_BASE = import.meta.env.VITE_API_URL;

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

const resolveUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
};

const merge = (a, b) => ({ ...(a || {}), ...(b || {}) });

export default function ProposalViewer() {
  const { headerId: idFromPath } = useParams();
  const [sp] = useSearchParams();
  const idFromQuery = sp.get("id");
  const headerId = idFromPath || idFromQuery;

  const [data, setData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    if (!headerId) {
      setStatus({ loading: false, error: "Missing headerId" });
      return;
    }

    (async () => {
      try {
        setStatus({ loading: true, error: null });
        const res = await fetch(`${API_BASE}/api/headerBlock/${headerId}`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const payload = json?.data || json;

        if (isMounted) {
          setData(payload);
          setStatus({ loading: false, error: null });
        }
      } catch (e) {
        if (isMounted)
          setStatus({ loading: false, error: e.message || "Error" });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [headerId]);

  const view = useMemo(() => {
    if (!data) return null;

    const styles = data.styles || {};
    const layoutType = data.layoutType || "left-panel";
    const layoutStyles = data.layoutStyles || LAYOUTS[layoutType] || LAYOUTS.default;

    return {
      id: data.id,
      titleHtml: data.title || "",
      subtitleHtml: data.subtitle || "",
      clientNameHtml: data.clientName || styles.clientName || "",
      senderNameHtml: data.senderName || styles.senderName || "",
      logoUrl: data.logoUrl || "",
      bgImage: data.backgroundImage || styles.backgroundImage || "",
      backgroundColor: data.backgroundColor || styles.backgroundColor || "#2d5000",
      textColor: data.textColor || styles.textColor || "#ffffff",
      price: data.price || styles.price || null,
      layoutType: layoutType,
      layoutStyles: layoutStyles,
      ui: merge(
        {
          layoutType: layoutType,
          leftWidth: 50,
          textAlign: "left",
          textColor: "#ffffff",
          backgroundColor: "#2d5000",
          backgroundFilter: null,
          price: null,
        },
        styles
      ),
    };
  }, [data]);

  if (status.loading) {
    return (
      <div style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
        Loading document…
      </div>
    );
  }

  if (status.error) {
    return (
      <div
        style={{
          padding: 24,
          color: "crimson",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        Failed to load: {status.error}
      </div>
    );
  }

  if (!view) return null;

  const {
    titleHtml,
    subtitleHtml,
    clientNameHtml,
    senderNameHtml,
    logoUrl,
    bgImage,
    backgroundColor,
    textColor,
    price,
    layoutType,
    layoutStyles,
    ui,
  } = view;

  // layout widths for left/right panels
  const leftPct = Math.max(0, Math.min(100, Number(ui.leftWidth ?? 50)));
  const rightPct = 100 - leftPct;

  // Check if background is white to adjust text color
  const isWhiteBackground = (backgroundColor || "").toLowerCase() === "#ffffff";
  const dynamicTextColor = isWhiteBackground ? "#333" : textColor;

  // Render different layouts based on layoutType
  const renderLayout = () => {
    switch (layoutType) {
      case "left-panel":
      case "right-panel":
        return renderSidePanelLayout();
      case "top-panel":
        return renderTopPanelLayout();
      case "bottom-panel":
        return renderBottomPanelLayout();
      case "grid":
        return renderGridLayout();
      case "default":
        return renderDefaultLayout();
      default:
        return renderSidePanelLayout();
    }
  };

  const renderSidePanelLayout = () => {
    const isLeftPanel = layoutType === "left-panel";
    
    return (
      <div style={{ 
        display: "flex", 
        width: "100%", 
        minHeight: "600px",
        flexDirection: isLeftPanel ? "row" : "row-reverse" 
      }}>
        {/* Image panel */}
        <div
          style={{
            width: `${isLeftPanel ? leftPct : rightPct}%`,
            minHeight: "600px",
            backgroundImage: `url(${resolveUrl(bgImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            ...(layoutStyles.imageStyle || {}),
          }}
        >
          {ui.backgroundFilter && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: ui.backgroundFilter,
              }}
            />
          )}
        </div>

        {/* Content panel */}
        <div
          style={{
            width: `${isLeftPanel ? rightPct : leftPct}%`,
            minHeight: "600px",
            backgroundColor: backgroundColor,
            color: dynamicTextColor,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            textAlign: ui.textAlign,
            ...(layoutStyles.contentStyle || {}),
          }}
        >
          {renderLogo()}
          {renderContent()}
          {renderFooter()}
        </div>
      </div>
    );
  };

  const renderTopPanelLayout = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* Image panel */}
        <div
          style={{
            width: "100%",
            height: "250px",
            backgroundImage: `url(${resolveUrl(bgImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            ...(layoutStyles.imageStyle || {}),
          }}
        >
          {ui.backgroundFilter && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: ui.backgroundFilter,
              }}
            />
          )}
        </div>

        {/* Content panel */}
        <div
          style={{
            width: "100%",
            backgroundColor: backgroundColor,
            color: dynamicTextColor,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            textAlign: ui.textAlign,
            ...(layoutStyles.contentStyle || {}),
          }}
        >
          {renderLogo()}
          {renderContent()}
          {renderFooter()}
        </div>
      </div>
    );
  };

  const renderBottomPanelLayout = () => {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column-reverse", 
      width: "100%", 
      minHeight: "600px" 
    }}>
      {/* Image panel (at the bottom due to column-reverse) */}
      <div
        style={{
          width: "100%",
          height: "250px",
          backgroundImage: `url(${resolveUrl(bgImage)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          flex: "0 0 auto",
          ...(layoutStyles.imageStyle || {}),
        }}
      >
        {ui.backgroundFilter && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: ui.backgroundFilter,
            }}
          />
        )}
      </div>

      {/* Content panel (at the top due to column-reverse) */}
      <div
        style={{
          width: "100%",
          backgroundColor: backgroundColor,
          color: dynamicTextColor,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          textAlign: ui.textAlign,
          flex: "1 1 auto",
          ...(layoutStyles.contentStyle || {}),
        }}
      >
        {renderLogo()}
        {renderContent()}
        {renderFooter()}
      </div>
    </div>
  );
};

  const renderGridLayout = () => {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "600px",
          minHeight: "600px",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${resolveUrl(bgImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
            ...(layoutStyles.imageStyle || {}),
          }}
        >
          {ui.backgroundFilter && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: ui.backgroundFilter,
              }}
            />
          )}
        </div>

        {/* Content overlay */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            zIndex: 1,
            padding: "2rem",
            textAlign: ui.textAlign,
            color: dynamicTextColor,
            ...(layoutStyles.contentStyle || {}),
          }}
        >
          <div style={{ maxWidth: "800px" }}>
            {renderLogo()}
            {renderContent()}
            {renderFooter()}
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultLayout = () => {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "600px",
        }}
      >
        {/* Background image */}
        <div
          style={{
            width: "100%",
            height: "600px",
            backgroundImage: `url(${resolveUrl(bgImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            ...(layoutStyles.imageStyle || {}),
          }}
        >
          {ui.backgroundFilter && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: ui.backgroundFilter,
              }}
            />
          )}
        </div>

        {/* Content overlay */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            padding: "0 1rem",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: ui.textAlign,
            color: dynamicTextColor,
            ...(layoutStyles.contentStyle || {}),
          }}
        >
          {/* Title box */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              marginBottom: "1rem",
              ...(layoutStyles.titleBox || {}),
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              {logoUrl ? (
                <img
                  src={resolveUrl(logoUrl)}
                  alt="Logo"
                  style={{
                    height: "60px",
                    maxWidth: "200px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontWeight: 700,
                  }}
                >
                  Logo
                </div>
              )}
            </div>

            {/* Title */}
            {titleHtml && (
              <div
                className="ql-editor"
                style={{
                  fontWeight: 700,
                  lineHeight: 1.25,
                  fontSize: "2.5rem",
                  color: "#000",
                  whiteSpace: "pre-wrap",
                  overflow: "visible",
                  maxHeight: "none",
                }}
                dangerouslySetInnerHTML={{ __html: titleHtml }}
              />
            )}
          </div>

          {/* Price section */}
          {price && (
            <div
              style={{
                backgroundColor: isWhiteBackground ? "#e9ecef" : "#f8f9fa",
                padding: "1rem",
                borderRadius: "0.5rem",
                textAlign: "center",
                marginTop: "1rem",
                width: "100%",
                maxWidth: "500px",
                ...(layoutStyles.priceSection || {}),
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: isWhiteBackground ? "#000" : "#2d5000",
                  marginBottom: "0.75rem",
                }}
              >
                Price
              </h3>
              <div
                style={{
                  backgroundColor: isWhiteBackground ? "#e9ecef" : "#f8f9fa",
                  borderRadius: "4px",
                  padding: "0.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: isWhiteBackground ? "#000" : "#2d5000",
                    textAlign: "center",
                  }}
                >
                  {price}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.875rem", marginTop: "1rem", width: "100%", maxWidth: "500px" }}>
            {clientNameHtml && (
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: clientNameHtml }}
              />
            )}
            {senderNameHtml && (
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: senderNameHtml }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLogo = () => {
    return logoUrl ? (
      <img
        src={resolveUrl(logoUrl)}
        alt="Logo"
        style={{
          maxHeight: "80px",
          objectFit: "contain",
          alignSelf: ui.textAlign === "right" ? "flex-end" : 
                   ui.textAlign === "center" ? "center" : "flex-start",
          marginBottom: "1.5rem",
        }}
      />
    ) : (
      <div
        style={{
          alignSelf: ui.textAlign === "right" ? "flex-end" : 
                   ui.textAlign === "center" ? "center" : "flex-start",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "10px 14px",
          fontWeight: 700,
          marginBottom: "1.5rem",
        }}
      >
        Logo
      </div>
    );
  };

  const renderContent = () => {
    return (
      <>
        {/* Subtitle */}
        {subtitleHtml && (
          <div
            className="ql-editor"
            style={{
              opacity: 0.85,
              marginBottom: "1rem",
              fontSize: "1rem",
              whiteSpace: "pre-wrap",
              overflow: "visible",
              maxHeight: "none",
            }}
            dangerouslySetInnerHTML={{ __html: subtitleHtml }}
          />
        )}

        {/* Title */}
        {titleHtml && (
          <div
            className="ql-editor"
            style={{
              fontWeight: 700,
              lineHeight: 1.25,
              fontSize: "2rem",
              whiteSpace: "pre-wrap",
              overflow: "visible",
              maxHeight: "none",
              marginBottom: "1rem",
            }}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        )}
      </>
    );
  };

  const renderFooter = () => {
    return (
      <div style={{ marginTop: "auto", display: "grid", gap: "0.5rem", fontSize: "0.875rem" }}>
        {clientNameHtml && (
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: clientNameHtml }}
          />
        )}
        {senderNameHtml && (
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: senderNameHtml }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "16px",
        boxSizing: "border-box",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {renderLayout()}
      </div>
    </div>
  );
}