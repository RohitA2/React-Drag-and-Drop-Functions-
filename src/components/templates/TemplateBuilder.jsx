// src/pages/TemplateBuilder.js
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom"; // Import useLocation
import Sidebar from "../Sidebar";
import Canvas from "../pages/dashboard/Canvas";
import HeaderBar from "../Header";
import BlockSettingsPanel from "../pages/dashboard/BlockSettingsPanel";
import { v4 as uuidv4 } from "uuid";
import {
  selectBlocks,
  selectHasSignatureBlock,
  selectParentId,
  addBlock,
  removeBlock,
  moveBlock,
  updateBlockSettings,
  createNewParent,
  setParentId, // Import setParentId action
  setParentReady, // Import setParentReady action
} from "../../store/canvasSlice";

const API_URL = import.meta.env.VITE_API_URL;

const TemplateBuilder = () => {
  const dispatch = useDispatch();
  const location = useLocation(); // Get location for state
  const blocks = useSelector(selectBlocks);
  const hasSignatureBlock = useSelector(selectHasSignatureBlock);
  const parentId = useSelector(selectParentId);
  
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeBlock, setActiveBlock] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode
  const canvasRef = useRef(null);

  // Get edit project data from navigation state
  const { editProject, projectId, parentId: externalParentId } = location.state || {};

  // Handle edit/new mode initialization
  useEffect(() => {
    if (externalParentId && editProject) {
      console.log("Editing existing project:", editProject);
      console.log("Using parentId:", externalParentId);
      setIsEditing(true);
      // Set the external parent ID in Redux store
      dispatch(setParentId(externalParentId));
      dispatch(setParentReady(true));
    } else {
      console.log("Creating new project");
      setIsEditing(false);
      // If navigated as a new project, clear any persisted parent and reset canvas
      if (location.state?.newProject) {
        try { localStorage.removeItem("parentId"); } catch {}
        dispatch(createNewParent());
      }
    }
  }, [externalParentId, editProject, dispatch, location.state]);

  const handleAddBlock = useCallback((newBlock) => {
    const blockId = uuidv4();
    dispatch(addBlock({
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
    }));
  }, [dispatch]);

  const handleRemoveBlock = useCallback(
    (id) => {
      dispatch(removeBlock(id));
      if (activeBlock?.id === id) {
        setActiveBlock(null);
      }
    },
    [dispatch, activeBlock]
  );

  const handleMoveBlock = useCallback(
    (index, direction) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      dispatch(moveBlock({ index, direction }));
    },
    [dispatch, blocks.length]
  );

  const handleBlockSettingsChange = useCallback((blockId, newSettings) => {
    dispatch(updateBlockSettings({ blockId, newSettings }));
  }, [dispatch]);

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

  const handleNewProposal = useCallback(() => {
    try { localStorage.removeItem("parentId"); } catch {}
    dispatch(createNewParent());
    setActiveBlock(null);
    setIsPreviewMode(false);
    setSidebarVisible(true);
    setIsEditing(false); // Reset edit mode when creating new proposal
  }, [dispatch]);

  const handleTogglePreview = useCallback((isPreview) => {
    setIsPreviewMode(isPreview);
    if (isPreview) {
      setSidebarVisible(false);
      setActiveBlock(null);
    } else {
      setSidebarVisible(true);
    }
  }, []);

  // Update header title based on mode
  const getHeaderTitle = () => {
    if (isEditing && editProject) {
      return `Editing: ${editProject.proposalName}`;
    }
    return "Template Builder";
  };

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
          onNewProposal={handleNewProposal}
          isPreviewMode={isPreviewMode}
          onTogglePreview={handleTogglePreview}
          isEditing={isEditing} // Pass edit mode to header
          editProject={editProject} // Pass edit project data to header
        />
      </div>

      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="bg-warning text-dark py-2 px-3 text-center small">
          <strong>Edit Mode:</strong> You are editing "{editProject?.proposalName}". 
          Changes will update the existing project.
        </div>
      )}

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
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            onMoveBlock={handleMoveBlock}
            onEditBlock={handleEditBlock}
            onSettingsChange={handleBlockSettingsChange}
            isPreviewMode={isPreviewMode}
            externalParentId={externalParentId} // Pass externalParentId for editing
          />
        </div>

        {/* Settings Panel */}
        {activeBlock && !isPreviewMode && (
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