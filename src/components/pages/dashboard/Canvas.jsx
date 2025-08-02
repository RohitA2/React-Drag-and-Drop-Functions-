import { useEffect, forwardRef } from "react";
import { X, Hand, ChevronUp, ChevronDown } from "lucide-react";

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
import { Button } from "react-bootstrap";

const Canvas = forwardRef(
  ({ blocks, onAddBlock, onRemoveBlock, onMoveBlock, onEditBlock }, ref) => {
    useEffect(() => {
      const listener = (e) => {
        const newBlock = { id: Date.now(), type: e.detail };
        onAddBlock(newBlock);
      };
      window.addEventListener("sidebar-block-click", listener);
      return () => window.removeEventListener("sidebar-block-click", listener);
    }, [onAddBlock]);

    const handleDrop = (e) => {
      e.preventDefault();
      const blockType = e.dataTransfer.getData("blockType");
      if (blockType) {
        const newBlock = { id: Date.now(), type: blockType };
        onAddBlock(newBlock);
      }
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleRemoveBlock = (id) => onRemoveBlock(id);

    const renderBlock = (block) => {
      const props = { id: block.id, onRemove: handleRemoveBlock };

      switch (block.type) {
        case "text":
          return <TextEditor {...props} />;
        case "signature":
          return <SignatureBlock {...props} />;
        case "video":
          return <VideoBlock {...props} />;
        case "pdf":
          return <PDFBlock {...props} />;
        case "attachment":
          return <AttachmentBlock {...props} />;
        case "cover":
        case "cover-1":
          return <CoverBlock {...props} />;
        case "cover-2":
          return <CoverBlock2 {...props} />;
        case "cover-3":
          return <CoverBlock3 {...props} />;
        case "cover-4":
          return <CoverBlock4 {...props} />;
        case "cover-5":
          return <CoverBlock5 {...props} />;
        case "parties":
          return <Parties {...props} />;
        case "pricing & services":
          return <PricingAndServices {...props} />;
        case "header":
        case "header-1":
          return <HeaderBlock {...props} />;
        case "header-2":
          return <HeaderBlock2 {...props} />;
        case "header-3":
          return <HeaderBlock3 {...props} />;
        case "header-4":
          return <HeaderBlock4 {...props} />;
        case "terms":
          return <TermsBlock {...props} />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className="flex-grow-1 bg-[#E8EAED] canvas-area  overflow-auto p-4"
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
                        onClick={() => onEditBlock(block)} // Open sidebar
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
