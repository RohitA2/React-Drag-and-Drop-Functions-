// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { v4 as uuidv4 } from "uuid";


// const API_URL = import.meta.env.VITE_API_URL;

// const initialState = {
//   blocks: [],
//   parentId: null,
//   isParentReady: false,
//   isLoading: false,
//   error: null,
//   isLoaded: false,
//   blockData: {}, // store block data by blockId
// };

// // Async thunk to fetch individual block data
// export const fetchBlockData = createAsyncThunk(
//   "canvas/fetchBlockData",
//   async ({ blockId, blockType, parentId }, { rejectWithValue }) => {
//     console.log("Fetching data for block _____________:", blockId, blockType, parentId);
//     try {
//       let endpoint = "";
//       let data = null;

//       switch (blockType) {
//         case "header-1":
//         case "header-2":
//         case "header-3":
//         case "header-4":
//         case "header-5":
//           endpoint = `${API_URL}/api/headerBlock?ids=${blockId}`;
//           break;
//         case "signature":
//           endpoint = `${API_URL}/signatures/sign/${blockId}`;
//           break;
//         case "text":
//           // Align with viewer which includes parentId
//           endpoint = parentId
//             ? `${API_URL}/text/${blockId}/${parentId}`
//             : `${API_URL}/text/${blockId}`;
//           break;
//         case "video":
//           endpoint = `${API_URL}/video/${blockId}`;
//           break;
//         case "pdf":
//           // Match viewer casing
//           endpoint = `${API_URL}/api/pdfblocks/${blockId}`;
//           break;
//         case "link":
//           endpoint = `${API_URL}/attachments/data/${blockId}`;
//           break;
//         case "parties":
//           endpoint = `${API_URL}/parties/block/${blockId}`;
//           break;
//         case "price":
//         case "price-2":
//         case "price-3":
//           endpoint = `${API_URL}/pricing/${blockId}`;
//           break;
//         case "terms":
//           // Align with viewer which includes parentId
//           endpoint = parentId
//             ? `${API_URL}/terms/get/${blockId}/${parentId}`
//             : `${API_URL}/terms/get/${blockId}`;
//           break;
//         case "calender":
//           endpoint = `${API_URL}/schedules/sign/${blockId}`;
//           break;
//         case "cover":
//         case "cover-1":
//         case "cover-2":
//         case "cover-3":
//         case "cover-4":
//         case "cover-5":
//           endpoint = `${API_URL}/cover/coverBlock/${blockId}`;
//           break;
//         default:
//           console.warn(`Unknown block type: ${blockType}`);
//           return { blockId, data: null };
//       }

//       if (endpoint) {
//         const response = await fetch(endpoint);
//         if (response.ok) {
//           const json = await response.json();
//           if (json.success) {
//             data = Array.isArray(json.data) ? json.data[0] : json.data;
//           }
//         }
//       }

//       return { blockId, data };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Helper function to fetch data for a single block
// const fetchSingleBlockData = async (blockId, blockType, parentId) => {
//   let endpoint = "";

//   switch (blockType) {
//     case "header-1":
//     case "header-2":
//     case "header-3":
//     case "header-4":
//     case "header-5":
//       endpoint = `${API_URL}/api/headerBlock?ids=${blockId}`;
//       break;
//     case "signature":
//       endpoint = `${API_URL}/signatures/sign/${blockId}`;
//       break;
//     case "text":
//       endpoint = parentId
//         ? `${API_URL}/text/${blockId}/${parentId}`
//         : `${API_URL}/text/${blockId}`;
//       break;
//     case "video":
//       endpoint = `${API_URL}/video/${blockId}`;
//       break;
//     case "pdf":
//       endpoint = `${API_URL}/api/pdfblocks/${blockId}`;
//       break;
//     case "link":
//       endpoint = `${API_URL}/attachments/data/${blockId}`;
//       break;
//     case "parties":
//       endpoint = `${API_URL}/parties/block/${blockId}`;
//       break;
//     case "price":
//     case "price-2":
//     case "price-3":
//       endpoint = `${API_URL}/pricing/${blockId}`;
//       break;
//     case "terms":
//       endpoint = parentId
//         ? `${API_URL}/terms/get/${blockId}/${parentId}`
//         : `${API_URL}/terms/get/${blockId}`;
//       break;
//     case "calender":
//       endpoint = `${API_URL}/schedules/sign/${blockId}`;
//       break;
//     case "cover":
//     case "cover-1":
//     case "cover-2":
//     case "cover-3":
//     case "cover-4":
//     case "cover-5":
//       endpoint = `${API_URL}/cover/coverBlock/${blockId}`;
//       break;
//     default:
//       console.warn(`Unknown block type: ${blockType}`);
//       return null;
//   }

//   if (endpoint) {
//     try {
//       const response = await fetch(endpoint);
//       if (response.ok) {
//         const json = await response.json();
//         if (json.success) {
//           return Array.isArray(json.data) ? json.data[0] : json.data;
//         }
//       }
//     } catch (error) {
//       console.error(`Error fetching data for block ${blockId}:`, error);
//     }
//   }
//   return null;
// };

// // Async thunk to load blocks from server
// export const loadBlocksFromServer = createAsyncThunk(
//   "canvas/loadBlocksFromServer",
//   async (parentId, { rejectWithValue }) => {
//     try {
//       console.log("Loading blocks for parent:", parentId);

//       // First, get the blocks metadata
//       const res = await fetch(`${API_URL}/parents/${parentId}/blocks`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();

//       const meta = Array.isArray(json?.blocks) ? json.blocks : [];
//       const sortedMeta = [...meta].sort(
//         (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
//       );

//       // Normalize block IDs: ensure each block has consistent 'id' and 'blockId'
//       const normalizedBlocks = sortedMeta.map(block => ({
//         ...block,
//         id: block.blockId,
//         blockId: block.blockId,

//       }));

//       console.log("Normalized blocks:", normalizedBlocks);

//       // Now fetch the actual data for each block in parallel
//       const blockDataPromises = normalizedBlocks.map(async (block) => {
//         const blockId = block.blockId || block.id;
//         const data = await fetchSingleBlockData(blockId, block.type, parentId);
//         return { blockId, data };
//       });

//       const blockDataResults = await Promise.all(blockDataPromises);

//       // Build the blockData object
//       const blockData = {};
//       blockDataResults.forEach(({ blockId, data }) => {
//         if (data) {
//           blockData[blockId] = data;
//         }
//       });

//       console.log("Loaded block data:", blockData);

//       return { blocks: normalizedBlocks, parentId, blockData };
//     } catch (error) {
//       console.error("Error loading blocks:", error);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const canvasSlice = createSlice({
//   name: "canvas",
//   initialState,
//   reducers: {
//     setParentId: (state, action) => {
//       state.parentId = action.payload;
//       state.isParentReady = true;
//     },
//     setParentReady: (state, action) => {
//       state.isParentReady = action.payload;
//     },
//     setLoading: (state, action) => {
//       state.isLoading = action.payload;
//     },
//     setError: (state, action) => {
//       state.error = action.payload;
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     addBlock: (state, action) => {
//       const newBlock = {
//         ...action.payload,
//         id: blockId,          // UI uses same ID
//         blockId: blockId,     // DB identity
//         settings: {
//           layoutType: action.payload.settings?.layoutType || "left-panel",
//           backgroundColor: action.payload.settings?.backgroundColor || "#2d5000",
//           textColor: action.payload.settings?.textColor || "#ffffff",
//           backgroundImage: action.payload.settings?.backgroundImage || `${API_URL}/uploads/1756115657883.png`,
//           textAlign: action.payload.settings?.textAlign || "left",
//           ...action.payload.settings,
//         },
//       };
//       state.blocks.push(newBlock);
//     },
//     removeBlock: (state, action) => {
//       state.blocks = state.blocks.filter((block) => block.id !== action.payload);
//     },

//     moveBlock: (state, action) => {
//       const { index, direction } = action.payload;
//       const newIndex = index + direction;
//       if (newIndex < 0 || newIndex >= state.blocks.length) return;

//       const updated = [...state.blocks];
//       const [moved] = updated.splice(index, 1);
//       updated.splice(newIndex, 0, moved);
//       state.blocks = updated;
//     },
//     updateBlockSettings: (state, action) => {
//       const { blockId, newSettings } = action.payload;
//       const block = state.blocks.find((b) => b.id === blockId);
//       if (block) {
//         block.settings = { ...block.settings, ...newSettings };
//       }
//     },
//     setBlocks: (state, action) => {
//       state.blocks = action.payload;
//     },
//     clearCanvas: (state) => {
//       state.blocks = [];
//       state.parentId = null;
//       state.isParentReady = false;
//       state.error = null;
//       state.isLoaded = false;
//     },
//     createNewParent: (state) => {
//       // Clear current state to start fresh
//       state.blocks = [];
//       state.parentId = null;
//       state.isParentReady = false;
//       state.error = null;
//       state.isLoaded = false;
//       state.blockData = {};
//     },
//     resetForEdit: (state, action) => {
//       // Reset state for editing an existing parent
//       const newParentId = action.payload;
//       state.blocks = [];
//       state.parentId = newParentId;
//       state.isParentReady = false;
//       state.error = null;
//       state.isLoaded = false;
//       state.blockData = {};
//     },
//     setBlockData: (state, action) => {
//       const { blockId, data } = action.payload;
//       state.blockData[blockId] = data;
//     },
//     clearBlockData: (state, action) => {
//       const blockId = action.payload;
//       delete state.blockData[blockId];
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loadBlocksFromServer.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//         // Clear old block data when loading new blocks
//         state.blockData = {};
//       })
//       .addCase(loadBlocksFromServer.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.blocks = action.payload.blocks;
//         state.parentId = action.payload.parentId;
//         state.isLoaded = true;
//         state.isParentReady = true;
//         state.error = null;
//         console.log("Blocks loaded from server:", action.payload.blocks);
//       })
//       .addCase(loadBlocksFromServer.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//         state.isLoaded = false;
//       })
//       .addCase(fetchBlockData.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchBlockData.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const { blockId, data } = action.payload;
//         if (data) {
//           state.blockData[blockId] = data;
//         }
//       })
//       .addCase(fetchBlockData.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   setParentId,
//   setParentReady,
//   setLoading,
//   setError,
//   clearError,
//   addBlock,
//   removeBlock,
//   moveBlock,
//   updateBlockSettings,
//   setBlocks,
//   clearCanvas,
//   createNewParent,
//   resetForEdit,
//   setBlockData,
//   clearBlockData,
// } = canvasSlice.actions;

// // Selectors
// export const selectBlocks = (state) => state.canvas.blocks;
// export const selectParentId = (state) => state.canvas.parentId;
// export const selectIsParentReady = (state) => state.canvas.isParentReady;
// export const selectCanvasLoading = (state) => state.canvas.isLoading;
// export const selectCanvasError = (state) => state.canvas.error;
// export const selectIsLoaded = (state) => state.canvas.isLoaded;
// export const selectBlockData = (state, blockId) => state.canvas?.blockData?.[blockId] || null;
// export const selectHasSignatureBlock = (state) =>
//   state.canvas.blocks.some((block) => block.type === "signature");

// export default canvasSlice.reducer;

// ++++++++++++++++++++++++++++++++++correct===================================

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { v4 as uuidv4 } from "uuid";

// const API_URL = import.meta.env.VITE_API_URL;

// const initialState = {
//   blocks: [],
//   parentId: null,
//   isParentReady: false,
//   isLoading: false,
//   error: null,
//   isLoaded: false,
//   blockData: {},
//   hasSignatureBlock: false,
// };

// // Async thunk to fetch individual block data
// export const fetchBlockData = createAsyncThunk(
//   "canvas/fetchBlockData",
//   async ({ blockId, blockType, parentId }, { rejectWithValue }) => {
//     console.log("Fetching data for block:", blockId, blockType, parentId);
//     try {
//       let endpoint = "";
//       let data = null;

//       switch (blockType) {
//         case "header-1":
//         case "header-2":
//         case "header-3":
//         case "header-4":
//         case "header-5":
//           endpoint = `${API_URL}/api/headerBlock?ids=${blockId}`;
//           break;
//         case "signature":
//           endpoint = `${API_URL}/signatures/sign/${blockId}`;
//           break;
//         case "text":
//           endpoint = parentId
//             ? `${API_URL}/text/${blockId}/${parentId}`
//             : `${API_URL}/text/${blockId}`;
//           break;
//         case "video":
//           endpoint = `${API_URL}/video/${blockId}`;
//           break;
//         case "pdf":
//           endpoint = `${API_URL}/api/pdfblocks/${blockId}`;
//           break;
//         case "link":
//           endpoint = `${API_URL}/attachments/data/${blockId}`;
//           break;
//         case "parties":
//           endpoint = `${API_URL}/parties/block/${blockId}`;
//           break;
//         case "price":
//         case "price-2":
//         case "price-3":
//           endpoint = `${API_URL}/pricing/${blockId}`;
//           break;
//         case "terms":
//           endpoint = parentId
//             ? `${API_URL}/terms/get/${blockId}/${parentId}`
//             : `${API_URL}/terms/get/${blockId}`;
//           break;
//         case "calender":
//           endpoint = `${API_URL}/schedules/sign/${blockId}`;
//           break;
//         case "cover":
//         case "cover-1":
//         case "cover-2":
//         case "cover-3":
//         case "cover-4":
//         case "cover-5":
//           endpoint = `${API_URL}/cover/coverBlock/${blockId}`;
//           break;
//         default:
//           console.warn(`Unknown block type: ${blockType}`);
//           return { blockId, data: null };
//       }

//       if (endpoint) {
//         const response = await fetch(endpoint);
//         if (response.ok) {
//           const json = await response.json();
//           if (json.success) {
//             data = Array.isArray(json.data) ? json.data[0] : json.data;
//           }
//         }
//       }

//       return { blockId, data };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Helper function to fetch data for a single block
// const fetchSingleBlockData = async (blockId, blockType, parentId) => {
//   let endpoint = "";

//   switch (blockType) {
//     case "header-1":
//     case "header-2":
//     case "header-3":
//     case "header-4":
//     case "header-5":
//       endpoint = `${API_URL}/api/headerBlock?ids=${blockId}`;
//       break;
//     case "signature":
//       endpoint = `${API_URL}/signatures/sign/${blockId}`;
//       break;
//     case "text":
//       endpoint = parentId
//         ? `${API_URL}/text/${blockId}/${parentId}`
//         : `${API_URL}/text/${blockId}`;
//       break;
//     case "video":
//       endpoint = `${API_URL}/video/${blockId}`;
//       break;
//     case "pdf":
//       endpoint = `${API_URL}/api/pdfblocks/${blockId}`;
//       break;
//     case "link":
//       endpoint = `${API_URL}/attachments/data/${blockId}`;
//       break;
//     case "parties":
//       endpoint = `${API_URL}/parties/block/${blockId}`;
//       break;
//     case "price":
//     case "price-2":
//     case "price-3":
//       endpoint = `${API_URL}/pricing/${blockId}`;
//       break;
//     case "terms":
//       endpoint = parentId
//         ? `${API_URL}/terms/get/${blockId}/${parentId}`
//         : `${API_URL}/terms/get/${blockId}`;
//       break;
//     case "calender":
//       endpoint = `${API_URL}/schedules/sign/${blockId}`;
//       break;
//     case "cover":
//     case "cover-1":
//     case "cover-2":
//     case "cover-3":
//     case "cover-4":
//     case "cover-5":
//       endpoint = `${API_URL}/cover/coverBlock/${blockId}`;
//       break;
//     default:
//       console.warn(`Unknown block type: ${blockType}`);
//       return null;
//   }

//   if (endpoint) {
//     try {
//       const response = await fetch(endpoint);
//       if (response.ok) {
//         const json = await response.json();
//         if (json.success) {
//           return Array.isArray(json.data) ? json.data[0] : json.data;
//         }
//       }
//     } catch (error) {
//       console.error(`Error fetching data for block ${blockId}:`, error);
//     }
//   }
//   return null;
// };

// // Async thunk to load blocks from server
// export const loadBlocksFromServer = createAsyncThunk(
//   "canvas/loadBlocksFromServer",
//   async (parentId, { rejectWithValue }) => {
//     try {
//       console.log("Loading blocks for parent:", parentId);

//       // First, get the blocks metadata
//       const res = await fetch(`${API_URL}/parents/${parentId}/blocks`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();

//       const meta = Array.isArray(json?.blocks) ? json.blocks : [];
//       const sortedMeta = [...meta].sort(
//         (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
//       );

//       // Normalize block IDs: ensure each block has consistent 'id' and 'blockId'
//       const normalizedBlocks = sortedMeta.map(block => ({
//         ...block,
//         id: block.blockId || uuidv4(),
//         blockId: block.blockId,
//       }));

//       console.log("Normalized blocks:", normalizedBlocks);

//       // Now fetch the actual data for each block in parallel
//       const blockDataPromises = normalizedBlocks.map(async (block) => {
//         const blockId = block.blockId || block.id;
//         const data = await fetchSingleBlockData(blockId, block.type, parentId);
//         return { blockId, data };
//       });

//       const blockDataResults = await Promise.all(blockDataPromises);

//       // Build the blockData object
//       const blockData = {};
//       blockDataResults.forEach(({ blockId, data }) => {
//         if (data) {
//           blockData[blockId] = data;
//         }
//       });

//       console.log("Loaded block data:", blockData);

//       return { blocks: normalizedBlocks, parentId, blockData };
//     } catch (error) {
//       console.error("Error loading blocks:", error);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const canvasSlice = createSlice({
//   name: "canvas",
//   initialState,
//   reducers: {
//     setParentId: (state, action) => {
//       state.parentId = action.payload;
//       state.isParentReady = true;
//     },
//     setParentReady: (state, action) => {
//       state.isParentReady = action.payload;
//     },
//     setLoading: (state, action) => {
//       state.isLoading = action.payload;
//     },
//     setError: (state, action) => {
//       state.error = action.payload;
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     addBlock: (state, action) => {
//       const blockId = action.payload.id || uuidv4();
//       const newBlock = {
//         ...action.payload,
//         id: blockId,
//         blockId: blockId,
//         settings: {
//           layoutType: action.payload.settings?.layoutType || "left-panel",
//           backgroundColor: action.payload.settings?.backgroundColor || "#2d5000",
//           textColor: action.payload.settings?.textColor || "#ffffff",
//           backgroundImage: action.payload.settings?.backgroundImage || `${API_URL}/uploads/1756115657883.png`,
//           textAlign: action.payload.settings?.textAlign || "left",
//           ...action.payload.settings,
//         },
//       };
//       state.blocks.push(newBlock);
//     },
//     removeBlock: (state, action) => {
//       const blockIdToRemove = action.payload;
//       state.blocks = state.blocks.filter((block) => {
//         const blockId = block.blockId || block.id;
//         return blockId !== blockIdToRemove;
//       });
      
//       // Update hasSignatureBlock flag
//       state.hasSignatureBlock = state.blocks.some((block) => block.type === "signature");
//     },

//     moveBlock: (state, action) => {
//       const { index, direction } = action.payload;
//       const newIndex = index + direction;
//       if (newIndex < 0 || newIndex >= state.blocks.length) return;

//       const updated = [...state.blocks];
//       const [moved] = updated.splice(index, 1);
//       updated.splice(newIndex, 0, moved);
//       state.blocks = updated;
//     },
//     updateBlockSettings: (state, action) => {
//       const { blockId, newSettings } = action.payload;
//       const block = state.blocks.find((b) => (b.blockId || b.id) === blockId);
//       if (block) {
//         block.settings = { ...block.settings, ...newSettings };
//       }
//     },
//     setBlocks: (state, action) => {
//       state.blocks = action.payload;
//       // Update hasSignatureBlock flag
//       state.hasSignatureBlock = action.payload.some((block) => block.type === "signature");
//     },
//     clearCanvas: (state) => {
//       state.blocks = [];
//       state.parentId = null;
//       state.isParentReady = false;
//       state.error = null;
//       state.isLoaded = false;
//       state.blockData = {};
//       state.hasSignatureBlock = false;
//     },
//     createNewParent: (state) => {
//       // Clear current state to start fresh
//       state.blocks = [];
//       state.parentId = null;
//       state.isParentReady = false;
//       state.error = null;
//       state.isLoaded = false;
//       state.blockData = {};
//       state.hasSignatureBlock = false;
//     },
//     resetForEdit: (state, action) => {
//       // Reset state for editing an existing parent
//       const newParentId = action.payload;
//       state.blocks = [];
//       state.parentId = newParentId;
//       state.isParentReady = false;
//       state.error = null;
//       state.isLoaded = false;
//       state.blockData = {};
//       state.hasSignatureBlock = false;
//     },
//     resetForNewProject: (state) => {
//       // Clear everything for a new project
//       state.blocks = [];
//       state.parentId = null;
//       state.isParentReady = false;
//       state.error = null;
//       state.isLoaded = false;
//       state.blockData = {};
//       state.hasSignatureBlock = false;
//     },
//     setBlockData: (state, action) => {
//       const { blockId, data } = action.payload;
//       state.blockData[blockId] = data;
//     },
//     clearBlockData: (state, action) => {
//       const blockId = action.payload;
//       delete state.blockData[blockId];
//     },
//     setHasSignatureBlock: (state, action) => {
//       state.hasSignatureBlock = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loadBlocksFromServer.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//         // Clear old block data when loading new blocks
//         state.blockData = {};
//       })
//       .addCase(loadBlocksFromServer.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.blocks = action.payload.blocks;
//         state.parentId = action.payload.parentId;
//         state.isLoaded = true;
//         state.isParentReady = true;
//         state.error = null;
//         state.blockData = action.payload.blockData || {};
        
//         // Update hasSignatureBlock flag
//         state.hasSignatureBlock = action.payload.blocks.some((block) => block.type === "signature");
        
//         console.log("Blocks loaded from server:", action.payload.blocks);
//       })
//       .addCase(loadBlocksFromServer.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//         state.isLoaded = false;
//       })
//       .addCase(fetchBlockData.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchBlockData.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const { blockId, data } = action.payload;
//         if (data) {
//           state.blockData[blockId] = data;
//         }
//       })
//       .addCase(fetchBlockData.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   setParentId,
//   setParentReady,
//   setLoading,
//   setError,
//   clearError,
//   addBlock,
//   removeBlock,
//   moveBlock,
//   updateBlockSettings,
//   setBlocks,
//   clearCanvas,
//   createNewParent,
//   resetForEdit,
//   resetForNewProject,
//   setBlockData,
//   clearBlockData,
//   setHasSignatureBlock,
// } = canvasSlice.actions;

// // Selectors
// export const selectBlocks = (state) => state.canvas.blocks;
// export const selectParentId = (state) => state.canvas.parentId;
// export const selectIsParentReady = (state) => state.canvas.isParentReady;
// export const selectCanvasLoading = (state) => state.canvas.isLoading;
// export const selectCanvasError = (state) => state.canvas.error;
// export const selectIsLoaded = (state) => state.canvas.isLoaded;
// export const selectBlockData = (state) => state.canvas.blockData;
// export const selectHasSignatureBlock = (state) => state.canvas.hasSignatureBlock;

// export default canvasSlice.reducer;


// +++++++++++++++++++++++++++++++++++++new ++++++++++++++++++++++++++++++++++

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  blocks: [],
  parentId: null,
  isParentReady: false,
  isLoading: false,
  error: null,
  isLoaded: false,
  blockData: {},
  hasSignatureBlock: false,
};

// Async thunk to fetch individual block data
export const fetchBlockData = createAsyncThunk(
  "canvas/fetchBlockData",
  async ({ blockId, blockType, parentId }, { rejectWithValue }) => {
    console.log("Fetching data for block:", blockId, blockType, parentId);
    try {
      let endpoint = "";
      let data = null;

      switch (blockType) {
        case "header-1":
        case "header-2":
        case "header-3":
        case "header-4":
        case "header-5":
          endpoint = `${API_URL}/api/headerBlock?ids=${blockId}`;
          break;
        case "signature":
          endpoint = `${API_URL}/signatures/sign/${blockId}`;
          break;
        case "text":
          endpoint = parentId
            ? `${API_URL}/text/${blockId}/${parentId}`
            : `${API_URL}/text/${blockId}`;
          break;
        case "video":
          endpoint = `${API_URL}/video/${blockId}`;
          break;
        case "pdf":
          endpoint = `${API_URL}/api/pdfblocks/${blockId}`;
          break;
        case "link":
          endpoint = `${API_URL}/attachments/data/${blockId}`;
          break;
        case "parties":
          endpoint = `${API_URL}/parties/block/${blockId}`;
          break;
        case "price":
        case "price-2":
        case "price-3":
          endpoint = `${API_URL}/pricing/${blockId}`;
          break;
        case "terms":
          endpoint = parentId
            ? `${API_URL}/terms/get/${blockId}/${parentId}`
            : `${API_URL}/terms/get/${blockId}`;
          break;
        case "calender":
          endpoint = `${API_URL}/schedules/sign/${blockId}`;
          break;
        case "cover":
        case "cover-1":
        case "cover-2":
        case "cover-3":
        case "cover-4":
        case "cover-5":
          endpoint = `${API_URL}/cover/coverBlock/${blockId}`;
          break;
        default:
          console.warn(`Unknown block type: ${blockType}`);
          return { blockId, data: null };
      }

      if (endpoint) {
        const response = await fetch(endpoint);
        if (response.ok) {
          const json = await response.json();
          if (json.success) {
            data = Array.isArray(json.data) ? json.data[0] : json.data;
          }
        }
      }

      return { blockId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to fetch data for a single block
const fetchSingleBlockData = async (blockId, blockType, parentId) => {
  let endpoint = "";

  switch (blockType) {
    case "header-1":
    case "header-2":
    case "header-3":
    case "header-4":
    case "header-5":
      endpoint = `${API_URL}/api/headerBlock?ids=${blockId}`;
      break;
    case "signature":
      endpoint = `${API_URL}/signatures/sign/${blockId}`;
      break;
    case "text":
      endpoint = parentId
        ? `${API_URL}/text/${blockId}/${parentId}`
        : `${API_URL}/text/${blockId}`;
      break;
    case "video":
      endpoint = `${API_URL}/video/${blockId}`;
      break;
    case "pdf":
      endpoint = `${API_URL}/api/pdfblocks/${blockId}`;
      break;
    case "link":
      endpoint = `${API_URL}/attachments/data/${blockId}`;
      break;
    case "parties":
      endpoint = `${API_URL}/parties/block/${blockId}`;
      break;
    case "price":
    case "price-2":
    case "price-3":
      endpoint = `${API_URL}/pricing/${blockId}`;
      break;
    case "terms":
      endpoint = parentId
        ? `${API_URL}/terms/get/${blockId}/${parentId}`
        : `${API_URL}/terms/get/${blockId}`;
      break;
    case "calender":
      endpoint = `${API_URL}/schedules/sign/${blockId}`;
      break;
    case "cover":
    case "cover-1":
    case "cover-2":
    case "cover-3":
    case "cover-4":
    case "cover-5":
      endpoint = `${API_URL}/cover/coverBlock/${blockId}`;
      break;
    default:
      console.warn(`Unknown block type: ${blockType}`);
      return null;
  }

  if (endpoint) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          return Array.isArray(json.data) ? json.data[0] : json.data;
        }
      }
    } catch (error) {
      console.error(`Error fetching data for block ${blockId}:`, error);
    }
  }
  return null;
};

// Async thunk to load blocks from server
export const loadBlocksFromServer = createAsyncThunk(
  "canvas/loadBlocksFromServer",
  async (parentId, { rejectWithValue }) => {
    try {
      console.log("Loading blocks for parent:", parentId);

      // First, get the blocks metadata
      const res = await fetch(`${API_URL}/parents/${parentId}/blocks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const meta = Array.isArray(json?.blocks) ? json.blocks : [];
      const sortedMeta = [...meta].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      );

      // Normalize block IDs: ensure each block has consistent 'id' and 'blockId'
      const normalizedBlocks = sortedMeta.map(block => ({
        ...block,
        id: block.blockId || uuidv4(),
        blockId: block.blockId,
      }));

      console.log("Normalized blocks:", normalizedBlocks);

      // Now fetch the actual data for each block in parallel
      const blockDataPromises = normalizedBlocks.map(async (block) => {
        const blockId = block.blockId || block.id;
        const data = await fetchSingleBlockData(blockId, block.type, parentId);
        return { blockId, data };
      });

      const blockDataResults = await Promise.all(blockDataPromises);

      // Build the blockData object
      const blockData = {};
      blockDataResults.forEach(({ blockId, data }) => {
        if (data) {
          blockData[blockId] = data;
        }
      });

      console.log("Loaded block data:", blockData);

      return { blocks: normalizedBlocks, parentId, blockData };
    } catch (error) {
      console.error("Error loading blocks:", error);
      return rejectWithValue(error.message);
    }
  }
);

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setParentId: (state, action) => {
      state.parentId = action.payload;
      state.isParentReady = true;
    },
    setParentReady: (state, action) => {
      state.isParentReady = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addBlock: (state, action) => {
      const blockId = action.payload.id || uuidv4();
      const newBlock = {
        ...action.payload,
        id: blockId,
        blockId: blockId,
        settings: {
          layoutType: action.payload.settings?.layoutType || "left-panel",
          backgroundColor: action.payload.settings?.backgroundColor || "#2d5000",
          textColor: action.payload.settings?.textColor || "#ffffff",
          backgroundImage: action.payload.settings?.backgroundImage || `${API_URL}/uploads/1756115657883.png`,
          textAlign: action.payload.settings?.textAlign || "left",
          ...action.payload.settings,
        },
      };
      state.blocks.push(newBlock);
      
      // Update hasSignatureBlock flag
      if (newBlock.type === "signature") {
        state.hasSignatureBlock = true;
      }
    },
    removeBlock: (state, action) => {
      const blockIdToRemove = action.payload;
      state.blocks = state.blocks.filter((block) => {
        const blockId = block.blockId || block.id;
        return blockId !== blockIdToRemove;
      });
      
      // Update hasSignatureBlock flag
      state.hasSignatureBlock = state.blocks.some((block) => block.type === "signature");
    },
    moveBlock: (state, action) => {
      const { index, direction } = action.payload;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= state.blocks.length) return;

      const updated = [...state.blocks];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      state.blocks = updated;
    },
    updateBlockSettings: (state, action) => {
      const { blockId, newSettings } = action.payload;
      const block = state.blocks.find((b) => (b.blockId || b.id) === blockId);
      if (block) {
        block.settings = { ...block.settings, ...newSettings };
      }
    },
    setBlocks: (state, action) => {
      state.blocks = action.payload;
      // Update hasSignatureBlock flag
      state.hasSignatureBlock = action.payload.some((block) => block.type === "signature");
    },
    clearCanvas: (state) => {
      state.blocks = [];
      state.parentId = null;
      state.isParentReady = false;
      state.error = null;
      state.isLoaded = false;
      state.blockData = {};
      state.hasSignatureBlock = false;
    },
    clearCanvasState: (state) => {
      // Clear everything completely - reset to initial state
      state.blocks = [];
      state.parentId = null;
      state.isParentReady = false;
      state.isLoading = false;
      state.error = null;
      state.isLoaded = false;
      state.blockData = {};
      state.hasSignatureBlock = false;
    },
    createNewParent: (state) => {
      // Clear current state to start fresh
      state.blocks = [];
      state.parentId = null;
      state.isParentReady = false;
      state.error = null;
      state.isLoaded = false;
      state.blockData = {};
      state.hasSignatureBlock = false;
    },
    resetForEdit: (state, action) => {
      // Reset state for editing an existing parent
      const newParentId = action.payload;
      state.blocks = [];
      state.parentId = newParentId;
      state.isParentReady = false;
      state.error = null;
      state.isLoaded = false;
      state.blockData = {};
      state.hasSignatureBlock = false;
    },
    resetForNewProject: (state) => {
      // Clear everything for a new project
      state.blocks = [];
      state.parentId = null;
      state.isParentReady = false;
      state.error = null;
      state.isLoaded = false;
      state.blockData = {};
      state.hasSignatureBlock = false;
    },
    setBlockData: (state, action) => {
      const { blockId, data } = action.payload;
      state.blockData[blockId] = data;
    },
    clearBlockData: (state, action) => {
      const blockId = action.payload;
      delete state.blockData[blockId];
    },
    setHasSignatureBlock: (state, action) => {
      state.hasSignatureBlock = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBlocksFromServer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        // Clear old block data when loading new blocks
        state.blockData = {};
      })
      .addCase(loadBlocksFromServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blocks = action.payload.blocks;
        state.parentId = action.payload.parentId;
        state.isLoaded = true;
        state.isParentReady = true;
        state.error = null;
        state.blockData = action.payload.blockData || {};
        
        // Update hasSignatureBlock flag
        state.hasSignatureBlock = action.payload.blocks.some((block) => block.type === "signature");
        
        console.log("Blocks loaded from server:", action.payload.blocks);
      })
      .addCase(loadBlocksFromServer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isLoaded = false;
      })
      .addCase(fetchBlockData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlockData.fulfilled, (state, action) => {
        state.isLoading = false;
        const { blockId, data } = action.payload;
        if (data) {
          state.blockData[blockId] = data;
        }
      })
      .addCase(fetchBlockData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setParentId,
  setParentReady,
  setLoading,
  setError,
  clearError,
  addBlock,
  removeBlock,
  moveBlock,
  updateBlockSettings,
  setBlocks,
  clearCanvas,
  clearCanvasState, // Add this export
  createNewParent,
  resetForEdit,
  resetForNewProject,
  setBlockData,
  clearBlockData,
  setHasSignatureBlock,
} = canvasSlice.actions;

// Selectors
export const selectBlocks = (state) => state.canvas.blocks;
export const selectParentId = (state) => state.canvas.parentId;
export const selectIsParentReady = (state) => state.canvas.isParentReady;
export const selectCanvasLoading = (state) => state.canvas.isLoading;
export const selectCanvasError = (state) => state.canvas.error;
export const selectIsLoaded = (state) => state.canvas.isLoaded;
export const selectBlockData = (state) => state.canvas.blockData;
export const selectHasSignatureBlock = (state) => state.canvas.hasSignatureBlock;

export default canvasSlice.reducer;
