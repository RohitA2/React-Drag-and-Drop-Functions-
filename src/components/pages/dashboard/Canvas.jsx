import { useEffect, useRef, useState, forwardRef, useCallback } from "react";
import { X, Hand, ChevronUp, ChevronDown } from "lucide-react";
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
      externalParentId = null, // Add this prop for editing existing projects
    },
    ref
  ) => {
    const dispatch = useDispatch();
    const user_id = useSelector(selectedUserId);
    const parentId = useSelector(selectParentId);
    const isParentReady = useSelector(selectIsParentReady);
    const isLoaded = useSelector(selectIsLoaded);
    const blocks = useSelector(selectBlocks);
    const blockData = useSelector(state => state.canvas?.blockData || {});
    const parentIdRef = useRef(null);
    const [isCreatingParent, setIsCreatingParent] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("initializing"); // Track loading state

    // Debug logging
    console.log("=== CANVAS DEBUG INFO ===");
    console.log("Canvas - blockData:", blockData);
    console.log("Canvas - blocks:", blocks);
    console.log("Canvas - externalParentId:", externalParentId);
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
          body: JSON.stringify({ user_id }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        if (data && data.id) {
          // ✅ Update Redux state and localStorage
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

    // Initialize parent on mount - UPDATED to handle externalParentId
    useEffect(() => {
      const initializeParent = async () => {
        setLoadingStatus("initializing");

        // Priority 1: Use externalParentId if provided (for editing existing projects)
        if (externalParentId) {
          console.log("Using externalParentId:", externalParentId);
          const exists = await verifyParentExists(externalParentId);
          if (exists) {
            parentIdRef.current = externalParentId;
            dispatch(setParentId(externalParentId));
            dispatch(setParentReady(true));
            // Always load blocks for the external parent in edit mode
            await loadBlocksForParent(externalParentId);
            return;
          } else {
            console.warn("External parent ID does not exist:", externalParentId);
          }
        }

        // Priority 2: Check if we already have a valid parent ID from Redux
        if (parentId) {
          console.log("Using existing parentId from Redux:", parentId);
          const exists = await verifyParentExists(parentId);
          if (exists) {
            parentIdRef.current = parentId;
            dispatch(setParentReady(true));
            // Load blocks if not already loaded
            if (!isLoaded) {
              await loadBlocksForParent(parentId);
            } else {
              setLoadingStatus("ready");
            }
            return;
          } else {
            // Invalid parent ID, clear it
            console.warn("Parent ID from Redux is invalid, clearing:", parentId);
            dispatch(setParentId(null));
            localStorage.removeItem("parentId");
          }
        }

        // Priority 3: Check localStorage as fallback
        const storedId = localStorage.getItem("parentId");
        if (storedId && storedId !== parentId) {
          console.log("Using stored parentId from localStorage:", storedId);
          const exists = await verifyParentExists(storedId);
          if (exists) {
            parentIdRef.current = storedId;
            dispatch(setParentId(storedId));
            dispatch(setParentReady(true));
            // Load blocks if not already loaded
            if (!isLoaded) {
              await loadBlocksForParent(storedId);
            } else {
              setLoadingStatus("ready");
            }
            return;
          } else {
            console.warn("Stored parent ID is invalid, clearing:", storedId);
            localStorage.removeItem("parentId");
          }
        }

        // Priority 4: ✅ always create a fresh one if none or invalid
        console.log("Creating new parent...");
        const newParentId = await createParent();
        if (newParentId && !isLoaded) {
          await loadBlocksForParent(newParentId);
        } else {
          setLoadingStatus("ready");
        }
      };

      initializeParent();
    }, [verifyParentExists, createParent, parentId, dispatch, isLoaded, externalParentId, loadBlocksForParent]);

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

    // Fetch block data when blocks are loaded
    useEffect(() => {
      if (blocks.length > 0) {
        console.log("Blocks loaded, fetching block data for", blocks.length, "blocks");
        blocks.forEach(block => {
          const blockId = block.blockId || block.id;
          if (blockId && !blockData[blockId]) {
            console.log("Fetching data for block:", blockId, block.type);
            dispatch(fetchBlockData({ blockId, blockType: block.type, parentId: parentIdRef.current }));
          }
        });
      }
    }, [blocks, dispatch, blockData]);

    // Function to create a new parent for each new proposal
    const createNewProposal = useCallback(async () => {
      dispatch(createNewParent());
      await createParent();
    }, [dispatch, createParent]);

    // Function to persist block data to server
    const persistBlockToServer = useCallback(async (block, parentId) => {
      try {
        const blockData = {
          id: block.id,
          type: block.type,
          data: block.data || {},
          settings: block.settings || {},
        };

        // Send to appropriate endpoint based on block type
        let endpoint = "";
        switch (block.type) {
          case "header-1":
          case "header-2":
          case "header-3":
          case "header-4":
          case "header-5":
            endpoint = `${API_URL}/api/headerBlock`;
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
            ...blockData,
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

    // Persist block order and data on render/change
    useEffect(() => {
      if (!Array.isArray(blocks) || blocks.length === 0) return;
      if (!parentIdRef.current) return; // 👈 wait until parent is set

      const persistBlockData = async () => {
        const existingParentId = await ensureParentExists();
        if (!existingParentId) return;

        // Persist block order
        const orderPayload = {
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
            body: JSON.stringify(orderPayload),
          });

          // Persist individual block data
          for (const block of blocks) {
            if (block.data || block.settings) {
              await persistBlockToServer(block, existingParentId);
            }
          }
        } catch (error) {
          console.error("Failed to store block data:", error);
        }
      };

      const timeout = setTimeout(persistBlockData, 500);
      return () => clearTimeout(timeout);
    }, [blocks, ensureParentExists]);

    const getDefaultSettings = (blockType) => {
      const defaults = {
        // Header blocks
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
          backgroundColor: "#401C47", // 👈 initially color
          backgroundImage: null, // 👈 explicitly null
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
          backgroundColor: null, // 👈 initially color
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
          backgroundImage: null, // 👈 explicitly null
          backgroundGradient: null,
          overlay: true,
          textColor: "#ffffff",
          textAlign: "center",
          blur: 0,
          filter: "none",
        },
        "cover-4": {
          backgroundGradient:
            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          backgroundColor: "#f8f9fa", // 👈 initially color
          backgroundImage: null, // 👈 explicitly null
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
      const blockId = block.blockId || block.id;
      const currentBlockData = (blockData && typeof blockData === 'object') ? blockData[blockId] || null : null;

      console.log("Rendering block:", block, "with data:", currentBlockData, "blockData type:", typeof blockData);
      const commonProps = {
        id: block.id,
        onRemove: handleRemoveBlock,
        onSettingsChange: (newSettings) =>
          onSettingsChange(block.id, newSettings),
        parentId: parentIdRef.current,
        settings: block.settings, // Add settings here
        data: currentBlockData, // Get block data from Redux state
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
              id={block.id}
              parentId={parentIdRef.current}
              onSettingsChange={(newSettings) =>
                onSettingsChange(block.id, newSettings)
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
            />
          );
        // Cover blocks
        case "cover":
        case "cover-1":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock
              key={block.id}
              settings={block.settings}
              parentId={parentIdRef.current}
              blockId={block.id}
            />
          );

        case "cover-2":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock2
              key={block.id}
              settings={block.settings}
              parentId={parentIdRef.current}
              blockId={block.id}
            />
          );

        case "cover-3":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock3
              key={block.id}
              settings={block.settings}
              parentId={parentIdRef.current}
              blockId={block.id}
            />
          );

        case "cover-4":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock4
              key={block.id}
              settings={block.settings}
              parentId={parentIdRef.current}
              blockId={block.id}
            />
          );

        case "cover-5":
          return isPreviewMode && currentBlockData ? (
            <CoverPreview cover={currentBlockData} />
          ) : (
            <CoverBlock5
              key={block.id}
              settings={block.settings}
              parentId={parentIdRef.current}
              blockId={block.id}
            />
          );

        // Other blocks
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
              blockId={block.id}
              parentId={parentIdRef.current}
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
              blockId={block.blockId || block.id}
              parentId={parentIdRef.current}
              recipient={null}
            />
          ) : (
            <SignatureBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "video":
          return isPreviewMode && currentBlockData ? (
            <VideoView videoUrl={currentBlockData?.video} />
          ) : (
            <VideoBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "pdf":
          return isPreviewMode && currentBlockData ? (
            <PdfView fileUrl={`${API_URL}${currentBlockData?.pdf || currentBlockData?.fileUrl || ""}`} />
          ) : (
            <PDFBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
              initialPdfUrl={currentBlockData?.pdf || currentBlockData?.fileUrl}
            />
          );
        case "link":
          return isPreviewMode && currentBlockData ? (
            <AttachmentView attachments={Array.isArray(currentBlockData) ? currentBlockData : [currentBlockData]} />
          ) : (
            <AttachmentBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
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
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "price":
          return isPreviewMode && currentBlockData ? (
            <PriceView price={currentBlockData} />
          ) : (
            <PricingAndServices
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "price-2":
          return isPreviewMode && currentBlockData ? (
            <PriceView price={currentBlockData} />
          ) : (
            <PricingAndServices2
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "price-3":
          return isPreviewMode && currentBlockData ? (
            <PriceView price={currentBlockData} />
          ) : (
            <PricingAndServices3
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
            />
          );
        case "terms":
          return isPreviewMode && currentBlockData ? (
            <TermsView terms={currentBlockData} />
          ) : (
            <TermsBlock
              {...commonProps}
              blockId={block.id}
              parentId={parentIdRef.current}
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
              // Handle single object payloads { date, time, ... }
              if (!Array.isArray(raw) && !Array.isArray(raw?.schedules) && (raw?.date || raw?.time || raw?.datetime)) {
                list = [raw];
              }
              const schedules = list.map(it => ({
                date: it.date || it.scheduleDate || (it.datetime ? new Date(it.datetime).toISOString().slice(0, 10) : undefined),
                time: it.time || it.scheduleTime || (it.datetime ? new Date(it.datetime).toISOString().slice(11, 16) : undefined),
                comment: it.comment || it.note || it.description || "",
              }));
              return <ScheduleView blockId={block.blockId || block.id} schedules={schedules} name={""} />;
            })()
          ) : (
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
                  isolation: "isolate",
                }}
              >
                <div className="position-relative hover-wrapper">
                  {/* Render the block content constrained to canvas width */}
                  <div
                    className="block-inner mx-auto"
                    style={{
                      width: "100%",
                      maxWidth: "1800px",
                    }}
                  >
                    {renderBlock(block)}
                  </div>

                  {/* Control Panel - Hidden in preview mode */}
                  {!isPreviewMode && (
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
                  )}
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