import { useEffect, forwardRef } from "react";
import { X, Hand, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "react-bootstrap";

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
import HeaderBlock from "../../Blocks/HeaderBlocks/HeaderBlock";
import HeaderBlock2 from "../../Blocks/HeaderBlocks/HeaderBlock2";
import HeaderBlock3 from "../../Blocks/HeaderBlocks/HeaderBlock3";
import HeaderBlock4 from "../../Blocks/HeaderBlocks/HeaderBlock4";
import HeaderBlock5 from "../../Blocks/HeaderBlocks/HeaderBlock5";
import TermsBlock from "../../Blocks/TermsBlock";


const API_URL = import.meta.env.VITE_API_URL

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
    useEffect(() => {
      const listener = (e) => {
        const newBlock = {
          id: Date.now(),
          type: e.detail,
          settings: {
            ...getDefaultSettings(e.detail),
            textAlign: "left", // Explicit default
          },
        };
        onAddBlock(newBlock);
      };
      window.addEventListener("sidebar-block-click", listener);
      return () => window.removeEventListener("sidebar-block-click", listener);
    }, [onAddBlock]);

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
          backgroundColor: "#1a1a2e",
          textColor: "#ffffff",
          backgroundImage: "images/headers/buid.avif",
          title: "Project Proposal",
          subtitle: "For your consideration",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "left",
        },
        "header-3": {
          backgroundColor: "#16213e",
          textColor: "#ffffff",
          backgroundImage: "images/headers/cam.avif",
          title: "Business Proposal",
          subtitle: "Confidential",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "center",
        },
        "header-4": {
          backgroundColor: "#FCCAA4",
          textColor: "#ffffff",
          backgroundImage: "images/headers/flowers.jfif",
          title: "Service Proposal",
          subtitle: "Custom solution",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "center",
        },
        "header-5": {
          backgroundColor: "#B4D2E5",
          textColor: "#ffffff",
          backgroundImage: "images/headers/bird.jpg",
          title: "Service Proposal",
          subtitle: "Custom solution",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "center",
        },
        // Cover blocks
        cover: {
          backgroundColor: "#f8f9fa",
          textColor: "#333333",
          title: "Project Proposal",
          subtitle: "Prepared for",
          companyName: "Client Company",
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
        const newBlock = {
          id: Date.now(),
          type: blockType,
          settings: {
            ...getDefaultSettings(blockType),
            textAlign: "left", // Explicit default for new blocks
          },
        };
        onAddBlock(newBlock);
      }
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleRemoveBlock = (id) => onRemoveBlock(id);

    const renderBlock = (block) => {
      const commonProps = {
        id: block.id,
        onRemove: handleRemoveBlock,
        onSettingsChange: (newSettings) =>
          onSettingsChange(block.id, newSettings),
        ...block.settings,
        textAlign: block.settings?.textAlign || "left",
      };

      switch (block.type) {
        // Header blocks
        case "header":
        case "header-1":
          return (
            <HeaderBlock
              id={block.id}
              onSettingsChange={(newSettings) =>
                onSettingsChange(block.id, newSettings)
              }
              layoutType={block.settings?.layoutType || "left-panel"}
              backgroundImage={
                block.settings?.backgroundImage || "images/headers/leaf.avif"
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
          return <HeaderBlock2 {...commonProps} />;
        case "header-3":
          return <HeaderBlock3 {...commonProps} />;
        case "header-4":
          return <HeaderBlock4 {...commonProps} />;
        case "header-5":
          return <HeaderBlock5 {...commonProps} />;
        // Cover blocks
        case "cover":
        case "cover-1":
          return <CoverBlock {...commonProps} />;
        case "cover-2":
          return <CoverBlock2 {...commonProps} />;
        case "cover-3":
          return <CoverBlock3 {...commonProps} />;
        case "cover-4":
          return <CoverBlock4 {...commonProps} />;
        case "cover-5":
          return <CoverBlock5 {...commonProps} />;

        // Other blocks
        case "text":
          return <TextEditor {...commonProps} />;
        case "signature":
          return <SignatureBlock {...commonProps} />;
        case "video":
          return <VideoBlock {...commonProps} />;
        case "pdf":
          return <PDFBlock {...commonProps} />;
        case "attachment":
          return <AttachmentBlock {...commonProps} />;
        case "parties":
          return <Parties {...commonProps} />;
        case "pricing & services":
          return <PricingAndServices {...commonProps} />;
        case "terms":
          return <TermsBlock {...commonProps} />;
        default:
          return null;
      }
    };

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
          <div className="w-100">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className="position-relative block-container"
                style={{
                  width: "100%",
                  marginBottom: "2rem",
                }}
              >
                <div className="position-relative hover-wrapper">
                  {/* Render the block content */}
                  <div style={{ width: "100%" }}>{renderBlock(block)}</div>

                  {/* Control Panel */}
                  <div className="control-panel position-absolute top-0 end-0 p-1 z-3 d-flex flex-column align-items-end"
                  style={{ gap: "6px", margin: "8px" }}>
                    <div className="d-flex align-items-start gap-2 mb-1">
                      {/* Edit Button */}
                      {["text", "header", "header-1", "header-2"].includes(
                        block.type
                      ) && (
                          <Button
                            variant="light"
                            className="rounded d-flex align-items-center justify-content-between border px-1 py-0 shadow-sm"
                            style={{ width: "65px", minWidth: "65px", height: "30px" }}
                            onClick={() => onEditBlock(block)}
                          >
                            <span className="fw-semibold text-secondary" style={{ fontSize: "12px" }}>
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
                      onClick={() => onRemoveBlock(block.id)}
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