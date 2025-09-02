// src/ProposalViewer.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import PartiesView from "./PartiesView";

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

// Add only the necessary Quill CSS classes that appear in your API response
const quillStyles = `
  .ql-align-center { text-align: center; }
  .ql-align-right { text-align: right; }
  .ql-align-justify { text-align: justify; }
  .ql-editor p { margin-bottom: 1rem; }
  .ql-editor h1, .ql-editor h2, .ql-editor h3, 
  .ql-editor h4, .ql-editor h5, .ql-editor h6 {
    margin-bottom: 1rem; font-weight: bold;
  }
  .ql-editor h1 { font-size: 2.5rem; }
  .ql-editor h2 { font-size: 2rem; }
  .ql-editor h3 { font-size: 1.75rem; }
  .ql-editor h4 { font-size: 1.5rem; }
  .ql-editor h5 { font-size: 1.25rem; }
  .ql-editor h6 { font-size: 1rem; }
`;

// Utility function to check if URL is likely an image
const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
};

// Utility function to resolve image URLs
const resolveUrl = (url) => {
  if (!url) return null;

  // If it's already an absolute URL, return as-is
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  // If it's a relative path, prepend the API base URL
  return `${API_BASE}${url.startsWith("/") ? url : "/" + url}`;
};

// Safe image component to use in your render methods
const SafeImage = ({ src, alt, style, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveUrl(src);

  if (hasError || !resolvedUrl || !isImageUrl(resolvedUrl)) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "10px 14px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        {alt || "Image not available"}
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      onError={() => setHasError(true)}
      style={style}
      {...props}
    />
  );
};

const merge = (a, b) => ({ ...(a || {}), ...(b || {}) });

// Proposal Layout Component
const ProposalLayout = React.memo(({ proposal }) => {
  const view = useMemo(() => {
    if (!proposal) return null;

    const styles = proposal.styles || {};
    const layoutType = proposal.layoutType || "left-panel";
    const layoutStyles = LAYOUTS[layoutType] || LAYOUTS.default;

    return {
      id: proposal.id,
      titleHtml: proposal.title || "",
      subtitleHtml: proposal.subtitle || "",
      clientNameHtml: proposal.clientName || "",
      senderNameHtml: proposal.senderName || "",
      logoUrl: proposal.logoUrl || "",
      bgImage: proposal.backgroundImage || "",
      backgroundColor: proposal.backgroundColor || "#2d5000",
      textColor: proposal.textColor || "#ffffff",
      price: proposal.price || null,
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
  }, [proposal]);

  const renderLogo = useCallback((ui, logoUrl) => {
    return logoUrl ? (
      <SafeImage
        src={resolveUrl(logoUrl)}
        alt="Logo"
        style={{
          maxHeight: "80px",
          objectFit: "contain",
          alignSelf:
            ui.textAlign === "right"
              ? "flex-end"
              : ui.textAlign === "center"
              ? "center"
              : "flex-start",
          marginBottom: "1.5rem",
        }}
      />
    ) : (
      <div
        style={{
          alignSelf:
            ui.textAlign === "right"
              ? "flex-end"
              : ui.textAlign === "center"
              ? "center"
              : "flex-start",
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
  }, []);

  const renderContent = useCallback((subtitleHtml, titleHtml) => {
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
  }, []);

  const renderFooter = useCallback((clientNameHtml, senderNameHtml) => {
    return (
      <div
        style={{
          marginTop: "auto",
          display: "grid",
          gap: "0.5rem",
          fontSize: "0.875rem",
        }}
      >
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
  }, []);

  const renderSidePanelLayout = useCallback(
    ({
      isLeftPanel,
      leftPct,
      rightPct,
      bgImage,
      layoutStyles,
      ui,
      backgroundColor,
      dynamicTextColor,
      logoUrl,
      subtitleHtml,
      titleHtml,
      clientNameHtml,
      senderNameHtml,
    }) => {
      return (
        <div
          style={{
            display: "flex",
            width: "100%",
            minHeight: "600px",
            flexDirection: isLeftPanel ? "row" : "row-reverse",
          }}
        >
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
            {renderLogo(ui, logoUrl)}
            {renderContent(subtitleHtml, titleHtml)}
            {renderFooter(clientNameHtml, senderNameHtml)}
          </div>
        </div>
      );
    },
    [renderLogo, renderContent, renderFooter]
  );

  const renderTopPanelLayout = useCallback(
    ({
      bgImage,
      layoutStyles,
      ui,
      backgroundColor,
      dynamicTextColor,
      logoUrl,
      subtitleHtml,
      titleHtml,
      clientNameHtml,
      senderNameHtml,
    }) => {
      return (
        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
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
            {renderLogo(ui, logoUrl)}
            {renderContent(subtitleHtml, titleHtml)}
            {renderFooter(clientNameHtml, senderNameHtml)}
          </div>
        </div>
      );
    },
    [renderLogo, renderContent, renderFooter]
  );

  const renderBottomPanelLayout = useCallback(
    ({
      bgImage,
      layoutStyles,
      ui,
      backgroundColor,
      dynamicTextColor,
      logoUrl,
      subtitleHtml,
      titleHtml,
      clientNameHtml,
      senderNameHtml,
    }) => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            width: "100%",
            minHeight: "600px",
          }}
        >
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
            {renderLogo(ui, logoUrl)}
            {renderContent(subtitleHtml, titleHtml)}
            {renderFooter(clientNameHtml, senderNameHtml)}
          </div>
        </div>
      );
    },
    [renderLogo, renderContent, renderFooter]
  );

  const renderGridLayout = useCallback(
    ({
      bgImage,
      layoutStyles,
      ui,
      dynamicTextColor,
      logoUrl,
      subtitleHtml,
      titleHtml,
      clientNameHtml,
      senderNameHtml,
    }) => {
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
              {renderLogo(ui, logoUrl)}
              {renderContent(subtitleHtml, titleHtml)}
              {renderFooter(clientNameHtml, senderNameHtml)}
            </div>
          </div>
        </div>
      );
    },
    [renderLogo, renderContent, renderFooter]
  );

  const renderDefaultLayout = useCallback(
    ({
      bgImage,
      layoutStyles,
      ui,
      backgroundColor,
      textColor,
      price,
      logoUrl,
      titleHtml,
      clientNameHtml,
      senderNameHtml,
    }) => {
      // Check if background is white to adjust text color for this layout
      const isWhiteBg = (backgroundColor || "").toLowerCase() === "#ffffff";
      const textColorForLayout = isWhiteBg ? "#333" : textColor;

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
              color: textColorForLayout,
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                {logoUrl ? (
                  <SafeImage
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
                  backgroundColor: isWhiteBg ? "#e9ecef" : "#f8f9fa",
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
                    color: isWhiteBg ? "#000" : "#2d5000",
                    marginBottom: "0.75rem",
                  }}
                >
                  Price
                </h3>
                <div
                  style={{
                    backgroundColor: isWhiteBg ? "#e9ecef" : "#f8f9fa",
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
                      color: isWhiteBg ? "#000" : "#2d5000",
                      textAlign: "center",
                    }}
                  >
                    {price}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: "grid",
                gap: "0.5rem",
                fontSize: "0.875rem",
                marginTop: "1rem",
                width: "100%",
                maxWidth: "500px",
              }}
            >
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
    },
    []
  );

  if (!view) {
    return null;
  }

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
  switch (layoutType) {
    case "left-panel":
      return renderSidePanelLayout({
        isLeftPanel: true,
        leftPct,
        rightPct,
        bgImage,
        layoutStyles,
        ui,
        backgroundColor,
        dynamicTextColor,
        logoUrl,
        subtitleHtml,
        titleHtml,
        clientNameHtml,
        senderNameHtml,
      });
    case "right-panel":
      return renderSidePanelLayout({
        isLeftPanel: false,
        leftPct,
        rightPct,
        bgImage,
        layoutStyles,
        ui,
        backgroundColor,
        dynamicTextColor,
        logoUrl,
        subtitleHtml,
        titleHtml,
        clientNameHtml,
        senderNameHtml,
      });
    case "top-panel":
      return renderTopPanelLayout({
        bgImage,
        layoutStyles,
        ui,
        backgroundColor,
        dynamicTextColor,
        logoUrl,
        subtitleHtml,
        titleHtml,
        clientNameHtml,
        senderNameHtml,
      });
    case "bottom-panel":
      return renderBottomPanelLayout({
        bgImage,
        layoutStyles,
        ui,
        backgroundColor,
        dynamicTextColor,
        logoUrl,
        subtitleHtml,
        titleHtml,
        clientNameHtml,
        senderNameHtml,
      });
    case "grid":
      return renderGridLayout({
        bgImage,
        layoutStyles,
        ui,
        dynamicTextColor,
        logoUrl,
        subtitleHtml,
        titleHtml,
        clientNameHtml,
        senderNameHtml,
      });
    case "default":
      return renderDefaultLayout({
        bgImage,
        layoutStyles,
        ui,
        backgroundColor,
        textColor,
        price,
        logoUrl,
        titleHtml,
        clientNameHtml,
        senderNameHtml,
      });
    default:
      return renderSidePanelLayout({
        isLeftPanel: true,
        leftPct,
        rightPct,
        bgImage,
        layoutStyles,
        ui,
        backgroundColor,
        dynamicTextColor,
        logoUrl,
        subtitleHtml,
        titleHtml,
        clientNameHtml,
        senderNameHtml,
      });
  }
});

// Main Component
export default function ProposalViewer() {
  const [party, setParty] = useState(null);
  const { headerId: idFromPath } = useParams();
  const [sp] = useSearchParams();
  const idsFromQuery = sp.get("ids"); // 🔹 support multiple ids
  const partyId = sp.get("partyId");

  // ✅ Memoize headerIds to avoid infinite re-renders
  const headerIds = useMemo(() => {
    if (idFromPath) return [idFromPath];
    if (idsFromQuery) return idsFromQuery.split(",");
    return [];
  }, [idFromPath, idsFromQuery]);

  const [data, setData] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    if (!headerIds.length) {
      setStatus({ loading: false, error: "Missing headerId" });
      return;
    }

    (async () => {
      try {
        setStatus({ loading: true, error: null });
        const res = await fetch(
          `${API_BASE}/api/headerBlock?ids=${headerIds.join(",")}`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!json.success) throw new Error("API request failed");

        const payload = json?.data || [];

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
  }, [headerIds]);

  useEffect(() => {
    if (!partyId) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/parties/${partyId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error("API failed");
        console.log(
          "🚀 ~ file: ProposalViewer.jsx ~ line 237 ~ json",
          json.data
        );

        setParty(json.data);
      } catch (err) {
        console.error("❌ Party fetch error:", err);
      }
    })();
  }, [partyId]);

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

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
        No proposal data found.
      </div>
    );
  }

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
      <style>{quillStyles}</style>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {data.map((proposal) => (
          <div
            key={proposal.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "0",
              overflow: "hidden",
              boxShadow: "none",
            }}
          >
            <ProposalLayout proposal={proposal} />
            <PartiesView parties={party} />
          </div>
        ))}
      </div>
    </div>
  );
}
