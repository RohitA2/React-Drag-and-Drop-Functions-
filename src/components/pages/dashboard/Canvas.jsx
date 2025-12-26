// import { useEffect, useRef, useState, forwardRef, useCallback } from "react";
// import { X, Hand, ChevronUp, ChevronDown } from "lucide-react";
// import { Button } from "react-bootstrap";
// import { v4 as uuidv4 } from "uuid";
// import { useSelector, useDispatch } from "react-redux";
// import { selectedUserId } from "../../../store/authSlice";
// import {
//   selectParentId,
//   selectIsParentReady,
//   selectIsLoaded,
//   selectBlocks,
//   selectBlockData,
//   setParentId,
//   setParentReady,
//   loadBlocksFromServer,
//   fetchBlockData,
//   createNewParent,
//   resetForEdit,
// } from "../../../store/canvasSlice";
// // Import all your block components
// import TextEditor from "../../Blocks/TextEditor";
// import SignatureBlock from "../../Blocks/SignatureBlock";
// import VideoBlock from "../../Blocks/VideoBlock";
// import PDFBlock from "../../Blocks/PDFBlock";
// import AttachmentBlock from "../../Blocks/AttachmentBlock";
// import CoverBlock from "../../Blocks/CoverBlocks/CoverBlock";
// import CoverBlock2 from "../../Blocks/CoverBlocks/CoverBlock2";
// import CoverBlock3 from "../../Blocks/CoverBlocks/CoverBlock3";
// import CoverBlock4 from "../../Blocks/CoverBlocks/CoverBlock4";
// import CoverBlock5 from "../../Blocks/CoverBlocks/CoverBlock5";
// import Parties from "../../Blocks/PartiesBlock";
// import PricingAndServices from "../../Blocks/PricingAndServices";
// import PricingAndServices2 from "../../Blocks/PricingAndServices2";
// import PricingAndServices3 from "../../Blocks/PricingAndServices3";
// import HeaderBlock from "../../Blocks/HeaderBlocks/HeaderBlock";
// import HeaderBlock2 from "../../Blocks/HeaderBlocks/HeaderBlock2";
// import HeaderBlock3 from "../../Blocks/HeaderBlocks/HeaderBlock3";
// import HeaderBlock4 from "../../Blocks/HeaderBlocks/HeaderBlock4";
// import HeaderBlock5 from "../../Blocks/HeaderBlocks/HeaderBlock5";
// import TermsBlock from "../../Blocks/TermsBlock";
// import Schedule from "../../Blocks/Schedule";
// // Viewer components for rendering fetched data inside canvas
// import PartiesView from "../../Views/PartiesView";
// import ScheduleView from "../../Views/ScheduleView";
// import SignatureView from "../../Views/SignatureView";
// import PdfView from "../../Views/PdfView";
// import VideoView from "../../Views/VideoView";
// import AttachmentView from "../../Views/AttachmentView";
// import TermsView from "../../Views/TermsView";
// import PriceView from "../../Views/PriceView";
// import CoverPreview from "../../Views/coverPreview";

// const API_URL = import.meta.env.VITE_API_URL;

// const Canvas = forwardRef(
//   (
//     {
//       onAddBlock,
//       onRemoveBlock,
//       onMoveBlock,
//       onEditBlock,
//       onSettingsChange,
//       isPreviewMode = false,
//       externalParentId = null, // Add this prop for editing existing projects
//     },
//     ref
//   ) => {
//     const dispatch = useDispatch();
//     const user_id = useSelector(selectedUserId);
//     const parentId = useSelector(selectParentId);
//     const isParentReady = useSelector(selectIsParentReady);
//     const isLoaded = useSelector(selectIsLoaded);
//     const blocks = useSelector(selectBlocks);
//     const blockData = useSelector(state => state.canvas?.blockData || {});
//     const parentIdRef = useRef(null);
//     const [isCreatingParent, setIsCreatingParent] = useState(false);
//     const [loadingStatus, setLoadingStatus] = useState("initializing"); // Track loading state

//     // Debug logging
//     console.log("=== CANVAS DEBUG INFO ===");
//     console.log("Canvas - blockData:", blockData);
//     console.log("Canvas - blocks:", blocks);
//     console.log("Canvas - externalParentId:", externalParentId);
//     console.log("Canvas - parentId:", parentId);
//     console.log("Canvas - isParentReady:", isParentReady);
//     console.log("Canvas - isLoaded:", isLoaded);
//     console.log("Canvas - loadingStatus:", loadingStatus);
//     console.log("=== END DEBUG INFO ===");

//     // Function to create a parent
//     const createParent = useCallback(async () => {
//       if (isCreatingParent) return parentIdRef.current;

//       setIsCreatingParent(true);
//       setLoadingStatus("creating_parent");
//       try {
//         const res = await fetch(`${API_URL}/parents/CreateParent`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ user_id }),
//         });

//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//         const data = await res.json();
//         if (data && data.id) {
//           // ✅ Update Redux state and localStorage
//           parentIdRef.current = data.id;
//           dispatch(setParentId(data.id));
//           localStorage.setItem("parentId", data.id);
//           dispatch(setParentReady(true));
//           return data.id;
//         }
//       } catch (error) {
//         console.error("Failed to create parent:", error);
//         setLoadingStatus("error");
//       } finally {
//         setIsCreatingParent(false);
//       }
//       return null;
//     }, [user_id, isCreatingParent, dispatch]);

//     // Verify if a parent exists
//     const verifyParentExists = useCallback(async (id) => {
//       try {
//         const probe = await fetch(`${API_URL}/parents/${id}/block-ids`, {
//           method: "GET",
//         });
//         return probe.ok;
//       } catch {
//         return false;
//       }
//     }, []);

//     // Load blocks for a specific parent
//     const loadBlocksForParent = useCallback(async (parentIdToLoad) => {
//       setLoadingStatus("loading_blocks");
//       try {
//         console.log("Loading blocks for parent:", parentIdToLoad);
//         await dispatch(loadBlocksFromServer(parentIdToLoad)).unwrap();
//         setLoadingStatus("blocks_loaded");
//       } catch (error) {
//         console.error("Failed to load blocks:", error);
//         setLoadingStatus("error_loading_blocks");
//       }
//     }, [dispatch]);

//     // Track previous externalParentId to detect changes
//     const prevExternalParentIdRef = useRef(null);

//     // Initialize parent on mount - UPDATED to handle externalParentId
//     useEffect(() => {
//       const initializeParent = async () => {
//         setLoadingStatus("initializing");

//         // Priority 1: Use externalParentId if provided (for editing existing projects)
//         if (externalParentId) {
//           console.log("Using externalParentId:", externalParentId);

//           // Check if externalParentId changed - reset state for new edit session
//           if (prevExternalParentIdRef.current !== externalParentId) {
//             console.log("External parent ID changed, resetting state for edit mode");
//             dispatch(resetForEdit(externalParentId));
//             prevExternalParentIdRef.current = externalParentId;
//           }

//           const exists = await verifyParentExists(externalParentId);
//           if (exists) {
//             parentIdRef.current = externalParentId;
//             // Load blocks for the external parent in edit mode
//             await loadBlocksForParent(externalParentId);
//             setLoadingStatus("ready");
//             return;
//           } else {
//             console.warn("External parent ID does not exist:", externalParentId);
//           }
//         }

//         // Priority 2: Check if we already have a valid parent ID from Redux
//         // Skip if we have externalParentId (edit mode takes priority)
//         if (parentId && !externalParentId) {
//           console.log("Using existing parentId from Redux:", parentId);
//           const exists = await verifyParentExists(parentId);
//           if (exists) {
//             parentIdRef.current = parentId;
//             dispatch(setParentReady(true));
//             // Load blocks if not already loaded
//             if (!isLoaded) {
//               await loadBlocksForParent(parentId);
//             } else {
//               setLoadingStatus("ready");
//             }
//             return;
//           } else {
//             // Invalid parent ID, clear it
//             console.warn("Parent ID from Redux is invalid, clearing:", parentId);
//             dispatch(setParentId(null));
//             localStorage.removeItem("parentId");
//           }
//         }

//         // Priority 3: Check localStorage as fallback (only when not in edit mode)
//         if (!externalParentId) {
//           const storedId = localStorage.getItem("parentId");
//           if (storedId && storedId !== parentId) {
//             console.log("Using stored parentId from localStorage:", storedId);
//             const exists = await verifyParentExists(storedId);
//             if (exists) {
//               parentIdRef.current = storedId;
//               dispatch(setParentId(storedId));
//               dispatch(setParentReady(true));
//               // Load blocks if not already loaded
//               if (!isLoaded) {
//                 await loadBlocksForParent(storedId);
//               } else {
//                 setLoadingStatus("ready");
//               }
//               return;
//             } else {
//               console.warn("Stored parent ID is invalid, clearing:", storedId);
//               localStorage.removeItem("parentId");
//             }
//           }

//           // Priority 4: ✅ always create a fresh one if none or invalid
//           console.log("Creating new parent...");
//           const newParentId = await createParent();
//           if (newParentId && !isLoaded) {
//             await loadBlocksForParent(newParentId);
//           } else {
//             setLoadingStatus("ready");
//           }
//         }
//       };

//       initializeParent();
//     }, [verifyParentExists, createParent, parentId, dispatch, isLoaded, externalParentId, loadBlocksForParent]);

//     // Ensure we have a valid parent before API calls
//     const ensureParentExists = useCallback(async () => {
//       if (parentIdRef.current) {
//         const exists = await verifyParentExists(parentIdRef.current);
//         if (exists) return parentIdRef.current;
//       }
//       if (isCreatingParent) return parentIdRef.current;

//       return await createParent();
//     }, [verifyParentExists, createParent, isCreatingParent]);

//     // Sync parentIdRef with Redux state
//     useEffect(() => {
//       if (parentId && parentId !== parentIdRef.current) {
//         parentIdRef.current = parentId;
//       }
//     }, [parentId]);

//     // Load blocks when parent is ready and not already loaded
//     useEffect(() => {
//       if (isParentReady && parentIdRef.current && !isLoaded) {
//         console.log("Parent is ready, loading blocks for:", parentIdRef.current);
//         loadBlocksForParent(parentIdRef.current);
//       }
//     }, [isParentReady, isLoaded, loadBlocksForParent]);

//     // Fetch any missing block data (fallback - most data should be loaded with loadBlocksFromServer)
//     useEffect(() => {
//       // Wait for parentId to be set before fetching block data
//       const currentParentId = parentIdRef.current || parentId;

//       if (blocks.length > 0 && currentParentId && isParentReady && isLoaded) {
//         // Check for any blocks missing data and fetch them
//         const blocksWithoutData = blocks.filter(block => {
//           const blockId = block.blockId || block.id;
//           return blockId && !blockData[blockId];
//         });

//         if (blocksWithoutData.length > 0) {
//           console.log("Fetching missing block data for", blocksWithoutData.length, "blocks");
//           blocksWithoutData.forEach(block => {
//             const blockId = block.blockId || block.id;
//             console.log("Fetching data for block:", blockId, "type:", block.type);
//             dispatch(fetchBlockData({ blockId, blockType: block.type, parentId: currentParentId }));
//           });
//         }
//       }
//     }, [blocks, dispatch, blockData, parentId, isParentReady, isLoaded]);

//     // Function to create a new parent for each new proposal
//     const createNewProposal = useCallback(async () => {
//       dispatch(createNewParent());
//       await createParent();
//     }, [dispatch, createParent]);

//     // Function to persist block data to server
//     const persistBlockToServer = useCallback(async (block, parentId, forcedId = null) => {
//       const consistentId = forcedId || block.blockId || block.id;

//       if (!consistentId) {
//         console.warn("Cannot persist block missing ID:", block);
//         return;
//       }

//       try {
//         const blockPayload = {
//           id: consistentId,
//           type: block.type,
//           data: block.data || {},
//           settings: block.settings || {},
//         };

//         // Send to appropriate endpoint based on block type
//         let endpoint = "";
//         switch (block.type) {
//           case "header-1":
//           case "header-2":
//           case "header-3":
//           case "header-4":
//           case "header-5":
//             endpoint = `${API_URL}/api/header`;
//             break;
//           case "text":
//             endpoint = `${API_URL}/api/textBlock`;
//             break;
//           case "signature":
//             endpoint = `${API_URL}/api/signatureBlock`;
//             break;
//           case "video":
//             endpoint = `${API_URL}/api/videoBlock`;
//             break;
//           case "pdf":
//             endpoint = `${API_URL}/api/pdfBlock`;
//             break;
//           case "link":
//             endpoint = `${API_URL}/api/attachmentBlock`;
//             break;
//           case "parties":
//             endpoint = `${API_URL}/parties/block`;
//             break;
//           case "price":
//           case "price-2":
//           case "price-3":
//             endpoint = `${API_URL}/api/pricingBlock`;
//             break;
//           case "terms":
//             endpoint = `${API_URL}/api/termsBlock`;
//             break;
//           case "calender":
//             endpoint = `${API_URL}/schedules/sign`;
//             break;
//           case "cover":
//           case "cover-1":
//           case "cover-2":
//           case "cover-3":
//           case "cover-4":
//           case "cover-5":
//             endpoint = `${API_URL}/cover/coverBlock`;
//             break;
//           default:
//             console.warn(`Unknown block type for persistence: ${block.type}`);
//             return;
//         }

//         const response = await fetch(endpoint, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             ...blockPayload,
//             parentId,
//           }),
//         });

//         if (!response.ok) {
//           console.error(`Failed to persist ${block.type} block:`, response.status);
//         } else {
//           // Optional: if backend returns new server ID for new blocks, update state here
//           // const resJson = await response.json();
//           // if (resJson.id && consistentId !== resJson.id) { ... dispatch update id ... }
//         }
//       } catch (error) {
//         console.error(`Error persisting ${block.type} block:`, error);
//       }
//     }, []);

//     useEffect(() => {
//       const listener = (e) => {
//         onAddBlock({
//           type: e.detail,
//           settings: {
//             ...getDefaultSettings(e.detail),
//             textAlign: "left",
//           },
//         });
//       };
//       window.addEventListener("sidebar-block-click", listener);
//       return () => window.removeEventListener("sidebar-block-click", listener);
//     }, [onAddBlock]);

//     // Persist block order and data on render/change
//     useEffect(() => {
//       if (!Array.isArray(blocks) || blocks.length === 0) return;
//       if (!parentIdRef.current) return;

//       const persistBlockData = async () => {
//         const existingParentId = await ensureParentExists();
//         if (!existingParentId) return;

//         // Helper to get consistent block ID (prefer blockId if present, fallback to id)
//         const getConsistentId = (b) => b.blockId || b.id;

//         // Persist block order - use consistent ID
//         const orderPayload = {
//           blocks: blocks.map((b, index) => ({
//             id: b.blockId,   // 👈 NEVER b.id
//             type: b.type,
//             name: b.name || null,
//             orderIndex: index,
//           }))

//         };

//         try {
//           const orderResponse = await fetch(`${API_URL}/parents/${existingParentId}/blocks/order`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(orderPayload),
//           });

//           if (!orderResponse.ok) {
//             console.error("Failed to persist block order:", await orderResponse.text());
//           }

//           // Persist individual block data
//           for (const block of blocks) {
//             if (block.data || block.settings) {
//               await persistBlockToServer(block, existingParentId, getConsistentId(block));
//             }
//           }
//         } catch (error) {
//           console.error("Failed to store block data:", error);
//         }
//       };

//       const timeout = setTimeout(persistBlockData, 500);
//       return () => clearTimeout(timeout);
//     }, [blocks, ensureParentExists]);

//     const getDefaultSettings = (blockType) => {
//       const defaults = {
//         // Header blocks
//         "header-1": {
//           layoutType: "left-panel",
//           backgroundColor: "#2d5000",
//           textColor: "#ffffff",
//           backgroundImage: `${API_URL}/uploads/1758707155754.png`,
//           title: "Sales Proposal",
//           subtitle: "Optional",
//           clientName: "Client name",
//           senderName: "Sender name",
//           logo: null,
//           textAlign: "left",
//         },
//         "header-2": {
//           layoutType: "right-panel",
//           backgroundColor: "#1a1a2e",
//           textColor: "#ffffff",
//           backgroundImage: `${API_URL}/uploads/1758707221597.png`,
//           title: "Project Proposal",
//           subtitle: "For your consideration",
//           clientName: "Client name",
//           senderName: "Sender name",
//           logo: null,
//           textAlign: "left",
//         },
//         "header-3": {
//           layoutType: "bottom-panel",
//           backgroundColor: "#16213e",
//           textColor: "#ffffff",
//           backgroundImage: `${API_URL}/uploads/1758707254399.png`,
//           title: "Business Proposal",
//           subtitle: "Confidential",
//           clientName: "Client name",
//           senderName: "Sender name",
//           logo: null,
//           textAlign: "center",
//         },
//         "header-4": {
//           layoutType: "top-panel",
//           backgroundColor: "#FCCAA4",
//           textColor: "#ffffff",
//           backgroundImage: `${API_URL}/uploads/1758707800341.png`,
//           title: "Service Proposal",
//           subtitle: "Custom solution",
//           clientName: "Client name",
//           senderName: "Sender name",
//           logo: null,
//           textAlign: "center",
//         },
//         "header-5": {
//           layoutType: "grid",
//           backgroundColor: "#B4D2E5",
//           textColor: "#ffffff",
//           backgroundImage: `${API_URL}/uploads/1758707343032.png`,
//           title: "Service Proposal",
//           subtitle: "Custom solution",
//           clientName: "Client name",
//           senderName: "Sender name",
//           logo: null,
//           textAlign: "center",
//         },
//         "cover-1": {
//           backgroundColor: "#401C47", // 👈 initially color
//           backgroundImage: null, // 👈 explicitly null
//           backgroundVideo: null,
//           backgroundGradient: null,
//           overlay: true,
//           textColor: "#ffffff",
//           textAlign: "center",
//           blur: 0,
//           filter: "none",
//         },
//         "cover-2": {
//           backgroundImage: `${API_URL}/uploads/1758093224957.avif`,
//           backgroundColor: null, // 👈 initially color
//           backgroundVideo: null,
//           backgroundGradient: null,
//           overlay: true,
//           textColor: "#ffffff",
//           textAlign: "center",
//           blur: 0,
//           filter: "none",
//         },
//         "cover-3": {
//           backgroundVideo: `${API_URL}/uploads/1758093032123.mp4`,
//           backgroundColor: null,
//           backgroundImage: null, // 👈 explicitly null
//           backgroundGradient: null,
//           overlay: true,
//           textColor: "#ffffff",
//           textAlign: "center",
//           blur: 0,
//           filter: "none",
//         },
//         "cover-4": {
//           backgroundGradient:
//             "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
//           backgroundColor: "#f8f9fa", // 👈 initially color
//           backgroundImage: null, // 👈 explicitly null
//           backgroundVideo: null,
//           overlay: true,
//           textColor: "#ffffff",
//           textAlign: "center",
//           blur: 0,
//           filter: "none",
//         },
//         "cover-5": {
//           backgroundImage: null,
//           backgroundColor: "#153510",
//           backgroundVideo: null,
//           backgroundGradient: null,
//           overlay: true,
//           textColor: "#ffffff",
//           textAlign: "center",
//           blur: 0,
//           filter: "none",
//         },
//         // Other blocks
//         text: {
//           content: "Enter your text here...",
//           fontSize: "16px",
//           textColor: "#333333",
//         },
//       };

//       return defaults[blockType] || {};
//     };

//     const handleDrop = (e) => {
//       e.preventDefault();
//       const blockType = e.dataTransfer.getData("blockType");
//       if (blockType) {
//         onAddBlock({
//           type: blockType,
//           settings: {
//             ...getDefaultSettings(blockType),
//             textAlign: "left",
//           },
//         });
//       }
//     };

//     const handleDragOver = (e) => e.preventDefault();

//     const handleRemoveBlock = useCallback(
//       async (id) => {
//         // Before removing, check if this is a header block and clean up localStorage
//         // Find block using either blockId or id
//         const blockToRemove = blocks.find((block) =>
//           (block.blockId || block.id) === id || block.id === id || block.blockId === id
//         );

//         if (blockToRemove && blockToRemove.type.startsWith("header")) {
//           // Remove any stored header ID for this block
//           localStorage.removeItem("headerId");
//           console.log("Cleaned up header ID for removed block:", id);
//         }

//         try {
//           const existingParentId = await ensureParentExists();
//           if (!existingParentId) throw new Error("Missing parent id");

//           await fetch(`${API_URL}/parents/${existingParentId}/blocks/${id}`, {
//             method: "DELETE",
//           });
//         } catch (error) {
//           console.error("Failed to delete block from server:", error);
//         } finally {
//           onRemoveBlock(id);
//         }
//       },
//       [blocks, onRemoveBlock, ensureParentExists]
//     );

//     const renderBlock = (block) => {
//       // Use consistent block ID - prefer blockId (from server) over id
//       const blockId = block.blockId || block.id;
//       const currentBlockData = (blockData && typeof blockData === 'object') ? blockData[blockId] || null : null;
//       const currentParentId = parentIdRef.current || parentId;
//       // Flag to indicate if this block already exists in DB (has loaded data)
//       const isExistingBlock = !!currentBlockData;

//       console.log("Rendering block:", blockId, "type:", block.type, "hasData:", isExistingBlock, "isEditMode:", !!externalParentId);
//       const commonProps = {
//         id: blockId,
//         onRemove: handleRemoveBlock,
//         onSettingsChange: (newSettings) =>
//           onSettingsChange(blockId, newSettings),
//         parentId: currentParentId,
//         settings: block.settings, // Add settings here
//         data: currentBlockData, // Get block data from Redux state
//         isExisting: isExistingBlock, // Flag to prevent creating new records in edit mode
//         ...block.settings, // Keep this for backward compatibility
//         textAlign: block.settings?.textAlign || "left",
//       };

//       switch (block.type) {
//         // Header blocks
//         case "header":
//         case "header-1":
//           return (
//             <HeaderBlock
//               id={blockId}
//               parentId={currentParentId}
//               onSettingsChange={(newSettings) =>
//                 onSettingsChange(blockId, newSettings)
//               }
//               layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "left-panel"}
//               backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756115657883.png`}
//               backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
//               textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
//               backgroundFilter={block.settings?.backgroundFilter}
//               textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
//               initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
//               initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
//               initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
//               initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
//               initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
//               initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
//               isPreview={false}
//             />
//           );
//         case "header-2":
//           return (
//             <HeaderBlock2
//               id={blockId}
//               parentId={currentParentId}
//               onSettingsChange={(newSettings) =>
//                 onSettingsChange(blockId, newSettings)
//               }
//               layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "right-panel"}
//               backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756892631033.avif`}
//               backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
//               textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
//               backgroundFilter={block.settings?.backgroundFilter}
//               textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
//               initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
//               initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
//               initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
//               initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
//               initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
//               initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
//               isPreview={false}
//             />
//           );
//         case "header-3":
//           return (
//             <HeaderBlock3
//               id={blockId}
//               parentId={currentParentId}
//               onSettingsChange={(newSettings) =>
//                 onSettingsChange(blockId, newSettings)
//               }
//               layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "top-panel"}
//               backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756892487290.avif`}
//               backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
//               textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
//               backgroundFilter={block.settings?.backgroundFilter}
//               textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
//               initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
//               initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
//               initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
//               initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
//               initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
//               initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
//               isPreview={false}
//             />
//           );
//         case "header-4":
//           return (
//             <HeaderBlock4
//               id={blockId}
//               parentId={currentParentId}
//               onSettingsChange={(newSettings) =>
//                 onSettingsChange(blockId, newSettings)
//               }
//               layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "bottom-panel"}
//               backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756892697938.jfif`}
//               backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
//               textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
//               backgroundFilter={block.settings?.backgroundFilter}
//               textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
//               initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
//               initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
//               initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
//               initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
//               initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
//               initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
//               isPreview={false}
//             />
//           );
//         case "header-5":
//           return (
//             <HeaderBlock5
//               id={blockId}
//               parentId={currentParentId}
//               onSettingsChange={(newSettings) =>
//                 onSettingsChange(blockId, newSettings)
//               }
//               layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "grid"}
//               backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756884733919.avif`}
//               backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
//               textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
//               backgroundFilter={block.settings?.backgroundFilter}
//               textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
//               initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
//               initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
//               initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
//               initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
//               initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
//               initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
//               isPreview={false}
//             />
//           );
//         // Cover blocks
//         case "cover":
//         case "cover-1":
//           return isPreviewMode && currentBlockData ? (
//             <CoverPreview cover={currentBlockData} />
//           ) : (
//             <CoverBlock
//               key={blockId}
//               settings={block.settings}
//               parentId={currentParentId}
//               blockId={blockId}
//             />
//           );

//         case "cover-2":
//           return isPreviewMode && currentBlockData ? (
//             <CoverPreview cover={currentBlockData} />
//           ) : (
//             <CoverBlock2
//               key={blockId}
//               settings={block.settings}
//               parentId={currentParentId}
//               blockId={blockId}
//             />
//           );

//         case "cover-3":
//           return isPreviewMode && currentBlockData ? (
//             <CoverPreview cover={currentBlockData} />
//           ) : (
//             <CoverBlock3
//               key={blockId}
//               settings={block.settings}
//               parentId={currentParentId}
//               blockId={blockId}
//             />
//           );

//         case "cover-4":
//           return isPreviewMode && currentBlockData ? (
//             <CoverPreview cover={currentBlockData} />
//           ) : (
//             <CoverBlock4
//               key={blockId}
//               settings={block.settings}
//               parentId={currentParentId}
//               blockId={blockId}
//             />
//           );

//         case "cover-5":
//           return isPreviewMode && currentBlockData ? (
//             <CoverPreview cover={currentBlockData} />
//           ) : (
//             <CoverBlock5
//               key={blockId}
//               settings={block.settings}
//               parentId={currentParentId}
//               blockId={blockId}
//             />
//           );

//         // Other blocks
//         case "text":
//           return isPreviewMode && currentBlockData ? (
//             <div className="bg-white">
//               <div className="p-4">
//                 <div className="mb-2 fw-bold" dangerouslySetInnerHTML={{ __html: currentBlockData?.title || "" }} />
//                 <div dangerouslySetInnerHTML={{ __html: currentBlockData?.content || "" }} />
//               </div>
//             </div>
//           ) : (
//             <TextEditor
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//               initialTitle={currentBlockData?.title}
//               initialContent={currentBlockData?.content}
//             />
//           );
//         case "signature":
//           return isPreviewMode && currentBlockData ? (
//             <SignatureView
//               Signature={currentBlockData}
//               signatureId={currentBlockData?.blockId}
//               user={null}
//               proposalName={""}
//               blockId={blockId}
//               parentId={currentParentId}
//               recipient={null}
//             />
//           ) : (
//             <SignatureBlock
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         case "video":
//           return isPreviewMode && currentBlockData ? (
//             <VideoView videoUrl={currentBlockData?.video} />
//           ) : (
//             <VideoBlock
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         case "pdf":
//           return isPreviewMode && currentBlockData ? (
//             <PdfView fileUrl={`${API_URL}${currentBlockData?.pdf || currentBlockData?.fileUrl || ""}`} />
//           ) : (
//             <PDFBlock
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//               initialPdfUrl={currentBlockData?.pdf || currentBlockData?.fileUrl}
//             />
//           );
//         case "link":
//           return isPreviewMode && currentBlockData ? (
//             <AttachmentView attachments={Array.isArray(currentBlockData) ? currentBlockData : [currentBlockData]} />
//           ) : (
//             <AttachmentBlock
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         case "parties":
//           return isPreviewMode && currentBlockData ? (
//             (() => {
//               const raw = currentBlockData || {};
//               const normalized = {
//                 toParty: Array.isArray(raw.toParty)
//                   ? raw.toParty
//                   : Array.isArray(raw.to)
//                     ? raw.to
//                     : Array.isArray(raw.recipients)
//                       ? raw.recipients.map(r => ({
//                         companyName: r.companyName || r.company || r.organization || undefined,
//                         name: r.recipientName || r.name || undefined,
//                         email: r.recipientEmail || r.email || undefined,
//                         phone: r.phone || r.phoneNumber || undefined,
//                       }))
//                       : [],
//                 fromParty: raw.fromParty || raw.from || raw.sender || null,
//               };
//               return <PartiesView parties={normalized} />;
//             })()
//           ) : (
//             <Parties
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         case "price":
//           return isPreviewMode && currentBlockData ? (
//             <PriceView price={currentBlockData} />
//           ) : (
//             <PricingAndServices
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         case "price-2":
//           return isPreviewMode && currentBlockData ? (
//             <PriceView price={currentBlockData} />
//           ) : (
//             <PricingAndServices2
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         case "price-3":
//           return isPreviewMode && currentBlockData ? (
//             <PriceView price={currentBlockData} />
//           ) : (
//             <PricingAndServices3
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         case "terms":
//           return isPreviewMode && currentBlockData ? (
//             <TermsView terms={currentBlockData} />
//           ) : (
//             <TermsBlock
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//               initialContent={currentBlockData?.content}
//             />
//           );
//         case "calender":
//           return isPreviewMode && currentBlockData ? (
//             (() => {
//               const raw = currentBlockData;
//               let list = Array.isArray(raw)
//                 ? raw
//                 : Array.isArray(raw?.schedules)
//                   ? raw.schedules
//                   : [];
//               // Handle single object payloads { date, time, ... }
//               if (!Array.isArray(raw) && !Array.isArray(raw?.schedules) && (raw?.date || raw?.time || raw?.datetime)) {
//                 list = [raw];
//               }
//               const schedules = list.map(it => ({
//                 date: it.date || it.scheduleDate || (it.datetime ? new Date(it.datetime).toISOString().slice(0, 10) : undefined),
//                 time: it.time || it.scheduleTime || (it.datetime ? new Date(it.datetime).toISOString().slice(11, 16) : undefined),
//                 comment: it.comment || it.note || it.description || "",
//               }));
//               return <ScheduleView blockId={blockId} schedules={schedules} name={""} />;
//             })()
//           ) : (
//             <Schedule
//               {...commonProps}
//               blockId={blockId}
//               parentId={currentParentId}
//             />
//           );
//         default:
//           return null;
//       }
//     };

//     // Enhanced loading states
//     if (!isParentReady || loadingStatus === "initializing" || loadingStatus === "creating_parent" || loadingStatus === "loading_blocks") {
//       return (
//         <div className="flex-grow-1 bg-[#E8EAED] d-flex align-items-center justify-content-center">
//           <div className="text-center">
//             <div className="spinner-border text-primary mb-3" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//             <div className="text-muted">
//               {loadingStatus === "initializing" && "Initializing canvas..."}
//               {loadingStatus === "creating_parent" && "Creating new proposal..."}
//               {loadingStatus === "loading_blocks" && "Loading blocks..."}
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (loadingStatus === "error" || loadingStatus === "error_loading_blocks") {
//       return (
//         <div className="flex-grow-1 bg-[#E8EAED] d-flex align-items-center justify-content-center">
//           <div className="text-center text-danger">
//             <p>Error loading canvas. Please try refreshing the page.</p>
//             <button
//               className="btn btn-primary"
//               onClick={() => window.location.reload()}
//             >
//               Refresh Page
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div
//         ref={ref}
//         className="flex-grow-1 bg-[#E8EAED] canvas-area overflow-auto p-4"
//         style={{
//           maxWidth: "100%",
//           minHeight: "100vh",
//           padding: "2rem 1rem",
//         }}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div
//           id="floating-quill-toolbar-container"
//           style={{ position: "absolute", top: 0, left: 0, zIndex: 9999 }}
//         />

//         {blocks.length === 0 ? (
//           <div
//             className="d-flex flex-column align-items-center justify-content-center"
//             style={{
//               minHeight: "80vh",
//               color: "#888",
//               textAlign: "center",
//               fontFamily: "'Inter', -apple-system, sans-serif",
//               background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             {/* Animated background elements */}
//             <div style={{
//               position: "absolute",
//               width: "300px",
//               height: "300px",
//               background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
//               borderRadius: "50%",
//               top: "-150px",
//               right: "-150px",
//               animation: "float 20s infinite ease-in-out"
//             }} />
//             <div style={{
//               position: "absolute",
//               width: "200px",
//               height: "200px",
//               background: "linear-gradient(135deg, rgba(236, 72, 153, 0.03) 0%, rgba(239, 68, 68, 0.03) 100%)",
//               borderRadius: "50%",
//               bottom: "-100px",
//               left: "-100px",
//               animation: "float 20s infinite ease-in-out reverse"
//             }} />

//             {/* Main 3D card */}
//             <div
//               style={{
//                 perspective: "1000px",
//                 marginBottom: "3rem",
//               }}
//             >
//               <div
//                 style={{
//                   backgroundColor: "rgba(255, 255, 255, 0.95)",
//                   borderRadius: "24px",
//                   padding: "2.5rem 3rem",
//                   boxShadow: `
//             0 20px 60px rgba(0, 0, 0, 0.08),
//             0 5px 15px rgba(0, 0, 0, 0.05),
//             inset 0 1px 0 rgba(255, 255, 255, 0.8)
//           `,
//                   transformStyle: "preserve-3d",
//                   animation: "cardFloat 6s infinite ease-in-out",
//                   border: "1px solid rgba(255, 255, 255, 0.8)",
//                   position: "relative",
//                   backdropFilter: "blur(20px)",
//                 }}
//               >
//                 {/* 3D effect edge */}
//                 <div style={{
//                   position: "absolute",
//                   inset: "-1px",
//                   background: "linear-gradient(135deg, transparent 60%, rgba(59, 130, 246, 0.2) 100%)",
//                   borderRadius: "25px",
//                   zIndex: -1,
//                   transform: "translateZ(-20px)",
//                 }} />

//                 {/* Interactive elements */}
//                 <div style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "1.5rem",
//                   marginBottom: "1.5rem"
//                 }}>
//                   {/* Source panel */}
//                   <div style={{
//                     width: "80px",
//                     height: "120px",
//                     background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
//                     borderRadius: "12px",
//                     padding: "1rem",
//                     boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.05)",
//                     transformStyle: "preserve-3d",
//                     transform: "rotateY(-5deg)",
//                     position: "relative",
//                     border: "1px solid rgba(203, 213, 225, 0.5)",
//                   }}>
//                     {/* Blocks in source */}
//                     {[0, 30, 60].map((top, i) => (
//                       <div key={i} style={{
//                         position: "absolute",
//                         width: "60px",
//                         height: "12px",
//                         background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
//                         borderRadius: "6px",
//                         top: `${top}px`,
//                         left: "10px",
//                         opacity: 0.8 - i * 0.2,
//                         boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
//                       }} />
//                     ))}
//                   </div>

//                   {/* Dragging animation */}
//                   <div style={{
//                     position: "relative",
//                     width: "120px",
//                     height: "120px",
//                   }}>
//                     {/* Arrow path */}
//                     <svg
//                       width="120"
//                       height="120"
//                       style={{
//                         position: "absolute",
//                         top: 0,
//                         left: 0,
//                       }}
//                     >
//                       <path
//                         d="M10,60 C40,30 80,30 110,60"
//                         fill="none"
//                         stroke="url(#gradient)"
//                         strokeWidth="2"
//                         strokeDasharray="5,5"
//                       />
//                       <defs>
//                         <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                           <stop offset="0%" stopColor="#3b82f6" />
//                           <stop offset="100%" stopColor="#8b5cf6" />
//                         </linearGradient>
//                       </defs>
//                     </svg>

//                     {/* Dragged block */}
//                     <div style={{
//                       position: "absolute",
//                       width: "60px",
//                       height: "12px",
//                       background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
//                       borderRadius: "6px",
//                       top: "54px",
//                       left: "30px",
//                       animation: "moveBlock 3s infinite ease-in-out",
//                       boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
//                       transform: "rotate(0deg)",
//                       zIndex: 2,
//                     }}>
//                       {/* Block shine effect */}
//                       <div style={{
//                         position: "absolute",
//                         top: "0",
//                         left: "0",
//                         width: "20px",
//                         height: "100%",
//                         background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
//                         borderRadius: "6px",
//                       }} />
//                     </div>
//                   </div>

//                   {/* Destination area */}
//                   <div style={{
//                     width: "100px",
//                     height: "140px",
//                     background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
//                     borderRadius: "12px",
//                     padding: "1rem",
//                     boxShadow: "inset 0 2px 8px rgba(34, 197, 94, 0.1)",
//                     transformStyle: "preserve-3d",
//                     transform: "rotateY(5deg)",
//                     border: "1px solid rgba(134, 239, 172, 0.5)",
//                     position: "relative",
//                     overflow: "hidden",
//                   }}>
//                     {/* Drop zone highlight */}
//                     <div style={{
//                       position: "absolute",
//                       inset: "4px",
//                       border: "2px dashed rgba(34, 197, 94, 0.3)",
//                       borderRadius: "8px",
//                       animation: "pulseBorder 2s infinite",
//                     }} />

//                     {/* Preview blocks */}
//                     {[
//                       { top: 20, color: "rgba(34, 197, 94, 0.1)" },
//                       { top: 50, color: "rgba(34, 197, 94, 0.15)" },
//                       { top: 80, color: "rgba(34, 197, 94, 0.2)" },
//                     ].map((item, i) => (
//                       <div key={i} style={{
//                         position: "absolute",
//                         width: "60px",
//                         height: "12px",
//                         background: item.color,
//                         borderRadius: "6px",
//                         top: `${item.top}px`,
//                         left: "20px",
//                       }} />
//                     ))}
//                   </div>
//                 </div>

//                 {/* Action text */}
//                 <div style={{
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#64748b",
//                   letterSpacing: "0.02em",
//                   textTransform: "uppercase",
//                   marginTop: "1rem",
//                 }}>
//                   <span style={{ color: "#3b82f6" }}>Drag</span> & <span style={{ color: "#10b981" }}>Drop</span>
//                 </div>
//               </div>
//             </div>

//             {/* Main message */}
//             <div style={{ maxWidth: "300px" }}>
//               <h3 style={{
//                 fontSize: "28px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 marginBottom: "1rem",
//                 letterSpacing: "-0.02em",
//               }}>
//                 Visual Builder
//               </h3>
//               <p style={{
//                 fontSize: "15px",
//                 lineHeight: "1.6",
//                 color: "#64748b",
//                 marginBottom: "1.5rem",
//               }}>
//                 Drag blocks from the sidebar to this area
//                 <br />
//                 to create your interface visually
//               </p>

//               {/* Feature highlights */}
//               {/* <div style={{
//         display: "flex",
//         gap: "1rem",
//         justifyContent: "center",
//         flexWrap: "wrap",
//       }}>
//         {[
//           { icon: "🔄", text: "Real-time Preview" },
//           { icon: "🎨", text: "Visual Editing" },
//           { icon: "⚡", text: "Instant Results" },
//         ].map((item, i) => (
//           <div key={i} style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "0.5rem",
//             padding: "0.5rem 0.75rem",
//             background: "rgba(255, 255, 255, 0.7)",
//             borderRadius: "8px",
//             fontSize: "13px",
//             color: "#475569",
//             boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
//           }}>
//             <span>{item.icon}</span>
//             <span>{item.text}</span>
//           </div>
//         ))}
//       </div> */}
//             </div>

//             {/* Floating particles */}
//             <div style={{
//               position: "absolute",
//               width: "100%",
//               height: "100%",
//               top: 0,
//               left: 0,
//               pointerEvents: "none",
//             }}>
//               {Array.from({ length: 20 }).map((_, i) => (
//                 <div
//                   key={i}
//                   style={{
//                     position: "absolute",
//                     width: `${Math.random() * 6 + 2}px`,
//                     height: `${Math.random() * 6 + 2}px`,
//                     background: `rgba(59, 130, 246, ${Math.random() * 0.1 + 0.05})`,
//                     borderRadius: "50%",
//                     top: `${Math.random() * 100}%`,
//                     left: `${Math.random() * 100}%`,
//                     animation: `particleFloat ${Math.random() * 20 + 10}s infinite linear`,
//                     animationDelay: `${Math.random() * 5}s`,
//                   }}
//                 />
//               ))}
//             </div>

//             <style>{`
//       @keyframes moveBlock {
//         0% {
//           transform: translateX(0) rotate(0deg) scale(1);
//           opacity: 1;
//         }
//         20% {
//           transform: translateX(60px) rotate(5deg) scale(1.1);
//           opacity: 1;
//         }
//         40% {
//           transform: translateX(120px) rotate(0deg) scale(1.1);
//           opacity: 1;
//         }
//         60% {
//           transform: translateX(120px) rotate(0deg) scale(1);
//           opacity: 0;
//         }
//         100% {
//           transform: translateX(0) rotate(0deg) scale(1);
//           opacity: 0;
//         }
//       }

//       @keyframes cardFloat {
//         0%, 100% {
//           transform: translateY(0) rotateX(2deg);
//         }
//         50% {
//           transform: translateY(-10px) rotateX(-2deg);
//         }
//       }

//       @keyframes pulseBorder {
//         0%, 100% {
//           border-color: rgba(34, 197, 94, 0.3);
//         }
//         50% {
//           border-color: rgba(34, 197, 94, 0.6);
//         }
//       }

//       @keyframes float {
//         0%, 100% {
//           transform: translate(0, 0) rotate(0deg);
//         }
//         33% {
//           transform: translate(30px, 30px) rotate(120deg);
//         }
//         66% {
//           transform: translate(-20px, 40px) rotate(240deg);
//         }
//       }

//       @keyframes particleFloat {
//         0% {
//           transform: translateY(100vh) rotate(0deg);
//           opacity: 0;
//         }
//         10% {
//           opacity: 1;
//         }
//         90% {
//           opacity: 1;
//         }
//         100% {
//           transform: translateY(-100px) rotate(360deg);
//           opacity: 0;
//         }
//       }

//       /* Smooth hover effects */
//       * {
//         transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//       }
//     `}</style>
//           </div>
//         ) : (
//           <div
//             id={`block-group-${parentIdRef.current}`}
//             data-parent-id={parentIdRef.current}
//             className="w-100"
//           >
//             {blocks.map((block, index) => {
//               const blockKey = block.blockId || block.id;
//               return (
//                 <div
//                   key={blockKey}
//                   className="position-relative block-container"
//                   style={{
//                     width: "100%",
//                     marginBottom: "0",
//                     isolation: "isolate",
//                   }}
//                 >
//                   <div className="position-relative hover-wrapper">
//                     {/* Render the block content constrained to canvas width */}
//                     <div
//                       className="block-inner mx-auto"
//                       style={{
//                         width: "100%",
//                         maxWidth: "1800px",
//                       }}
//                     >
//                       {renderBlock(block)}
//                     </div>

//                     {/* Control Panel - Hidden in preview mode */}
//                     {!isPreviewMode && (
//                       <div
//                         className="control-panel position-absolute top-0 end-0 p-1 z-3 d-flex flex-column align-items-end"
//                         style={{ gap: "6px", margin: "8px" }}
//                       >
//                         <div className="d-flex align-items-start gap-2 mb-1">
//                           {/* Edit Button */}
//                           {[
//                             "header",
//                             "header-1",
//                             "header-2",
//                             "header-3",
//                             "header-4",
//                             "header-5",
//                             "cover",
//                             "cover-1",
//                             "cover-2",
//                             "cover-3",
//                             "cover-4",
//                             "cover-5",
//                           ].includes(block.type) && (
//                               <Button
//                                 variant="light"
//                                 className="rounded d-flex align-items-center justify-content-between border px-1 py-0 shadow-sm"
//                                 style={{
//                                   width: "65px",
//                                   minWidth: "65px",
//                                   height: "30px",
//                                 }}
//                                 onClick={() => onEditBlock(block)}
//                               >
//                                 <span
//                                   className="fw-semibold text-secondary"
//                                   style={{ fontSize: "12px" }}
//                                 >
//                                   Edit
//                                 </span>
//                                 <div
//                                   className="d-flex flex-wrap"
//                                   style={{ width: 12, height: 12, gap: 1 }}
//                                 >
//                                   {["red", "orange", "cyan", "blue"].map((color) => (
//                                     <span
//                                       key={color}
//                                       className="rounded-circle"
//                                       style={{
//                                         width: 4,
//                                         height: 4,
//                                         backgroundColor: color,
//                                       }}
//                                     />
//                                   ))}
//                                 </div>
//                               </Button>
//                             )}
//                           {/* Move Controls */}
//                           <div
//                             className="bg-white rounded d-flex flex-column border shadow-sm"
//                             style={{ width: "28px", padding: "0" }}
//                           >
//                             <button
//                               className="btn btn-sm btn-white border-0 p-1"
//                               style={{ minWidth: "0", padding: "2px" }}
//                               onClick={() => onMoveBlock(index, -1)}
//                               disabled={index === 0}
//                             >
//                               <ChevronUp size={14} className="text-dark" />
//                             </button>
//                             <button
//                               className="btn btn-sm btn-white border-0 p-1"
//                               style={{ minWidth: "0", padding: "2px" }}
//                               onClick={() => onMoveBlock(index, 1)}
//                               disabled={index === blocks.length - 1}
//                             >
//                               <ChevronDown size={14} className="text-dark" />
//                             </button>
//                           </div>
//                         </div>

//                         {/* Delete Button */}
//                         <button
//                           onClick={() => handleRemoveBlock(blockKey)}
//                           className=" bg-white border rounded  shadow-sm"
//                           aria-label="Remove block"
//                         >
//                           <X size={14} className="text-danger" />
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//         <style>{`
//           .hover-wrapper:hover .control-panel {
//             opacity: 1;
//             pointer-events: auto;
//           }

//           .control-panel {
//             opacity: 0;
//             pointer-events: none;
//             transition: opacity 0.2s ease;
//           }

//           .hover-wrapper:hover .control-panel {
//             opacity: 1;
//           }
//         `}</style>
//       </div>
//     );
//   }
// );

// Canvas.displayName = "Canvas";
// export default Canvas;

import { useEffect, useRef, useState, forwardRef, useCallback } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";
import {
  selectParentId,
  selectIsParentReady,
  selectIsLoaded,
  selectBlocks,
  selectBlockData,
  setParentId,
  setParentReady,
  loadBlocksFromServer,
  fetchBlockData,
  createNewParent,
  resetForEdit,
  resetForNewProject,
} from "../../../store/canvasSlice";
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
// Viewer components for rendering fetched data inside canvas
import PartiesView from "../../Views/PartiesView";
import ScheduleView from "../../Views/ScheduleView";
import SignatureView from "../../Views/SignatureView";
import PdfView from "../../Views/PdfView";
import VideoView from "../../Views/VideoView";
import AttachmentView from "../../Views/AttachmentView";
import TermsView from "../../Views/TermsView";
import PriceView from "../../Views/PriceView";
import CoverPreview from "../../Views/coverPreview";

const API_URL = import.meta.env.VITE_API_URL;

const Canvas = forwardRef(
  (
    {
      onAddBlock,
      onRemoveBlock,
      onMoveBlock,
      onEditBlock,
      onSettingsChange,
      isPreviewMode = false,
      externalParentId = null,
      forceNewProject = false,
    },
    ref
  ) => {
    const dispatch = useDispatch();
    const user_id = useSelector(selectedUserId);
    const company_id = localStorage.getItem("companyId");
    const parentId = useSelector(selectParentId);
    const isParentReady = useSelector(selectIsParentReady);
    const isLoaded = useSelector(selectIsLoaded);
    const blocks = useSelector(selectBlocks);
    const blockData = useSelector(state => state.canvas?.blockData || {});
    const parentIdRef = useRef(null);
    const [isCreatingParent, setIsCreatingParent] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("initializing");
    const [hasInitialized, setHasInitialized] = useState(false);

    // Debug logging
    console.log("=== CANVAS DEBUG INFO ===");
    console.log("Canvas - externalParentId:", externalParentId);
    console.log("Canvas - forceNewProject:", forceNewProject);
    console.log("Canvas - parentId:", parentId);
    console.log("Canvas - isParentReady:", isParentReady);
    console.log("Canvas - isLoaded:", isLoaded);
    console.log("Canvas - loadingStatus:", loadingStatus);
    console.log("=== END DEBUG INFO ===");

    // Function to create a parent
    const createParent = useCallback(async () => {
      if (isCreatingParent) return parentIdRef.current;

      setIsCreatingParent(true);
      setLoadingStatus("creating_parent");
      try {
        const res = await fetch(`${API_URL}/parents/CreateParent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, company_id }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        if (data && data.id) {
          parentIdRef.current = data.id;
          dispatch(setParentId(data.id));
          localStorage.setItem("parentId", data.id);
          dispatch(setParentReady(true));
          return data.id;
        }
      } catch (error) {
        console.error("Failed to create parent:", error);
        setLoadingStatus("error");
      } finally {
        setIsCreatingParent(false);
      }
      return null;
    }, [user_id, isCreatingParent, dispatch]);

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

    // Load blocks for a specific parent
    const loadBlocksForParent = useCallback(async (parentIdToLoad) => {
      setLoadingStatus("loading_blocks");
      try {
        console.log("Loading blocks for parent:", parentIdToLoad);
        await dispatch(loadBlocksFromServer(parentIdToLoad)).unwrap();
        setLoadingStatus("blocks_loaded");
      } catch (error) {
        console.error("Failed to load blocks:", error);
        setLoadingStatus("error_loading_blocks");
      }
    }, [dispatch]);

    // Track previous externalParentId to detect changes
    const prevExternalParentIdRef = useRef(null);

    // Initialize parent on mount
    useEffect(() => {
      const initializeParent = async () => {
        if (hasInitialized) return;

        setLoadingStatus("initializing");
        console.log("Initializing canvas...");

        // Priority 1: If forceNewProject is true, always create new
        if (forceNewProject) {
          console.log("Force new project - clearing existing data");
          // Clear all stored IDs
          localStorage.removeItem("parentId");
          localStorage.removeItem("headerId");

          // Reset Redux state
          dispatch(resetForNewProject());

          // Create new parent
          const newParentId = await createParent();
          if (newParentId && !isLoaded) {
            await loadBlocksForParent(newParentId);
          }
          setHasInitialized(true);
          return;
        }

        // Priority 2: Use externalParentId if provided (for editing existing projects)
        if (externalParentId) {
          console.log("Editing project with externalParentId:", externalParentId);

          // Check if externalParentId changed - reset state for new edit session
          if (prevExternalParentIdRef.current !== externalParentId) {
            console.log("External parent ID changed, resetting state for edit mode");
            dispatch(resetForEdit(externalParentId));
            prevExternalParentIdRef.current = externalParentId;
          }

          const exists = await verifyParentExists(externalParentId);
          if (exists) {
            parentIdRef.current = externalParentId;
            await loadBlocksForParent(externalParentId);
            setHasInitialized(true);
            return;
          } else {
            console.warn("External parent ID does not exist:", externalParentId);
          }
        }

        // Priority 3: If no externalParentId and no forceNewProject, check for existing
        // This handles the case of refreshing the page while working on a project
        if (!externalParentId && !forceNewProject) {
          console.log("Looking for existing project...");

          // Check Redux first
          if (parentId) {
            console.log("Found parentId in Redux:", parentId);
            const exists = await verifyParentExists(parentId);
            if (exists) {
              parentIdRef.current = parentId;
              dispatch(setParentReady(true));
              if (!isLoaded) {
                await loadBlocksForParent(parentId);
              }
              setHasInitialized(true);
              return;
            } else {
              console.warn("Parent ID from Redux is invalid, clearing:", parentId);
              dispatch(setParentId(null));
              localStorage.removeItem("parentId");
            }
          }

          // Check localStorage
          const storedId = localStorage.getItem("parentId");
          if (storedId && storedId !== parentId) {
            console.log("Found parentId in localStorage:", storedId);
            const exists = await verifyParentExists(storedId);
            if (exists) {
              parentIdRef.current = storedId;
              dispatch(setParentId(storedId));
              dispatch(setParentReady(true));
              if (!isLoaded) {
                await loadBlocksForParent(storedId);
              }
              setHasInitialized(true);
              return;
            } else {
              console.warn("Stored parent ID is invalid, clearing:", storedId);
              localStorage.removeItem("parentId");
            }
          }

          // Priority 4: Create new if nothing found
          console.log("No existing project found, creating new parent...");
          const newParentId = await createParent();
          if (newParentId && !isLoaded) {
            await loadBlocksForParent(newParentId);
          }
          setHasInitialized(true);
        }
      };

      initializeParent();
    }, [verifyParentExists, createParent, parentId, dispatch, isLoaded, externalParentId, loadBlocksForParent, forceNewProject, hasInitialized]);

    // Ensure we have a valid parent before API calls
    const ensureParentExists = useCallback(async () => {
      if (parentIdRef.current) {
        const exists = await verifyParentExists(parentIdRef.current);
        if (exists) return parentIdRef.current;
      }
      if (isCreatingParent) return parentIdRef.current;

      return await createParent();
    }, [verifyParentExists, createParent, isCreatingParent]);

    // Sync parentIdRef with Redux state
    useEffect(() => {
      if (parentId && parentId !== parentIdRef.current) {
        parentIdRef.current = parentId;
      }
    }, [parentId]);

    // Load blocks when parent is ready and not already loaded
    useEffect(() => {
      if (isParentReady && parentIdRef.current && !isLoaded) {
        console.log("Parent is ready, loading blocks for:", parentIdRef.current);
        loadBlocksForParent(parentIdRef.current);
      }
    }, [isParentReady, isLoaded, loadBlocksForParent]);

    // Fetch any missing block data
    useEffect(() => {
      const currentParentId = parentIdRef.current || parentId;

      if (blocks.length > 0 && currentParentId && isParentReady && isLoaded) {
        const blocksWithoutData = blocks.filter(block => {
          const blockId = block.blockId || block.id;
          return blockId && !blockData[blockId];
        });

        if (blocksWithoutData.length > 0) {
          console.log("Fetching missing block data for", blocksWithoutData.length, "blocks");
          blocksWithoutData.forEach(block => {
            const blockId = block.blockId || block.id;
            console.log("Fetching data for block:", blockId, "type:", block.type);
            dispatch(fetchBlockData({ blockId, blockType: block.type, parentId: currentParentId }));
          });
        }
      }
    }, [blocks, dispatch, blockData, parentId, isParentReady, isLoaded]);

    // Function to create a new parent for each new proposal
    const createNewProposal = useCallback(async () => {
      dispatch(createNewParent());
      await createParent();
    }, [dispatch, createParent]);

    // Function to persist block data to server
    const persistBlockToServer = useCallback(async (block, parentId, forcedId = null) => {
      const consistentId = forcedId || block.blockId || block.id;

      if (!consistentId) {
        console.warn("Cannot persist block missing ID:", block);
        return;
      }

      try {
        const blockPayload = {
          id: consistentId,
          type: block.type,
          data: block.data || {},
          settings: block.settings || {},
        };

        let endpoint = "";
        switch (block.type) {
          case "header-1":
          case "header-2":
          case "header-3":
          case "header-4":
          case "header-5":
            endpoint = `${API_URL}/api/header`;
            break;
          case "text":
            endpoint = `${API_URL}/api/textBlock`;
            break;
          case "signature":
            endpoint = `${API_URL}/api/signatureBlock`;
            break;
          case "video":
            endpoint = `${API_URL}/api/videoBlock`;
            break;
          case "pdf":
            endpoint = `${API_URL}/api/pdfBlock`;
            break;
          case "link":
            endpoint = `${API_URL}/api/attachmentBlock`;
            break;
          case "parties":
            endpoint = `${API_URL}/parties/block`;
            break;
          case "price":
          case "price-2":
          case "price-3":
            endpoint = `${API_URL}/api/pricingBlock`;
            break;
          case "terms":
            endpoint = `${API_URL}/api/termsBlock`;
            break;
          case "calender":
            endpoint = `${API_URL}/schedules/sign`;
            break;
          case "cover":
          case "cover-1":
          case "cover-2":
          case "cover-3":
          case "cover-4":
          case "cover-5":
            endpoint = `${API_URL}/cover/coverBlock`;
            break;
          default:
            console.warn(`Unknown block type for persistence: ${block.type}`);
            return;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...blockPayload,
            parentId,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to persist ${block.type} block:`, response.status);
        }
      } catch (error) {
        console.error(`Error persisting ${block.type} block:`, error);
      }
    }, []);

    // Map general block types to specific variants
    const mapBlockType = useCallback((type) => {
      const typeMap = {
        "header": "header-1",
        "cover": "cover-1",
        "price": "price",
        "calender": "calender",
        "parties": "parties",
        "text": "text",
        "signature": "signature",
        "video": "video",
        "link": "link",
        "pdf": "pdf",
        "terms": "terms",
        "tutorial": "tutorial",
      };
      return typeMap[type] || type;
    }, []);

    useEffect(() => {
      const listener = (e) => {
        const mappedType = mapBlockType(e.detail);
        onAddBlock({
          type: mappedType,
          settings: {
            ...getDefaultSettings(mappedType),
            textAlign: "left",
          },
        });
      };
      window.addEventListener("sidebar-block-click", listener);
      return () => window.removeEventListener("sidebar-block-click", listener);
    }, [onAddBlock, mapBlockType]);

    // Persist block order and data on render/change
    useEffect(() => {
      if (!Array.isArray(blocks) || blocks.length === 0) return;
      if (!parentIdRef.current) return;

      const persistBlockData = async () => {
        const existingParentId = await ensureParentExists();
        if (!existingParentId) return;

        const getConsistentId = (b) => b.blockId || b.id;

        const orderPayload = {
          blocks: blocks.map((b, index) => ({
            id: b.blockId,
            type: b.type,
            name: b.name || null,
            orderIndex: index,
          }))
        };

        try {
          const orderResponse = await fetch(`${API_URL}/parents/${existingParentId}/blocks/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
          });

          if (!orderResponse.ok) {
            console.error("Failed to persist block order:", await orderResponse.text());
          }

          for (const block of blocks) {
            if (block.data || block.settings) {
              await persistBlockToServer(block, existingParentId, getConsistentId(block));
            }
          }
        } catch (error) {
          console.error("Failed to store block data:", error);
        }
      };

      const timeout = setTimeout(persistBlockData, 500);
      return () => clearTimeout(timeout);
    }, [blocks, ensureParentExists, persistBlockToServer]);

    const getDefaultSettings = (blockType) => {
      const defaults = {
        "header-1": {
          layoutType: "left-panel",
          backgroundColor: "#2d5000",
          textColor: "#ffffff",
          backgroundImage: `${API_URL}/uploads/1758707155754.png`,
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
          backgroundImage: `${API_URL}/uploads/1758707221597.png`,
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
          backgroundImage: `${API_URL}/uploads/1758707254399.png`,
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
          backgroundImage: `${API_URL}/uploads/1758707800341.png`,
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
          backgroundImage: `${API_URL}/uploads/1758707343032.png`,
          title: "Service Proposal",
          subtitle: "Custom solution",
          clientName: "Client name",
          senderName: "Sender name",
          logo: null,
          textAlign: "center",
        },
        "cover-1": {
          backgroundColor: "#401C47",
          backgroundImage: null,
          backgroundVideo: null,
          backgroundGradient: null,
          overlay: true,
          textColor: "#ffffff",
          textAlign: "center",
          blur: 0,
          filter: "none",
        },
        "cover-2": {
          backgroundImage: `${API_URL}/uploads/1758093224957.avif`,
          backgroundColor: null,
          backgroundVideo: null,
          backgroundGradient: null,
          overlay: true,
          textColor: "#ffffff",
          textAlign: "center",
          blur: 0,
          filter: "none",
        },
        "cover-3": {
          backgroundVideo: `${API_URL}/uploads/1758093032123.mp4`,
          backgroundColor: null,
          backgroundImage: null,
          backgroundGradient: null,
          overlay: true,
          textColor: "#ffffff",
          textAlign: "center",
          blur: 0,
          filter: "none",
        },
        "cover-4": {
          backgroundGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          backgroundColor: "#f8f9fa",
          backgroundImage: null,
          backgroundVideo: null,
          overlay: true,
          textColor: "#ffffff",
          textAlign: "center",
          blur: 0,
          filter: "none",
        },
        "cover-5": {
          backgroundImage: null,
          backgroundColor: "#153510",
          backgroundVideo: null,
          backgroundGradient: null,
          overlay: true,
          textColor: "#ffffff",
          textAlign: "center",
          blur: 0,
          filter: "none",
        },
        "text": {
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
        const mappedType = mapBlockType(blockType);
        onAddBlock({
          type: mappedType,
          settings: {
            ...getDefaultSettings(mappedType),
            textAlign: "left",
          },
        });
      }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleRemoveBlock = useCallback(
      async (id) => {
        const blockToRemove = blocks.find((block) =>
          (block.blockId || block.id) === id || block.id === id || block.blockId === id
        );

        if (blockToRemove && blockToRemove.type.startsWith("header")) {
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
      const blockId = block.blockId || block.id;
      const currentBlockData = (blockData && typeof blockData === 'object') ? blockData[blockId] || null : null;
      const currentParentId = parentIdRef.current || parentId;
      const isExistingBlock = !!currentBlockData;

      console.log("Rendering block:", blockId, "type:", block.type, "hasData:", isExistingBlock);
      const commonProps = {
        id: blockId,
        onRemove: handleRemoveBlock,
        onSettingsChange: (newSettings) =>
          onSettingsChange(blockId, newSettings),
        parentId: currentParentId,
        settings: block.settings,
        data: currentBlockData,
        isExisting: isExistingBlock,
        ...block.settings,
        textAlign: block.settings?.textAlign || "left",
      };

      switch (block.type) {
        case "header":
        case "header-1":
          return (
            <HeaderBlock
              id={blockId}
              parentId={currentParentId}
              onSettingsChange={(newSettings) =>
                onSettingsChange(blockId, newSettings)
              }
              layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "left-panel"}
              backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756115657883.png`}
              backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
              textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
              initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
              initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
              initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
              initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
              initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
              initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
              isPreview={false}
            />
          );
        case "header-2":
          return (
            <HeaderBlock2
              id={blockId}
              parentId={currentParentId}
              onSettingsChange={(newSettings) =>
                onSettingsChange(blockId, newSettings)
              }
              layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "right-panel"}
              backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756892631033.avif`}
              backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
              textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
              initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
              initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
              initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
              initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
              initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
              initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
              isPreview={false}
              isExisting={isExistingBlock} // Add this prop
            />
          );
        case "header-3":
          return (
            <HeaderBlock3
              id={blockId}
              parentId={currentParentId}
              onSettingsChange={(newSettings) =>
                onSettingsChange(blockId, newSettings)
              }
              layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "top-panel"}
              backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756892487290.avif`}
              backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
              textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
              initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
              initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
              initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
              initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
              initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
              initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
              isPreview={false}
              isExisting={isExistingBlock} // Add this prop
            />
          );
        case "header-4":
          return (
            <HeaderBlock4
              id={blockId}
              parentId={currentParentId}
              onSettingsChange={(newSettings) =>
                onSettingsChange(blockId, newSettings)
              }
              layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "bottom-panel"}
              backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756892697938.jfif`}
              backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
              textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
              initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
              initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
              initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
              initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
              initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
              initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
              isPreview={false}
              isExisting={isExistingBlock} // Add this prop
            />
          );
        case "header-5":
          return (
            <HeaderBlock5
              id={blockId}
              parentId={currentParentId}
              onSettingsChange={(newSettings) =>
                onSettingsChange(blockId, newSettings)
              }
              layoutType={currentBlockData?.layoutType || block.settings?.layoutType || "grid"}
              backgroundImage={currentBlockData?.backgroundImage || block.settings?.backgroundImage || `${API_URL}/uploads/1756884733919.avif`}
              backgroundColor={currentBlockData?.backgroundColor || block.settings?.backgroundColor || "#2d5000"}
              textColor={currentBlockData?.textColor || block.settings?.textColor || "#CFCFCF"}
              backgroundFilter={block.settings?.backgroundFilter}
              textAlign={(currentBlockData?.styles?.textAlign) || block.settings?.textAlign || "left"}
              initialTitle={currentBlockData?.title || block.settings?.title || "Sales Proposal"}
              initialSubtitle={currentBlockData?.subtitle || block.settings?.subtitle || "Optional"}
              initialClientName={currentBlockData?.clientName || block.settings?.clientName || "Prepared by Client name"}
              initialSenderName={currentBlockData?.senderName || block.settings?.senderName || "By Sender name"}
              initialPrice={(currentBlockData?.styles?.price) || block.settings?.price || "INCL.VAT"}
              initialLogo={currentBlockData?.logoUrl || block.settings?.logo}
              isPreview={false}
              isExisting={isExistingBlock} // Add this prop
            />
          );
        case "cover":
        case "cover-1":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock
              key={blockId}
              settings={block.settings}
              parentId={currentParentId}
              blockId={blockId}
            />
          );
        case "cover-2":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock2
              key={blockId}
              settings={block.settings}
              parentId={currentParentId}
              blockId={blockId}
            />
          );
        case "cover-3":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock3
              key={blockId}
              settings={block.settings}
              parentId={currentParentId}
              blockId={blockId}
            />
          );
        case "cover-4":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock4
              key={blockId}
              settings={block.settings}
              parentId={currentParentId}
              blockId={blockId}
            />
          );
        case "cover-5":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock5
              key={blockId}
              settings={block.settings}
              parentId={currentParentId}
              blockId={blockId}
            />
          );
        case "text":
          return isPreviewMode && currentBlockData ? (
            <div className="bg-white">
              <div className="p-4">
                <div className="mb-2 fw-bold" dangerouslySetInnerHTML={{ __html: currentBlockData?.title || "" }} />
                <div dangerouslySetInnerHTML={{ __html: currentBlockData?.content || "" }} />
              </div>
            </div>
          ) : (
            <TextEditor
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
              initialTitle={currentBlockData?.title}
              initialContent={currentBlockData?.content}
            />
          );
        case "signature":
          return isPreviewMode && currentBlockData ? (
            <SignatureView
              Signature={currentBlockData}
              signatureId={currentBlockData?.blockId}
              user={null}
              proposalName={""}
              blockId={blockId}
              parentId={currentParentId}
              recipient={null}
            />
          ) : (
            <SignatureBlock
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        case "video":
          return isPreviewMode && currentBlockData ? (
            <VideoView videoUrl={currentBlockData?.video} />
          ) : (
            <VideoBlock
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        case "pdf":
          return isPreviewMode && currentBlockData ? (
            <PdfView fileUrl={`${API_URL}${currentBlockData?.pdf || currentBlockData?.fileUrl || ""}`} />
          ) : (
            <PDFBlock
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
              initialPdfUrl={currentBlockData?.pdf || currentBlockData?.fileUrl}
            />
          );
        case "link":
          return isPreviewMode && currentBlockData ? (
            <AttachmentView attachments={Array.isArray(currentBlockData) ? currentBlockData : [currentBlockData]} />
          ) : (
            <AttachmentBlock
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        case "parties":
          return isPreviewMode && currentBlockData ? (
            (() => {
              const raw = currentBlockData || {};
              const normalized = {
                toParty: Array.isArray(raw.toParty)
                  ? raw.toParty
                  : Array.isArray(raw.to)
                    ? raw.to
                    : Array.isArray(raw.recipients)
                      ? raw.recipients.map(r => ({
                        companyName: r.companyName || r.company || r.organization || undefined,
                        name: r.recipientName || r.name || undefined,
                        email: r.recipientEmail || r.email || undefined,
                        phone: r.phone || r.phoneNumber || undefined,
                      }))
                      : [],
                fromParty: raw.fromParty || raw.from || raw.sender || null,
              };
              return <PartiesView parties={normalized} />;
            })()
          ) : (
            <Parties
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        case "price":
          return isPreviewMode && currentBlockData ? (
            <PriceView price={currentBlockData} />
          ) : (
            <PricingAndServices
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        case "price-2":
          return isPreviewMode && currentBlockData ? (
            <PriceView price={currentBlockData} />
          ) : (
            <PricingAndServices2
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        case "price-3":
          return isPreviewMode && currentBlockData ? (
            <PriceView price={currentBlockData} />
          ) : (
            <PricingAndServices3
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        case "terms":
          return isPreviewMode && currentBlockData ? (
            <TermsView terms={currentBlockData} />
          ) : (
            <TermsBlock
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
              initialContent={currentBlockData?.content}
            />
          );
        case "calender":
          return isPreviewMode && currentBlockData ? (
            (() => {
              const raw = currentBlockData;
              let list = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.schedules)
                  ? raw.schedules
                  : [];
              if (!Array.isArray(raw) && !Array.isArray(raw?.schedules) && (raw?.date || raw?.time || raw?.datetime)) {
                list = [raw];
              }
              const schedules = list.map(it => ({
                date: it.date || it.scheduleDate || (it.datetime ? new Date(it.datetime).toISOString().slice(0, 10) : undefined),
                time: it.time || it.scheduleTime || (it.datetime ? new Date(it.datetime).toISOString().slice(11, 16) : undefined),
                comment: it.comment || it.note || it.description || "",
              }));
              return <ScheduleView blockId={blockId} schedules={schedules} name={""} />;
            })()
          ) : (
            <Schedule
              {...commonProps}
              blockId={blockId}
              parentId={currentParentId}
            />
          );
        default:
          return null;
      }
    };

    // Enhanced loading states
    if (!isParentReady || loadingStatus === "initializing" || loadingStatus === "creating_parent" || loadingStatus === "loading_blocks") {
      return (
        <div className="flex-grow-1 bg-[#E8EAED] d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted">
              {loadingStatus === "initializing" && "Initializing canvas..."}
              {loadingStatus === "creating_parent" && "Creating new proposal..."}
              {loadingStatus === "loading_blocks" && "Loading blocks..."}
            </div>
          </div>
        </div>
      );
    }

    if (loadingStatus === "error" || loadingStatus === "error_loading_blocks") {
      return (
        <div className="flex-grow-1 bg-[#E8EAED] d-flex align-items-center justify-content-center">
          <div className="text-center text-danger">
            <p>Error loading canvas. Please try refreshing the page.</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
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
              fontFamily: "'Inter', -apple-system, sans-serif",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Empty state UI - same as before */}
            <div style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
              borderRadius: "50%",
              top: "-150px",
              right: "-150px",
              animation: "float 20s infinite ease-in-out"
            }} />
            <div style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              background: "linear-gradient(135deg, rgba(236, 72, 153, 0.03) 0%, rgba(239, 68, 68, 0.03) 100%)",
              borderRadius: "50%",
              bottom: "-100px",
              left: "-100px",
              animation: "float 20s infinite ease-in-out reverse"
            }} />

            <div
              style={{
                perspective: "1000px",
                marginBottom: "3rem",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "24px",
                  padding: "2.5rem 3rem",
                  boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.08),
            0 5px 15px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8)
          `,
                  transformStyle: "preserve-3d",
                  animation: "cardFloat 6s infinite ease-in-out",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  position: "relative",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div style={{
                  position: "absolute",
                  inset: "-1px",
                  background: "linear-gradient(135deg, transparent 60%, rgba(59, 130, 246, 0.2) 100%)",
                  borderRadius: "25px",
                  zIndex: -1,
                  transform: "translateZ(-20px)",
                }} />

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{
                    width: "80px",
                    height: "120px",
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    borderRadius: "12px",
                    padding: "1rem",
                    boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.05)",
                    transformStyle: "preserve-3d",
                    transform: "rotateY(-5deg)",
                    position: "relative",
                    border: "1px solid rgba(203, 213, 225, 0.5)",
                  }}>
                    {[0, 30, 60].map((top, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        width: "60px",
                        height: "12px",
                        background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                        borderRadius: "6px",
                        top: `${top}px`,
                        left: "10px",
                        opacity: 0.8 - i * 0.2,
                        boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                      }} />
                    ))}
                  </div>

                  <div style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                  }}>
                    <svg
                      width="120"
                      height="120"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    >
                      <path
                        d="M10,60 C40,30 80,30 110,60"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div style={{
                      position: "absolute",
                      width: "60px",
                      height: "12px",
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                      borderRadius: "6px",
                      top: "54px",
                      left: "30px",
                      animation: "moveBlock 3s infinite ease-in-out",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                      transform: "rotate(0deg)",
                      zIndex: 2,
                    }}>
                      <div style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "20px",
                        height: "100%",
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
                        borderRadius: "6px",
                      }} />
                    </div>
                  </div>

                  <div style={{
                    width: "100px",
                    height: "140px",
                    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    borderRadius: "12px",
                    padding: "1rem",
                    boxShadow: "inset 0 2px 8px rgba(34, 197, 94, 0.1)",
                    transformStyle: "preserve-3d",
                    transform: "rotateY(5deg)",
                    border: "1px solid rgba(134, 239, 172, 0.5)",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute",
                      inset: "4px",
                      border: "2px dashed rgba(34, 197, 94, 0.3)",
                      borderRadius: "8px",
                      animation: "pulseBorder 2s infinite",
                    }} />

                    {[
                      { top: 20, color: "rgba(34, 197, 94, 0.1)" },
                      { top: 50, color: "rgba(34, 197, 94, 0.15)" },
                      { top: 80, color: "rgba(34, 197, 94, 0.2)" },
                    ].map((item, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        width: "60px",
                        height: "12px",
                        background: item.color,
                        borderRadius: "6px",
                        top: `${item.top}px`,
                        left: "20px",
                      }} />
                    ))}
                  </div>
                </div>

                <div style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#64748b",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  marginTop: "1rem",
                }}>
                  <span style={{ color: "#3b82f6" }}>Drag</span> & <span style={{ color: "#10b981" }}>Drop</span>
                </div>
              </div>
            </div>

            <div style={{ maxWidth: "300px" }}>
              <h3 style={{
                fontSize: "28px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}>
                Visual Builder
              </h3>
              <p style={{
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#64748b",
                marginBottom: "1.5rem",
              }}>
                Drag blocks from the sidebar to this area
                <br />
                to create your interface visually
              </p>
            </div>

            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              pointerEvents: "none",
            }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: `${Math.random() * 6 + 2}px`,
                    height: `${Math.random() * 6 + 2}px`,
                    background: `rgba(59, 130, 246, ${Math.random() * 0.1 + 0.05})`,
                    borderRadius: "50%",
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `particleFloat ${Math.random() * 20 + 10}s infinite linear`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>

            <style>{`
      @keyframes moveBlock {
        0% {
          transform: translateX(0) rotate(0deg) scale(1);
          opacity: 1;
        }
        20% {
          transform: translateX(60px) rotate(5deg) scale(1.1);
          opacity: 1;
        }
        40% {
          transform: translateX(120px) rotate(0deg) scale(1.1);
          opacity: 1;
        }
        60% {
          transform: translateX(120px) rotate(0deg) scale(1);
          opacity: 0;
        }
        100% {
          transform: translateX(0) rotate(0deg) scale(1);
          opacity: 0;
        }
      }
      
      @keyframes cardFloat {
        0%, 100% {
          transform: translateY(0) rotateX(2deg);
        }
        50% {
          transform: translateY(-10px) rotateX(-2deg);
        }
      }
      
      @keyframes pulseBorder {
        0%, 100% {
          border-color: rgba(34, 197, 94, 0.3);
        }
        50% {
          border-color: rgba(34, 197, 94, 0.6);
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translate(0, 0) rotate(0deg);
        }
        33% {
          transform: translate(30px, 30px) rotate(120deg);
        }
        66% {
          transform: translate(-20px, 40px) rotate(240deg);
        }
      }
      
      @keyframes particleFloat {
        0% {
          transform: translateY(100vh) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(-100px) rotate(360deg);
          opacity: 0;
        }
      }
      
      * {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    `}</style>
          </div>
        ) : (
          <div
            id={`block-group-${parentIdRef.current}`}
            data-parent-id={parentIdRef.current}
            className="w-100"
          >
            {blocks.map((block, index) => {
              const blockKey = block.blockId || block.id;
              return (
                <div
                  key={blockKey}
                  className="position-relative block-container"
                  style={{
                    width: "100%",
                    marginBottom: "0",
                    isolation: "isolate",
                  }}
                >
                  <div className="position-relative hover-wrapper">
                    <div
                      className="block-inner mx-auto"
                      style={{
                        width: "100%",
                        maxWidth: "1800px",
                      }}
                    >
                      {renderBlock(block)}
                    </div>

                    {!isPreviewMode && (
                      <div
                        className="control-panel position-absolute top-0 end-0 p-1 z-3 d-flex flex-column align-items-end"
                        style={{ gap: "6px", margin: "8px" }}
                      >
                        <div className="d-flex align-items-start gap-2 mb-1">
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

                        <button
                          onClick={() => handleRemoveBlock(blockKey)}
                          className=" bg-white border rounded  shadow-sm"
                          aria-label="Remove block"
                        >
                          <X size={14} className="text-danger" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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