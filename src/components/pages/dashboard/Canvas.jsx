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
import TermsBlock from "../../Blocks/TermsBlock";

const Canvas = forwardRef(
  (
    { blocks, onAddBlock, onRemoveBlock, onMoveBlock, onEditBlock, onSettingsChange },
    ref
  ) => {
    useEffect(() => {
      const listener = (e) => {
        const newBlock = { 
          id: Date.now(), 
          type: e.detail,
          settings: getDefaultSettings(e.detail)
        };
        onAddBlock(newBlock);
      };
      window.addEventListener("sidebar-block-click", listener);
      return () => window.removeEventListener("sidebar-block-click", listener);
    }, [onAddBlock]);

    const getDefaultSettings = (blockType) => {
      if (blockType.includes('header')) {
        return {
          layoutType: "left-panel",
          backgroundColor: "#2d5000",
          textColor: "#ffffff",
          backgroundImage: "images/bird.jpg",
          title: "Sales Proposal",
          subtitle: "Optional",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null
        };
      }
      return {};
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const blockType = e.dataTransfer.getData("blockType");
      if (blockType) {
        const newBlock = { 
          id: Date.now(), 
          type: blockType,
          settings: getDefaultSettings(blockType)
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
        onSettingsChange: (newSettings) => onSettingsChange(block.id, newSettings)
      };

      // For header blocks, pass all settings as props
      if (block.type.includes('header')) {
        const headerProps = {
          ...commonProps,
          ...block.settings,
          onClick: () => onEditBlock(block)
        };

        switch (block.type) {
          case "header":
          case "header-1":
            return <HeaderBlock {...headerProps} />;
          case "header-2":
            return <HeaderBlock2 {...headerProps} />;
          case "header-3":
            return <HeaderBlock3 {...headerProps} />;
          case "header-4":
            return <HeaderBlock4 {...headerProps} />;
          default:
            return <HeaderBlock {...headerProps} />;
        }
      }

      // For other blocks
      switch (block.type) {
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
                className="position-relative"
                style={{
                  width: "100%",
                  backgroundColor: "#E8EAED",
                  marginBottom: "2rem"
                }}
              >
                <div className="position-relative hover-wrapper">
                  {/* Render the block content */}
                  <div style={{ width: "100%" }}>{renderBlock(block)}</div>

                  {/* Control Panel (visible on hover) */}
                  <div className="control-panel position-absolute top-0 end-0 p-1 z-3 d-flex flex-column align-items-end">
                    {/* Edit and Move */}
                    <div className="d-flex align-items-start gap-1 mb-1">
                      {/* Edit Button */}
                      <Button
                        className="bg-white rounded d-flex align-items-center border px-2 py-1 shadow-sm"
                        onClick={() => onEditBlock(block)}
                      > 
                        <span className="me-2 fw-semibold text-secondary">Edit</span>
                        <div
                          className="d-flex flex-wrap"
                          style={{ width: 16, height: 16, gap: 2 }}
                        >
                          <span
                            className="rounded-circle"
                            style={{
                              width: 6,
                              height: 6,
                              backgroundColor: "red",
                            }}
                          ></span>
                          <span
                            className="rounded-circle"
                            style={{
                              width: 6,
                              height: 6,
                              backgroundColor: "orange",
                            }}
                          ></span>
                          <span
                            className="rounded-circle"
                            style={{
                              width: 6,
                              height: 6,
                              backgroundColor: "cyan",
                            }}
                          ></span>
                          <span
                            className="rounded-circle"
                            style={{
                              width: 6,
                              height: 6,
                              backgroundColor: "blue",
                            }}
                          ></span>
                        </div>
                      </Button>

                      {/* Move Controls */}
                      <div className="bg-white rounded d-flex flex-column border shadow-sm">
                        <button
                          className="btn btn-sm btn-white border-0 p-1"
                          onClick={() => onMoveBlock(index, -1)}
                          disabled={index === 0}
                        >
                          <ChevronUp size={14} className="text-dark" />
                        </button>
                        <button
                          className="btn btn-sm btn-white border-0 p-1"
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
                      className="btn btn-white border p-1 shadow-sm"
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
          .hover-wrapper .control-panel {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease-in-out;
          }

          .hover-wrapper:hover .control-panel {
            opacity: 1;
            pointer-events: auto;
          }
        `}</style>
      </div>
    );
  }
);

export default Canvas;