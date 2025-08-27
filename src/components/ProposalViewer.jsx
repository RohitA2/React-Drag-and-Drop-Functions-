// src/ProposalViewer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css"; // <-- add this

const API_BASE = import.meta.env.VITE_API_URL


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
  // support /proposal/:headerId OR /proposal?id=...
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

        // API may return { success, data }
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

    // Normalize fields
    const styles = data.styles || {};

    return {
      id: data.id,
      titleHtml: data.title || "",
      subtitleHtml: data.subtitle || "",
      clientNameHtml: data.clientName || styles.clientName || "",
      senderNameHtml: data.senderName || styles.senderName || "",
      logoUrl: data.logoUrl || "", // ✅ pick logo from API
      bgImage: data.backgroundImage || styles.backgroundImage || "",
      backgroundColor:
        data.backgroundColor || styles.backgroundColor || "#2d5000",
      textColor: data.textColor || styles.textColor || "#ffffff",
      ui: merge(
        {
          layoutType: "left-panel",
          leftWidth: 50, // %
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
    ui,
  } = view;

  // layout widths
  const leftPct = Math.max(0, Math.min(100, Number(ui.leftWidth ?? 50)));
  const rightPct = 100 - leftPct;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: 16,
        boxSizing: "border-box",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", width: "100%" }}>
          {/* Left image panel */}
          <div
            style={{
              width: `${leftPct}%`,
              minHeight: 600,
              backgroundImage: `url(${resolveUrl(bgImage)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
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

          {/* Right content panel */}
          <div
            style={{
              width: `${rightPct}%`,
              minHeight: 600,
              backgroundColor: backgroundColor,
              color: textColor,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              textAlign: ui.textAlign,
            }}
          >
            {/* ✅ Logo block */}
            {logoUrl ? (
              <img
                src={resolveUrl(logoUrl)}
                alt="Logo"
                style={{
                  maxHeight: 60,
                  objectFit: "contain",
                  alignSelf:
                    ui.textAlign === "right" ? "flex-end" : "flex-start",
                  marginBottom: 24,
                }}
              />
            ) : (
              <div
                style={{
                  alignSelf:
                    ui.textAlign === "right" ? "flex-end" : "flex-start",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                Logo
              </div>
            )}

            {/* Subtitle */}
            {subtitleHtml && (
              <div
                className="ql-editor"
                style={{
                  opacity: 0.85,
                  marginBottom: 16,
                  fontSize: 14,
                  whiteSpace: "pre-wrap", // keep formatting but allow wrapping
                  overflow: "visible", // ensure no scroll
                  maxHeight: "none", // prevent clipping
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
                  fontSize: 18,
                  whiteSpace: "pre-wrap",
                  overflow: "visible", // no scroll
                  maxHeight: "none", // no restriction
                }}
                dangerouslySetInnerHTML={{ __html: titleHtml }}
              />
            )}

            {/* spacer pushes footer to bottom */}
            <div style={{ flex: 1 }} />

            {/* Footer: client & sender */}
            <div style={{ display: "grid", gap: 16, fontSize: 14 }}>
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
      </div>
    </div>
  );
}
