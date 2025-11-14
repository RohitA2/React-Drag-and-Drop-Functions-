// store/pricingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Create new block
export const createPricingBlock = createAsyncThunk(
  "pricing/createBlock",
  async (blockData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.post(
        `${API_URL}/pricing/service`,
        blockData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Block created successfully");
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating block");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// 🔹 Fetch blocks by user
export const fetchBlocksByUser = createAsyncThunk(
  "pricing/fetchBlocksByUser",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${API_URL}/api/pricing/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching blocks");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const pricingSlice = createSlice({
  name: "pricing",
  initialState: {
    blocks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Block
      .addCase(createPricingBlock.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPricingBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks.push(action.payload); // add newly created block
      })
      .addCase(createPricingBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Blocks
      .addCase(fetchBlocksByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlocksByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks = action.payload;
      })
      .addCase(fetchBlocksByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default pricingSlice.reducer;
