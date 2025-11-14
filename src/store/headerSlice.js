// store/headerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch header block data by ID
export const fetchHeaderBlockData = createAsyncThunk(
  "header/fetchBlockData",
  async (blockId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/headerBlock?ids=${blockId}`);
      if (data.success && Array.isArray(data.data)) {
        return data.data[0] || null;
      }
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching header block");
    }
  }
);

const headerSlice = createSlice({
  name: "header",
  initialState: {
    ids: [],   // store one or many headerIds
    blockData: {}, // store block data by blockId
    loading: false,
    error: null,
  },
  reducers: {
    addHeaderId: (state, action) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload);
      }
    },
    removeHeaderId: (state, action) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    setHeaderIds: (state, action) => {
      state.ids = action.payload; // overwrite
    },
    clearHeaderIds: (state) => {
      state.ids = [];
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
      .addCase(fetchHeaderBlockData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeaderBlockData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.blockData[action.meta.arg] = action.payload;
        }
      })
      .addCase(fetchHeaderBlockData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addHeaderId,
  removeHeaderId,
  setHeaderIds,
  clearHeaderIds,
  setBlockData,
  clearBlockData,
} = headerSlice.actions;

// ✅ Selectors
export const selectHeaderIds = (state) => state.header.ids;
export const selectHeaderBlockData = (state, blockId) => state.header.blockData[blockId];
export const selectHeaderLoading = (state) => state.header.loading;
export const selectHeaderError = (state) => state.header.error;

export default headerSlice.reducer;
