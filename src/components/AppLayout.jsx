import React, { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import Canvas from "./pages/dashboard/Canvas";
import HeaderBar from "./HeaderBar";

const AppLayout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const canvasRef = useRef(null);

  // Handler functions remain the same
  const handleAddBlock = (newBlock) => {
    setBlocks((prev) => [...prev, newBlock]);
  };

  const handleRemoveBlock = (id) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const handleSavePdf = () => {
    console.log("Generating PDF...");
  };

  const handleGenerateLink = () => {
    console.log("Generating shareable link...");
  };

  const handleMoveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setBlocks(updated);
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header - sticky */}
      <div className="flex-shrink-0" style={{ zIndex: 1020 }}>
        <HeaderBar
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          hasElementsOnCanvas={blocks.length > 0}
          canvasRef={canvasRef}
        />
      </div>

      {/* Main layout: Sidebar + Canvas */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="h-100 bg-[#E8EAED] border-end shadow-sm thin-scrollbar"
          style={{
            width: sidebarVisible ? "230px" : "0",
            transition: "width 0.3s ease",
            overflow: "hidden",
          }}
        >
          <Sidebar onAddBlock={handleAddBlock} />
        </div>

        {/* Canvas */}
        <div className="flex-grow-1 overflow-auto p-0 bg-[#E8EAED] thin-scrollbar">
          <Canvas
            ref={canvasRef}
            blocks={blocks}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            onMoveBlock={handleMoveBlock}
            onGenerateLink={handleGenerateLink}
          />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;