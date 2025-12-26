// // src/pages/TemplateBuilder.js
// import React, { useState, useRef, useCallback, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useLocation } from "react-router-dom"; // Import useLocation
// import Sidebar from "../Sidebar";
// import Canvas from "../pages/dashboard/Canvas";
// import HeaderBar from "../Header";
// import BlockSettingsPanel from "../pages/dashboard/BlockSettingsPanel";
// import { v4 as uuidv4 } from "uuid";
// import {
//   selectBlocks,
//   selectHasSignatureBlock,
//   selectParentId,
//   addBlock,
//   removeBlock,
//   moveBlock,
//   updateBlockSettings,
//   createNewParent,
//   resetForEdit,
// } from "../../store/canvasSlice";

// const API_URL = import.meta.env.VITE_API_URL;

// const TemplateBuilder = () => {
//   const dispatch = useDispatch();
//   const location = useLocation(); // Get location for state
//   const blocks = useSelector(selectBlocks);
//   const hasSignatureBlock = useSelector(selectHasSignatureBlock);
//   const parentId = useSelector(selectParentId);

//   const [sidebarVisible, setSidebarVisible] = useState(true);
//   const [activeBlock, setActiveBlock] = useState(null);
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode
//   const canvasRef = useRef(null);

//   // Get edit project data from navigation state
//   const { editProject, projectId, parentId: externalParentId } = location.state || {};

//   // Handle edit/new mode initialization
//   useEffect(() => {
//     if (externalParentId && editProject) {
//       console.log("Editing existing project:", editProject);
//       console.log("Using parentId:", externalParentId);
//       setIsEditing(true);
//       // Reset canvas state for editing - this clears old data and sets the new parentId
//       dispatch(resetForEdit(externalParentId));
//     } else {
//       console.log("Creating new project");
//       setIsEditing(false);
//       // If navigated as a new project, clear any persisted parent and reset canvas
//       if (location.state?.newProject) {
//         try { localStorage.removeItem("parentId"); } catch {}
//         dispatch(createNewParent());
//       }
//     }
//   }, [externalParentId, editProject, dispatch, location.state]);

//   const handleAddBlock = useCallback((newBlock) => {
//     const blockId = uuidv4();
//     dispatch(addBlock({
//       ...newBlock,
//       id: blockId,
//       settings: {
//         layoutType: newBlock.settings?.layoutType || "left-panel",
//         backgroundColor: newBlock.settings?.backgroundColor || "#2d5000",
//         textColor: newBlock.settings?.textColor || "#ffffff",
//         backgroundImage:
//           newBlock.settings?.backgroundImage ||
//           `${API_URL}/uploads/1756115657883.png`,
//         textAlign: newBlock.settings?.textAlign || "left",
//         ...newBlock.settings,
//       },
//     }));
//   }, [dispatch]);

//   const handleRemoveBlock = useCallback(
//     (id) => {
//       dispatch(removeBlock(id));
//       if (activeBlock?.id === id) {
//         setActiveBlock(null);
//       }
//     },
//     [dispatch, activeBlock]
//   );

//   const handleMoveBlock = useCallback(
//     (index, direction) => {
//       const newIndex = index + direction;
//       if (newIndex < 0 || newIndex >= blocks.length) return;

//       dispatch(moveBlock({ index, direction }));
//     },
//     [dispatch, blocks.length]
//   );

//   const handleBlockSettingsChange = useCallback((blockId, newSettings) => {
//     dispatch(updateBlockSettings({ blockId, newSettings }));
//   }, [dispatch]);

//   const getActiveBlockSettings = useCallback(() => {
//     if (!activeBlock) return null;
//     // Find block using either blockId or id
//     const block = blocks.find((b) => (b.blockId || b.id) === activeBlock.id);
//     return block ? block.settings : null;
//   }, [activeBlock, blocks]);

//   const toggleSidebar = useCallback(() => {
//     setSidebarVisible((prev) => !prev);
//   }, []);

//   const handleEditBlock = useCallback((block) => {
//     // Use consistent block ID
//     const blockId = block.blockId || block.id;
//     setActiveBlock({ id: blockId, type: block.type });
//   }, []);

//   const handleNewProposal = useCallback(() => {
//     try { localStorage.removeItem("parentId"); } catch {}
//     dispatch(createNewParent());
//     setActiveBlock(null);
//     setIsPreviewMode(false);
//     setSidebarVisible(true);
//     setIsEditing(false); // Reset edit mode when creating new proposal
//   }, [dispatch]);

//   const handleTogglePreview = useCallback((isPreview) => {
//     setIsPreviewMode(isPreview);
//     if (isPreview) {
//       setSidebarVisible(false);
//       setActiveBlock(null);
//     } else {
//       setSidebarVisible(true);
//     }
//   }, []);

//   // Update header title based on mode
//   const getHeaderTitle = () => {
//     if (isEditing && editProject) {
//       return `Editing: ${editProject.proposalName}`;
//     }
//     return "Template Builder";
//   };

//   return (
//     <div className="d-flex flex-column vh-100">
//       {/* Header */}
//       <div className="flex-shrink-0" style={{ zIndex: 1020 }}>
//         <HeaderBar
//           toggleSidebar={toggleSidebar}
//           hasElementsOnCanvas={blocks.length > 0}
//           canvasRef={canvasRef}
//           onAddBlock={handleAddBlock}
//           hasSignatureBlock={hasSignatureBlock}
//           blocks={blocks}
//           defaultSettings={getActiveBlockSettings()}
//           onNewProposal={handleNewProposal}
//           isPreviewMode={isPreviewMode}
//           onTogglePreview={handleTogglePreview}
//           isEditing={isEditing} // Pass edit mode to header
//           editProject={editProject} // Pass edit project data to header
//         />
//       </div>

//       {/* Edit Mode Indicator */}
//       {isEditing && (
//         <div className="bg-warning text-dark py-2 px-3 text-center small">
//           <strong>Edit Mode:</strong> You are editing "{editProject?.proposalName}". 
//           Changes will update the existing project.
//         </div>
//       )}

//       {/* Sidebar + Canvas */}
//       <div className="d-flex flex-grow-1 overflow-hidden">
//         {/* Sidebar */}
//         {sidebarVisible && (
//           <div
//             className="h-100 bg-[#E8EAED] border-end shadow-sm thin-scrollbar"
//             style={{
//               width: "270px",
//               maxWidth: "270px",
//               transition: "width 0.3s ease",
//               overflow: "hidden",
//             }}
//           >
//             <Sidebar />
//           </div>
//         )}

//         {/* Canvas */}
//         <div className="flex-grow-1 overflow-auto p-0 bg-[#E8EAED] thin-scrollbar">
//           <Canvas
//             ref={canvasRef}
//             onAddBlock={handleAddBlock}
//             onRemoveBlock={handleRemoveBlock}
//             onMoveBlock={handleMoveBlock}
//             onEditBlock={handleEditBlock}
//             onSettingsChange={handleBlockSettingsChange}
//             isPreviewMode={isPreviewMode}
//             externalParentId={externalParentId} // Pass externalParentId for editing
//           />
//         </div>

//         {/* Settings Panel */}
//         {activeBlock && !isPreviewMode && (
//           <BlockSettingsPanel
//             activeBlock={activeBlock}
//             onClose={() => setActiveBlock(null)}
//             block={blocks.find((b) => (b.blockId || b.id) === activeBlock.id)} // Pass full block data
//             onSettingsChange={handleBlockSettingsChange}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default TemplateBuilder;

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
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
  resetForEdit,
  resetForNewProject,
} from "../../store/canvasSlice";

const API_URL = import.meta.env.VITE_API_URL;

const TemplateBuilder = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const blocks = useSelector(selectBlocks);
  const hasSignatureBlock = useSelector(selectHasSignatureBlock);
  const parentId = useSelector(selectParentId);

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeBlock, setActiveBlock] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [forceNewProject, setForceNewProject] = useState(false);
  const canvasRef = useRef(null);

  // Get edit project data from navigation state
  const { editProject, projectId, parentId: externalParentId, newProject } = location.state || {};

  // Check URL for new project flag
  const isNewProjectFromURL = searchParams.get('new') === 'true';


  // Log editProject details
  useEffect(() => {
    console.group("=== EDIT PROJECT DETAILS ===");

    if (editProject) {
      console.log("📋 Full editProject object:", editProject);
      console.log("📁 Type of editProject:", typeof editProject);

      if (editProject && typeof editProject === 'object') {
        console.log("🔑 Available properties:");
        Object.keys(editProject).forEach(key => {
          const value = editProject[key];
          console.log(`  - ${key}:`, value, `(Type: ${typeof value})`);

          // Log nested objects if they exist
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            console.log(`    Nested properties for ${key}:`);
            Object.keys(value).forEach(nestedKey => {
              console.log(`      - ${nestedKey}:`, value[nestedKey]);
            });
          }
        });

        // Specific important properties
        console.log("🎯 Key properties to check:");
        console.log("  - editProject.id:", editProject.id);
        console.log("  - editProject.proposalName:", editProject.proposalName);
        console.log("  - editProject.parentId:", editProject.parentId);
        console.log("  - editProject.userId:", editProject.userId);
        console.log("  - editProject.createdAt:", editProject.createdAt);
        console.log("  - editProject.updatedAt:", editProject.updatedAt);

        // Check for blocks/attachments
        if (editProject.blocks) {
          console.log("  - editProject.blocks (count):",
            Array.isArray(editProject.blocks) ? editProject.blocks.length : 'Not an array');
        }

        if (editProject.attachments) {
          console.log("  - editProject.attachments (count):",
            Array.isArray(editProject.attachments) ? editProject.attachments.length : 'Not an array');
        }
      }
    } else {
      console.log("❌ No editProject found in location.state");
      console.log("📍 location.state:", location.state);
    }

    console.groupEnd();
  }, [editProject, location.state]);

  // Log all navigation state details
  useEffect(() => {
    console.group("=== NAVIGATION STATE DETAILS ===");
    console.log("📌 Full location.state:", location.state);
    console.log("📍 location.pathname:", location.pathname);
    console.log("🔍 URL Search Params:", Object.fromEntries(searchParams.entries()));
    console.log("📦 State properties received:");
    console.log("  - editProject:", !!editProject);
    console.log("  - projectId:", projectId);
    console.log("  - externalParentId:", externalParentId);
    console.log("  - newProject:", newProject);
    console.groupEnd();
  }, [location, searchParams]);

  // Handle edit/new mode initialization
  useEffect(() => {
    console.log("TemplateBuilder initialization:", {
      externalParentId,
      editProject,
      newProject,
      isNewProjectFromURL
    });

    if (externalParentId && editProject) {
      console.log("Editing existing project:", editProject);
      setIsEditing(true);
      setForceNewProject(false);
      // Reset canvas state for editing
      dispatch(resetForEdit(externalParentId));
    } else if (newProject || isNewProjectFromURL) {
      console.log("Creating new project - forcing reset");
      setIsEditing(false);

      // Clear localStorage
      try {
        localStorage.removeItem("parentId");
        localStorage.removeItem("headerId");
        localStorage.removeItem("proposalId");
      } catch { }

      // Reset Redux state
      dispatch(resetForNewProject());

      // Set flag to force new project in Canvas
      setForceNewProject(true);
    } else {
      console.log("Loading existing project from state");
      setIsEditing(false);
      setForceNewProject(false);
    }
  }, [externalParentId, editProject, newProject, isNewProjectFromURL, dispatch]);

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
    const block = blocks.find((b) => (b.blockId || b.id) === activeBlock.id);
    return block ? block.settings : null;
  }, [activeBlock, blocks]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  const handleEditBlock = useCallback((block) => {
    const blockId = block.blockId || block.id;
    setActiveBlock({ id: blockId, type: block.type });
  }, []);

  const handleNewProposal = useCallback(() => {
    try {
      localStorage.removeItem("parentId");
      localStorage.removeItem("headerId");
    } catch { }
    dispatch(resetForNewProject());
    setActiveBlock(null);
    setIsPreviewMode(false);
    setSidebarVisible(true);
    setIsEditing(false);
    setForceNewProject(true);
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
          isEditing={isEditing}
          editProject={editProject}
          // Pass these new props:
          parentId={parentId}
          projectId={projectId || editProject?.id} // Use editProject.id if projectId is not available
        />
      </div>

      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="bg-warning text-dark py-2 px-3 text-center small">
          <strong>Edit Mode:</strong> You are editing "{editProject?.proposalName}".
          Changes will update the existing project.
        </div>
      )}

      {/* New Project Indicator */}
      {forceNewProject && !isEditing && (
        <div className="bg-info text-white py-2 px-3 text-center small">
          <strong>New Project:</strong> Creating a fresh project. Add blocks to get started.
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
            externalParentId={externalParentId}
            forceNewProject={forceNewProject}
          />
        </div>

        {/* Settings Panel */}
        {activeBlock && !isPreviewMode && (
          <BlockSettingsPanel
            activeBlock={activeBlock}
            onClose={() => setActiveBlock(null)}
            block={blocks.find((b) => (b.blockId || b.id) === activeBlock.id)}
            onSettingsChange={handleBlockSettingsChange}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateBuilder;



