// src/redux/slices/videoBlockSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Async thunk to create video block
export const createVideoBlock = createAsyncThunk(
  "videoBlocks/create",
  async ({ blockId, link, user_id, parentId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/video/create`, {
        blockId,
        video: link,
        user_id,
        parentId,
      });
      return res.data.data; // return {id, blockId, link, userId}
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Error" });
    }
  }
);

const videoBlockSlice = createSlice({
  name: "videoBlocks",
  initialState: {
    items: [],
    lastCreatedId: null, // 🔹 keep track of last created block id
    loading: false,
    error: null,
  },
  reducers: {
    clearLastCreatedId: (state) => {
      state.lastCreatedId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVideoBlock.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVideoBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);

        // 🔹 Save the return id
        state.lastCreatedId = action.payload.id;

        toast.success("Video block saved!");
      })
      .addCase(createVideoBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
        toast.error(state.error);
      });
  },
});

export const { clearLastCreatedId } = videoBlockSlice.actions;
export default videoBlockSlice.reducer;
