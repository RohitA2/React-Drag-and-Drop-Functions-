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
  blockData: {}, // store block data by blockId
};

// Async thunk to fetch individual block data
export const fetchBlockData = createAsyncThunk(
  "canvas/fetchBlockData",
  async ({ blockId, blockType, parentId }, { rejectWithValue }) => {
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
          // Align with viewer which includes parentId
          endpoint = parentId
            ? `${API_URL}/text/${blockId}/${parentId}`
            : `${API_URL}/text/${blockId}`;
          break;
        case "video":
          endpoint = `${API_URL}/video/${blockId}`;
          break;
        case "pdf":
          // Match viewer casing
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
          // Align with viewer which includes parentId
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

// Async thunk to load blocks from server
export const loadBlocksFromServer = createAsyncThunk(
  "canvas/loadBlocksFromServer",
  async (parentId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/parents/${parentId}/blocks`);
      console.log("i am from response slice",res.da)
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const meta = Array.isArray(json?.blocks) ? json.blocks : [];
      const sortedMeta = [...meta].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      );

      return sortedMeta;
    } catch (error) {
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
      const newBlock = {
        ...action.payload,
        id: action.payload.id || uuidv4(),
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
    },
    removeBlock: (state, action) => {
      state.blocks = state.blocks.filter((block) => block.id !== action.payload);
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
      const block = state.blocks.find((b) => b.id === blockId);
      if (block) {
        block.settings = { ...block.settings, ...newSettings };
      }
    },
    setBlocks: (state, action) => {
      state.blocks = action.payload;
    },
    clearCanvas: (state) => {
      state.blocks = [];
      state.parentId = null;
      state.isParentReady = false;
      state.error = null;
      state.isLoaded = false;
    },
    createNewParent: (state) => {
      // Clear current state to start fresh
      state.blocks = [];
      state.parentId = null;
      state.isParentReady = false;
      state.error = null;
      state.isLoaded = false;
      state.blockData = {};
    },
    setBlockData: (state, action) => {
      const { blockId, data } = action.payload;
      state.blockData[blockId] = data;
    },
    clearBlockData: (state, action) => {
      const blockId = action.payload;
      delete state.blockData[blockId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBlocksFromServer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadBlocksFromServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blocks = action.payload;
        state.isLoaded = true;
        state.error = null;
        console.log("Blocks loaded from server:", action.payload);
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
  createNewParent,
  setBlockData,
  clearBlockData,
} = canvasSlice.actions;

// Selectors
export const selectBlocks = (state) => state.canvas.blocks;
export const selectParentId = (state) => state.canvas.parentId;
export const selectIsParentReady = (state) => state.canvas.isParentReady;
export const selectCanvasLoading = (state) => state.canvas.isLoading;
export const selectCanvasError = (state) => state.canvas.error;
export const selectIsLoaded = (state) => state.canvas.isLoaded;
export const selectBlockData = (state, blockId) => state.canvas?.blockData?.[blockId] || null;
export const selectHasSignatureBlock = (state) => 
  state.canvas.blocks.some((block) => block.type === "signature");

export default canvasSlice.reducer;
