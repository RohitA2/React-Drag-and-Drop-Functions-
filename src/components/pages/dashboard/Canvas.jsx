import { useEffect, useRef, useState, forwardRef, useCallback } from "react";
import { X, Hand, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";
// Import all your block components
import TextEditor from "../../Blocks/TextEditor";
import SignatureBlock from "../../Blocks/SignatureBlock";
import VideoBlock from "../../Blocks/VideoBlock";
import PDFBlock from "../../Blocks/PDFBlock";
import AttachmentBlock from "../../Blocks/AttachmentBlock";
import CoverBlock from "../../Blocks/CoverBlocks/CoverBlock";
import CoverBlock2 from "../../Blocks/CoverBlocks/CoverBlock2";
import CoverBlock3 from "../../Blocks/CoverBlocks/CoverBlock3";
import CoverBlock4 from "../../Blocks/CoverBlocks/CoverBlock4";
import CoverBlock5 from "../../Blocks/CoverBlocks/CoverBlock5";
import Parties from "../../Blocks/PartiesBlock";
import PricingAndServices from "../../Blocks/PricingAndServices";
import PricingAndServices2 from "../../Blocks/PricingAndServices2";
import PricingAndServices3 from "../../Blocks/PricingAndServices3";
import HeaderBlock from "../../Blocks/HeaderBlocks/HeaderBlock";
import HeaderBlock2 from "../../Blocks/HeaderBlocks/HeaderBlock2";
import HeaderBlock3 from "../../Blocks/HeaderBlocks/HeaderBlock3";
import HeaderBlock4 from "../../Blocks/HeaderBlocks/HeaderBlock4";
import HeaderBlock5 from "../../Blocks/HeaderBlocks/HeaderBlock5";
import TermsBlock from "../../Blocks/TermsBlock";
import Schedule from "../../Blocks/Schedule";

const API_URL = import.meta.env.VITE_API_URL;

const Canvas = forwardRef(
  (
    {
      blocks,
      onAddBlock,
      onRemoveBlock,
      onMoveBlock,
      onEditBlock,
      onSettingsChange,
    },
    ref
  ) => {
    const user_id = useSelector(selectedUserId);
    const parentIdRef = useRef(null);
    const [isCreatingParent, setIsCreatingParent] = useState(false);
    const [isParentReady, setIsParentReady] = useState(false);

    // Function to create a parent
    const createParent = useCallback(async () => {
      if (isCreatingParent) return parentIdRef.current;

      setIsCreatingParent(true);
      try {
        const res = await fetch(`${API_URL}/parents/CreateParent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        if (data && data.id) {
          // ✅ Use only the ref for consistency
          parentIdRef.current = data.id;
          localStorage.setItem("parentId", data.id);
          setIsParentReady(true);
          return data.id;
        }
      } catch (error) {
        console.error("Failed to create parent:", error);
      } finally {
        setIsCreatingParent(false);
      }
      return null;
    }, [user_id, isCreatingParent]);

    // Verify if a parent exists
    const verifyParentExists = useCallback(async (id) => {
      try {
        const probe = await fetch(`${API_URL}/parents/${id}/block-ids`, {
          method: "GET",
        });
        return probe.ok;
      } catch {
        return false;
      }
    }, []);

    // Initialize parent on mount
    useEffect(() => {
      const initializeParent = async () => {
        const storedId = localStorage.getItem("parentId");

        if (storedId) {
          const exists = await verifyParentExists(storedId);
          if (exists) {
            // ✅ Use the valid storedId
            parentIdRef.current = storedId;
            setIsParentReady(true);
            return;
          } else {
            // ❌ invalid → clean up
            localStorage.removeItem("parentId");
          }
        }

        // ✅ always create a fresh one if none or invalid
        await createParent();
      };

      initializeParent();
    }, [verifyParentExists, createParent]);

    // Ensure we have a valid parent before API calls
    const ensureParentExists = useCallback(async () => {
      if (parentIdRef.current) {
        const exists = await verifyParentExists(parentIdRef.current);
        if (exists) return parentIdRef.current;
      }
      if (isCreatingParent) return parentIdRef.current;

      return await createParent();
    }, [verifyParentExists, createParent, isCreatingParent]);

    useEffect(() => {
      const listener = (e) => {
        onAddBlock({
          type: e.detail,
          settings: {
            ...getDefaultSettings(e.detail),
            textAlign: "left",
          },
        });
      };
      window.addEventListener("sidebar-block-click", listener);
      return () => window.removeEventListener("sidebar-block-click", listener);
    }, [onAddBlock]);

    // Persist block order on render/change
    useEffect(() => {
      if (!Array.isArray(blocks) || blocks.length === 0) return;
      if (!parentIdRef.current) return; // 👈 wait until parent is set

      const persistBlockOrder = async () => {
        const existingParentId = await ensureParentExists();
        if (!existingParentId) return;

        const payload = {
          blocks: blocks.map((b, index) => ({
            id: b.id,
            type: b.type,
            name: b.name || null,
            orderIndex: index,
          })),
        };

        try {
          await fetch(`${API_URL}/parents/${existingParentId}/blocks/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (error) {
          console.error("Failed to store block order:", error);
        }
      };

      const timeout = setTimeout(persistBlockOrder, 500);
      return () => clearTimeout(timeout);
    }, [blocks, ensureParentExists]);

    const getDefaultSettings = (blockType) => {
      const defaults = {
        // Header blocks
        "header-1": {
          layoutType: "left-panel",
          backgroundColor: "#2d5000",
          textColor: "#ffffff",
          backgroundImage: `${API_URL}/uploads/1756115657883.png`,
          title: "Sales Proposal",
          subtitle: "Optional",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "left",
        },
        "header-2": {
          layoutType: "right-panel",
          backgroundColor: "#1a1a2e",
          textColor: "#ffffff",
          backgroundImage: `${API_URL}/uploads/1756892631033.avif`,
          title: "Project Proposal",
          subtitle: "For your consideration",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "left",
        },
        "header-3": {
          layoutType: "bottom-panel",
          backgroundColor: "#16213e",
          textColor: "#ffffff",
          backgroundImage: `${API_URL}/uploads/1756892487290.avif`,
          title: "Business Proposal",
          subtitle: "Confidential",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "center",
        },
        "header-4": {
          layoutType: "top-panel",
          backgroundColor: "#FCCAA4",
          textColor: "#ffffff",
          backgroundImage: `${API_URL}/uploads/1756892697938.jfif`,
          title: "Service Proposal",
          subtitle: "Custom solution",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "center",
        },
        "header-5": {
          layoutType: "grid",
          backgroundColor: "#B4D2E5",
          textColor: "#ffffff",
          backgroundImage: `${API_URL}/uploads/1756884733919.avif`,
          title: "Service Proposal",
          subtitle: "Custom solution",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "center",
        },
        "cover-1": {
          "cover-1": {
            backgroundColor: "#f8f9fa", // 👈 initially color
            backgroundImage: null, // 👈 explicitly null
            backgroundVideo: null,
            backgroundGradient: null,
            overlay: true,
            textColor: "#ffffff",
            textAlign: "center",
            blur: 0,
            filter: "none",
          },
        },
        "cover-2": {
          backgroundImage: `${API_URL}/uploads/1756884733919.avif`,
          textColor: "#222222",
          textAlign: "left",
        },
        "cover-3": {
          backgroundVideo: `${API_URL}/uploads/sample-video.mp4`,
          overlay: true,
          textColor: "#ffffff",
          textAlign: "center",
        },
        "cover-4": {
          backgroundGradient:
            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          textColor: "#222222",
          textAlign: "left",
        },
        "cover-5": {
          backgroundImage: `${API_URL}/uploads/cover5.avif`,
          backgroundColor: "#EDEDED",
          textColor: "#111111",
          textAlign: "center",
        },
        // Other blocks
        text: {
          content: "Enter your text here...",
          fontSize: "16px",
          textColor: "#333333",
        },
      };

      return defaults[blockType] || {};
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const blockType = e.dataTransfer.getData("blockType");
      if (blockType) {
        onAddBlock({
          type: blockType,
          settings: {
            ...getDefaultSettings(blockType),
            textAlign: "left",
          },
        });
      }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleRemoveBlock = useCallback(
      async (id) => {
        // Before removing, check if this is a header block and clean up localStorage
        const blockToRemove = blocks.find((block) => block.id === id);

        if (blockToRemove && blockToRemove.type.startsWith("header")) {
          // Remove any stored header ID for this block
          localStorage.removeItem("headerId");
          console.log("Cleaned up header ID for removed block:", id);
        }

        try {
          const existingParentId = await ensureParentExists();
          if (!existingParentId) throw new Error("Missing parent id");

          await fetch(`${API_URL}/parents/${existingParentId}/blocks/${id}`, {
            method: "DELETE",
          });
        } catch (error) {
          console.error("Failed to delete block from server:", error);
        } finally {
          onRemoveBlock(id);
        }
      },
      [blocks, onRemoveBlock, ensureParentExists]
    );

    const renderBlock = (block) => {
      const commonProps = {
        id: block.id,
        onRemove: handleRemoveBlock,
        onSettingsChange: (newSettings) =>
          onSettingsChange(block.id, newSettings),
        parentId: parentIdRef.current,
        settings: block.settings, // Add settings here
        ...block.settings, // Keep this for backward compatibility
        textAlign: block.settings?.textAlign || "left",
      };

      switch (block.type) {
        // Header blocks
        case "header":
        case "header-1":
          return (
            <HeaderBlock
              id={block.id}
              parentId={parentIdRef.current}
              onSettingsChange={(newSettings) =>
                onSettingsChange(block.id, newSettings)
              }
              layoutType={block.settings?.layoutType || "left-panel"}
              backgroundImage={
                block.settings?.backgroundImage ||
                `${API_URL}/uploads/1756115657883.png`
              }
              backgroundColor={block.settings?.backgroundColor || "#2d5000"}
              textColor={block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={block.settings?.textAlign || "left"}
              initialTitle={block.settings?.title || "Sales Proposal"}
              initialSubtitle={block.settings?.subtitle || "Optional"}
              initialClientName={
                block.settings?.clientName || "Prepared by Client name"
              }
              initialSenderName={block.settings?.senderName || "By Sender name"}
              initialPrice={block.settings?.price || "INCL.VAT"}
              initialLogo={block.settings?.logo}
              isPreview={false}
            />
          );
        case "header-2":
          return (
            <HeaderBlock2
              id={block.id}
              parentId={parentIdRef.current}
              onSettingsChange={(newSettings) =>
                onSettingsChange(block.id, newSettings)
              }
              layoutType={block.settings?.layoutType || "right-panel"}
              backgroundImage={
                block.settings?.backgroundImage ||
                `${API_URL}/uploads/1756892631033.avif`
              }
              backgroundColor={block.settings?.backgroundColor || "#2d5000"}
              textColor={block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={block.settings?.textAlign || "left"}
              initialTitle={block.settings?.title || "Sales Proposal"}
              initialSubtitle={block.settings?.subtitle || "Optional"}
              initialClientName={
                block.settings?.clientName || "Prepared by Client name"
              }
              initialSenderName={block.settings?.senderName || "By Sender name"}
              initialPrice={block.settings?.price || "INCL.VAT"}
              initialLogo={block.settings?.logo}
              isPreview={false}
            />
          );
        case "header-3":
          return (
            <HeaderBlock3
              id={block.id}
              parentId={parentIdRef.current}
              onSettingsChange={(newSettings) =>
                onSettingsChange(block.id, newSettings)
              }
              layoutType={block.settings?.layoutType || "top-panel"}
              backgroundImage={
                block.settings?.backgroundImage ||
                `${API_URL}/uploads/1756892487290.avif`
              }
              backgroundColor={block.settings?.backgroundColor || "#2d5000"}
              textColor={block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={block.settings?.textAlign || "left"}
              initialTitle={block.settings?.title || "Sales Proposal"}
              initialSubtitle={block.settings?.subtitle || "Optional"}
              initialClientName={
                block.settings?.clientName || "Prepared by Client name"
              }
              initialSenderName={block.settings?.senderName || "By Sender name"}
              initialPrice={block.settings?.price || "INCL.VAT"}
              initialLogo={block.settings?.logo}
              isPreview={false}
            />
          );
        case "header-4":
          return (
            <HeaderBlock4
              id={block.id}
              parentId={parentIdRef.current}
              onSettingsChange={(newSettings) =>
                onSettingsChange(block.id, newSettings)
              }
              layoutType={block.settings?.layoutType || "bottom-panel"}
              backgroundImage={
                block.settings?.backgroundImage ||
                `${API_URL}/uploads/1756892697938.jfif`
              }
              backgroundColor={block.settings?.backgroundColor || "#2d5000"}
              textColor={block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={block.settings?.textAlign || "left"}
              initialTitle={block.settings?.title || "Sales Proposal"}
              initialSubtitle={block.settings?.subtitle || "Optional"}
              initialClientName={
                block.settings?.clientName || "Prepared by Client name"
              }
              initialSenderName={block.settings?.senderName || "By Sender name"}
              initialPrice={block.settings?.price || "INCL.VAT"}
              initialLogo={block.settings?.logo}
              isPreview={false}
            />
          );
        case "header-5":
          return (
            <HeaderBlock5
              id={block.id}
              parentId={parentIdRef.current}
              onSettingsChange={(newSettings) =>
                onSettingsChange(block.id, newSettings)
              }
              layoutType={block.settings?.layoutType || "grid"}
              backgroundImage={
                block.settings?.backgroundImage ||
                `${API_URL}/uploads/1756884733919.avif`
              }
              backgroundColor={block.settings?.backgroundColor || "#2d5000"}
              textColor={block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={block.settings?.textAlign || "left"}
              initialTitle={block.settings?.title || "Sales Proposal"}
              initialSubtitle={block.settings?.subtitle || "Optional"}
              initialClientName={
                block.settings?.clientName || "Prepared by Client name"
              }
              initialSenderName={block.settings?.senderName || "By Sender name"}
              initialPrice={block.settings?.price || "INCL.VAT"}
              initialLogo={block.settings?.logo}
              isPreview={false}
            />
          );
        // Cover blocks
        case "cover":
        case "cover-1":
          return (
            <CoverBlock
              key={block.id}
              settings={block.settings}
              parentId={parentIdRef.current}
              blockId={block.id}
            />
          );

        case "cover-2":
          return <CoverBlock2 key={block.id} cover={block.settings} />;

        case "cover-3":
          return <CoverBlock3 key={block.id} cover={block.settings} />;

        case "cover-4":
          return <CoverBlock4 key={block.id} cover={block.settings} />;

        case "cover-5":
          return <CoverBlock5 key={block.id} cover={block.settings} />;

        // Other blocks
        case "text":
          return (
            <TextEditor
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "signature":
          return (
            <SignatureBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "video":
          return (
            <VideoBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "pdf":
          return (
            <PDFBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "link":
          return (
            <AttachmentBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "parties":
          return (
            <Parties
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "price":
          return (
            <PricingAndServices
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "price-2":
          return (
            <PricingAndServices2
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "price-3":
          return (
            <PricingAndServices3
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "terms":
          return (
            <TermsBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "calender":
          return (
            <Schedule
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        default:
          return null;
      }
    };

    // Don't render blocks until parentId is ready
    if (!isParentReady) {
      return (
        <div className="flex-grow-1 bg-[#E8EAED] d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="flex-grow-1 bg-[#E8EAED] canvas-area overflow-auto p-4"
        style={{
          maxWidth: "100%",
          minHeight: "100vh",
          padding: "2rem 1rem",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          id="floating-quill-toolbar-container"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 9999 }}
        />

        {blocks.length === 0 ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
              minHeight: "80vh",
              color: "#888",
              textAlign: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid #0aaeff",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "relative",
                  width: "80px",
                  height: "10px",
                  backgroundColor: "#ddd",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    left: "0",
                    animation: "handMove 3s infinite ease-in-out",
                  }}
                >
                  <Hand size={22} color="#666" />
                </div>
              </div>
            </div>

            <p style={{ fontSize: "12px" }}>
              Start with{" "}
              <span style={{ color: "#3C3C3C", fontWeight: "bold" }}>
                drag & <br /> dropping
              </span>{" "}
              a block from <br /> the left menu.
            </p>

            <style>{`
              @keyframes handMove {
                0% { transform: translateX(0); }
                50% { transform: translateX(50px); }
                100% { transform: translateX(0); }
              }
            `}</style>
          </div>
        ) : (
          <div
            id={`block-group-${parentIdRef.current}`}
            data-parent-id={parentIdRef.current}
            className="w-100"
          >
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className="position-relative block-container"
                style={{
                  width: "100%",
                  marginBottom: "0",
                }}
              >
                <div className="position-relative hover-wrapper">
                  {/* Render the block content */}
                  <div style={{ width: "100%" }}>{renderBlock(block)}</div>

                  {/* Control Panel */}
                  <div
                    className="control-panel position-absolute top-0 end-0 p-1 z-3 d-flex flex-column align-items-end"
                    style={{ gap: "6px", margin: "8px" }}
                  >
                    <div className="d-flex align-items-start gap-2 mb-1">
                      {/* Edit Button */}
                      {[
                        "header",
                        "header-1",
                        "header-2",
                        "header-3",
                        "header-4",
                        "header-5",
                        "cover",
                        "cover-1",
                        "cover-2",
                        "cover-3",
                        "cover-4",
                        "cover-5",
                      ].includes(block.type) && (
                        <Button
                          variant="light"
                          className="rounded d-flex align-items-center justify-content-between border px-1 py-0 shadow-sm"
                          style={{
                            width: "65px",
                            minWidth: "65px",
                            height: "30px",
                          }}
                          onClick={() => onEditBlock(block)}
                        >
                          <span
                            className="fw-semibold text-secondary"
                            style={{ fontSize: "12px" }}
                          >
                            Edit
                          </span>
                          <div
                            className="d-flex flex-wrap"
                            style={{ width: 12, height: 12, gap: 1 }}
                          >
                            {["red", "orange", "cyan", "blue"].map((color) => (
                              <span
                                key={color}
                                className="rounded-circle"
                                style={{
                                  width: 4,
                                  height: 4,
                                  backgroundColor: color,
                                }}
                              />
                            ))}
                          </div>
                        </Button>
                      )}
                      {/* Move Controls */}
                      <div
                        className="bg-white rounded d-flex flex-column border shadow-sm"
                        style={{ width: "28px", padding: "0" }}
                      >
                        <button
                          className="btn btn-sm btn-white border-0 p-1"
                          style={{ minWidth: "0", padding: "2px" }}
                          onClick={() => onMoveBlock(index, -1)}
                          disabled={index === 0}
                        >
                          <ChevronUp size={14} className="text-dark" />
                        </button>
                        <button
                          className="btn btn-sm btn-white border-0 p-1"
                          style={{ minWidth: "0", padding: "2px" }}
                          onClick={() => onMoveBlock(index, 1)}
                          disabled={index === blocks.length - 1}
                        >
                          <ChevronDown size={14} className="text-dark" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveBlock(block.id)}
                      className=" bg-white border rounded  shadow-sm"
                      aria-label="Remove block"
                    >
                      <X size={14} className="text-danger" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <style>{`
          .hover-wrapper:hover .control-panel {
            opacity: 1;
            pointer-events: auto;
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
  }
);

Canvas.displayName = "Canvas";
export default Canvas;
