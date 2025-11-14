// signatureSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// async thunk
export const createSignature = createAsyncThunk(
  "signatures/createSignature",
  async ({ blockId, parentId }) => {
    const res = await axios.post(`${API_URL}/signatures/create`, {
      blockId,
      parentId,
    });
    return res.data; // assume backend returns created signature object
  }
);

// Fetch signature block data by ID
export const fetchSignatureBlockData = createAsyncThunk(
  "signatures/fetchBlockData",
  async (blockId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/signatureBlock?ids=${blockId}`);
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching signature block");
    }
  }
);


const signatureSlice = createSlice({
  name: "signatures",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    blockData: {}, // store block data by blockId
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSignature.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSignature.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(createSignature.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSignatureBlockData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSignatureBlockData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.blockData[action.meta.arg] = action.payload;
        }
      })
      .addCase(fetchSignatureBlockData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectSignatureBlockData = (state, blockId) => state.signatures.blockData[blockId];
export const selectSignatureLoading = (state) => state.signatures.loading;
export const selectSignatureError = (state) => state.signatures.error;

export default signatureSlice.reducer;
