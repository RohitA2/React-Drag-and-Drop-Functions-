import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import PartiesView from "./PartiesView";
import ScheduleView from "./ScheduleView";
import SignatureView from "./SignatureView";
import PdfView from "./PdfView";
import VideoView from "./VideoView";
import AttachmentView from "./AttachmentView";
import TermsView from "./TermsView";
import PriceView from "./PriceView";
import CoverPreview from "./coverPreview";
import axios from "axios";
import TextView from "./TextView";
import { requestForToken, onMessageListener } from "./../../firebase";
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL;
const VAPID = import.meta.env.VITE_FIREBASE_VAPID_KEY

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

// Add only the necessary Quill CSS classes
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

const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
};

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `${API_BASE}${url.startsWith("/") ? url : "/" + url}`;
};

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

  const leftPct = Math.max(0, Math.min(100, Number(ui.leftWidth ?? 50)));
  const rightPct = 100 - leftPct;
  const isWhiteBackground = (backgroundColor || "").toLowerCase() === "#ffffff";
  const dynamicTextColor = isWhiteBackground ? "#333" : textColor;

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

export default function ProposalViewer() {
  const [blocks, setBlocks] = useState([]);
  const [user, setUser] = useState(null);
  const { headerId: idFromPath } = useParams();
  const [sp] = useSearchParams();
  const idsFromQuery = sp.get("ids");
  const parentIdFromQuery = sp.get("parentId");
  const proposalName = sp.get("name");
  const [recipient, setRecipient] = useState(null);
  const [tokenInfoLoaded, setTokenInfoLoaded] = useState(false);
  const token = sp.get("token");
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    if (!parentIdFromQuery) {
      setStatus({ loading: false, error: "Missing parentId" });
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setStatus({ loading: true, error: null });

        let recipient = null;

        if (token) {
          const proposalRes = await axios.get(`${API_BASE}/verify/view-by-token`, {
            params: { token },
          });
          if (!proposalRes.data?.success) throw new Error("Proposal not found");
          recipient = proposalRes.data.data;
        }

        if (isMounted) {
          setRecipient(recipient);
        }

        const res = await fetch(`${API_BASE}/parents/${parentIdFromQuery}/blocks`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (isMounted) {
          setUser(json.user || null);
        }

        const meta = Array.isArray(json?.blocks) ? json.blocks : [];
        const sortedMeta = [...meta].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );

        const blocksWithData = await Promise.all(
          sortedMeta.map(async (blockMeta) => {
            const { type, blockId, id } = blockMeta;
            const actualId = blockId || id;
            console.log("actualId", actualId);
            try {
              let data = null;

              switch (type) {
                case "header-1":
                case "header-2":
                case "header-3":
                case "header-4":
                case "header-5":
                  const resHeaders = await fetch(`${API_BASE}/api/headerBlock?ids=${actualId}`);
                  if (resHeaders.ok) {
                    const jsonHeaders = await resHeaders.json();
                    if (jsonHeaders.success && Array.isArray(jsonHeaders.data)) {
                      data = jsonHeaders.data[0] || null;
                    }
                  }
                  break;

                case "parties":
                  const partyRes = await axios.get(`${API_BASE}/parties/block/${actualId}`);
                  data = partyRes.data?.success ? partyRes.data.data : null;
                  break;

                case "calender":
                  try {
                    const scheduleRes = await axios.get(`${API_BASE}/schedules/sign/${actualId}`);
                    data = scheduleRes.data?.success ? scheduleRes.data.data || [] : [];
                    console.log("calendar schedules:", data);
                  } catch (error) {
                    console.error("Error loading schedules:", error);
                    data = [];
                  }
                  break;

                case "signature":
                  const signatureRes = await axios.get(`${API_BASE}/signatures/sign/${actualId}`);
                  data = signatureRes.data?.success ? signatureRes.data.data : null;
                  break;

                case "text":
                  const textRes = await axios.get(`${API_BASE}/text/${actualId}/${parentIdFromQuery}`);
                  data = textRes.data?.success ? textRes.data.data : null;
                  break;

                case "pdf":
                  const pdfRes = await axios.get(`${API_BASE}/api/pdfblocks/${actualId}`);
                  data = pdfRes.data?.data || null;
                  break;

                case "video":
                  const videoRes = await axios.get(`${API_BASE}/video/${actualId}`);
                  data = videoRes.data?.data || null;
                  break;

                case "link":
                  const attachmentRes = await axios.get(`${API_BASE}/attachments/data/${actualId}`);
                  data = attachmentRes.data?.success ? attachmentRes.data.data : null;
                  break;

                case "terms":
                  const termsRes = await axios.get(`${API_BASE}/terms/get/${actualId}/${parentIdFromQuery}`);
                  data = termsRes.data?.success ? termsRes.data.data : null;
                  break;

                case "price":
                case "price-2":
                case "price-3": // Added price-2 and price-3 to handle all price types
                  const priceRes = await axios.get(`${API_BASE}/pricing/${actualId}`);
                  data = priceRes.data?.success ? priceRes.data.data : null;
                  break;

                case "cover":
                case "cover-1":
                case "cover-2":
                case "cover-3":
                case "cover-4":
                case "cover-5":
                  const coverRes = await axios.get(`${API_BASE}/cover/coverBlock/${actualId}`);
                  data = coverRes.data?.success ? coverRes.data.data : null;
                  break;

                default:
                  console.warn(`Unknown block type: ${type}`);
              }

              return { ...blockMeta, data };
            } catch (error) {
              console.error(`Error fetching data for ${type} block:`, error);
              return { ...blockMeta, data: null, error: error.message };
            }
          })
        );

        if (isMounted) {
          setBlocks(blocksWithData);
          setStatus({ loading: false, error: null });
        }
      } catch (e) {
        if (isMounted) setStatus({ loading: false, error: e.message || "Error" });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [parentIdFromQuery, token]);


  useEffect(() => {
    if (!recipient?.id) return;

    let unsubscribe = () => { };

    const initPush = async () => {
      try {
        const token = await requestForToken();
        if (!token) return;

        console.log("FCM Token:", token);

        // SAVE TO YOUR BACKEND
        await axios.post(`${API_BASE}/schedules/save-fcm-token-recipent`, {
          id: recipient.id,
          token,
        });

        toast.success("Live updates enabled!", {
          icon: "Bell",
          duration: 4000,
        });

        // LISTEN FOR FOREGROUND MESSAGES
        unsubscribe = onMessageListener().then((payload) => {
          const { title, body } = payload.notification || {};
          toast.success(`${title}\n${body}`, {
            duration: 8000,
            style: {
              borderRadius: "16px",
              background: "linear-gradient(135deg, #1e293b, #334155)",
              color: "#fff",
              fontWeight: 600,
            },
          });
        });
      } catch (err) {
        console.error("Push Error:", err);
      }
    };

    initPush();

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [recipient?.id]);

  if (status.loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          fontFamily: "Inter, Arial, sans-serif",
          background: "#f5f7fa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          ></div>
          <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
            Loading Proposal
          </h3>
          <p style={{ margin: 0, color: "#7f8c8d" }}>
            We're preparing your document, please wait...
          </p>
          <style>
            {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
          </style>
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          fontFamily: "Inter, Arial, sans-serif",
          background: "#f5f7fa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#ffebee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "30px",
              color: "#f44336",
            }}
          >
            ⚠️
          </div>
          <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
            Failed to Load Document
          </h3>
          <p
            style={{
              margin: "0 0 20px 0",
              color: "#7f8c8d",
              padding: "10px",
              backgroundColor: "#fff5f5",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {status.error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          fontFamily: "Inter, Arial, sans-serif",
          background: "#f5f7fa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              opacity: "0.7",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="80"
              height="80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="#bdc3c7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="#bdc3c7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 13H8"
                stroke="#bdc3c7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17H8"
                stroke="#bdc3c7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 9H9H8"
                stroke="#bdc3c7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
            No Proposal Found
          </h3>
          <p style={{ margin: 0, color: "#7f8c8d" }}>
            The document you're looking for doesn't exist or hasn't been created
            yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-viewer"
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
        {blocks.map((block) => {
          const { type, data, blockId } = block;

          switch (type) {
            case "header-1":
            case "header-2":
            case "header-3":
            case "header-4":
            case "header-5":
              return (
                <div
                  key={blockId || block.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "0",
                    overflow: "hidden",
                    boxShadow: "none",
                  }}
                >
                  <ProposalLayout proposal={data} />
                </div>
              );

            case "parties":
              return <PartiesView key={blockId || block.id} parties={data} />;

            case "calender":
              return null;

            case "signature":
              return (
                <SignatureView
                  key={blockId || block.id}
                  Signature={data}
                  signatureId={data?.blockId}
                  user={user}
                  proposalName={proposalName}
                  blockId={blockId}
                  parentId={parentIdFromQuery}
                  recipient={recipient}
                />
              );

            case "text":
              return (
                <TextView
                  key={blockId || block.id}
                  blockId={data?.blockId || data?.id}
                  title={data?.title}
                  content={data?.content}
                />
              );

            case "terms":
              return <TermsView key={blockId || block.id} terms={data} />;

            case "pdf":
              return data ? (
                <PdfView
                  key={blockId || block.id}
                  fileUrl={`${API_BASE}${data.pdf}`}
                />
              ) : null;

            case "video":
              return data ? (
                <VideoView key={blockId || block.id} videoUrl={data.video} />
              ) : null;

            case "link":
              return data ? (
                <AttachmentView
                  key={blockId || block.id}
                  attachments={Array.isArray(data) ? data : [data]}
                />
              ) : null;

            case "price":
            case "price-2":
            case "price-3": // Handle all price variants
              return data ? (
                <PriceView key={blockId || block.id} price={data} />
              ) : null;

            case "cover":
            case "cover-1":
            case "cover-2":
            case "cover-3":
            case "cover-4":
            case "cover-5":
              return data ? (
                <CoverPreview key={blockId || block.id} cover={data} />
              ) : null;

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}