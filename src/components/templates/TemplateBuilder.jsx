// src/pages/TemplateBuilder.js
import React, { useState, useRef, useCallback } from "react";
import Sidebar from "../Sidebar";
import Canvas from "../pages/dashboard/Canvas";
import HeaderBar from "../Header";
import BlockSettingsPanel from "../pages/dashboard/BlockSettingsPanel";
import { v4 as uuidv4 } from "uuid";

const API_URL = import.meta.env.VITE_API_URL;

const TemplateBuilder = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [activeBlock, setActiveBlock] = useState(null);
  const canvasRef = useRef(null);

  const handleAddBlock = useCallback((newBlock) => {
    const blockId = uuidv4();
    setBlocks((prev) => [
      ...prev,
      {
        ...newBlock,
        id: blockId,
        settings: {
          layoutType: newBlock.settings?.layoutType || "left-panel",
          backgroundColor: newBlock.settings?.backgroundColor || "#2d5000",
          textColor: newBlock.settings?.textColor || "#ffffff",
          backgroundImage:
            newBlock.settings?.backgroundImage ||
            `${API_URL}/uploads/1756115657883.png`,
          textAlign: newBlock.settings?.textAlign || "left",
          ...newBlock.settings,
        },
      },
    ]);
  }, []);

  const handleRemoveBlock = useCallback(
    (id) => {
      setBlocks((prev) => prev.filter((block) => block.id !== id));
      if (activeBlock?.id === id) {
        setActiveBlock(null);
      }
    },
    [activeBlock]
  );

  const handleMoveBlock = useCallback(
    (index, direction) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      setBlocks((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(index, 1);
        updated.splice(newIndex, 0, moved);
        return updated;
      });
    },
    [blocks.length]
  );

  const handleBlockSettingsChange = useCallback((blockId, newSettings) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, settings: { ...block.settings, ...newSettings } }
          : block
      )
    );
  }, []);

  const getActiveBlockSettings = useCallback(() => {
    if (!activeBlock) return null;
    const block = blocks.find((b) => b.id === activeBlock.id);
    return block ? block.settings : null;
  }, [activeBlock, blocks]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  const handleEditBlock = useCallback((block) => {
    setActiveBlock({ id: block.id, type: block.type });
  }, []);

  const hasSignatureBlock = blocks.some((block) => block.type === "signature");
  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <div className="flex-shrink-0" style={{ zIndex: 1020 }}>
        <HeaderBar
          toggleSidebar={toggleSidebar}
          hasElementsOnCanvas={blocks.length > 0}
          canvasRef={canvasRef}
          onAddBlock={handleAddBlock}
          hasSignatureBlock={hasSignatureBlock}
          blocks={blocks}
          defaultSettings={getActiveBlockSettings()}
        />
      </div>

      {/* Sidebar + Canvas */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <div
            className="h-100 bg-[#E8EAED] border-end shadow-sm thin-scrollbar"
            style={{
              width: "270px",
              maxWidth: "270px",
              transition: "width 0.3s ease",
              overflow: "hidden",
            }}
          >
            <Sidebar />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-grow-1 overflow-auto p-0 bg-[#E8EAED] thin-scrollbar">
          <Canvas
            ref={canvasRef}
            blocks={blocks}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            onMoveBlock={handleMoveBlock}
            onEditBlock={handleEditBlock}
            onSettingsChange={handleBlockSettingsChange}
          />
        </div>

        {/* Settings Panel */}
        {activeBlock && (
          <BlockSettingsPanel
            activeBlock={activeBlock}
            onClose={() => setActiveBlock(null)}
            block={blocks.find((b) => b.id === activeBlock.id)} // Pass full block data
            onSettingsChange={handleBlockSettingsChange}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateBuilder;
