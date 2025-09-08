// src/store/attachmentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Upload files with both displayName & originalName
export const uploadAttachments = createAsyncThunk(
  "attachments/upload",
  async ({ blockId, user_id, items }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("blockId", blockId);
      formData.append("user_id", user_id);

      items.forEach((it) => {
        formData.append("files", it.file); // the actual file
        formData.append("displayNames[]", it.displayName); // renamed name
        formData.append("originalNames[]", it.file.name); // original name
      });

      const res = await axios.post(`${API_URL}/attachments/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Backend should return { success: true, data: [ { id, blockId, displayName, originalName, ... } ] }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const attachmentSlice = createSlice({
  name: "attachments",
  initialState: {
    items: [],              // all uploaded attachments
    lastUploadedIds: [],    // last uploaded IDs
    lastBlockId: null,      // last uploaded blockId
    loading: false,
    error: null,
  },
  reducers: {
    clearAttachmentIds(state) {
      state.lastUploadedIds = [];
      state.lastBlockId = null;
      localStorage.removeItem("lastAttachmentIds");
      localStorage.removeItem("lastBlockId");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload?.data || [];

        // merge uploaded items into state
        state.items = [...state.items, ...payload];

        // store ids + blockId
        const ids = payload.map((p) => p.id);
        const blockId = payload.length > 0 ? payload[0].blockId : null;

        state.lastUploadedIds = ids;
        state.lastBlockId = blockId;

        // save in localStorage
        localStorage.setItem("lastAttachmentIds", JSON.stringify(ids));
        if (blockId) localStorage.setItem("lastBlockId", blockId);
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearAttachmentIds } = attachmentSlice.actions;

// 🔹 Selectors
export const selectLastAttachmentIds = (state) =>
  state.attachments?.lastUploadedIds ||
  JSON.parse(localStorage.getItem("lastAttachmentIds") || "[]");

export const selectLastBlockId = (state) =>
  state.attachments?.lastBlockId ||
  localStorage.getItem("lastBlockId");

export default attachmentSlice.reducer;
