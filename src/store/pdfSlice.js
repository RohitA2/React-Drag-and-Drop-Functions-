import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Thunk to upload PDF
export const uploadPdf = createAsyncThunk(
  "pdf/uploadPdf",
  async ({ blockId, parentId, user_id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("blockId", blockId);
      formData.append("user_id", user_id);
      formData.append("parentId", parentId);

      const res = await axios.post(`${API_URL}/api/pdfblocks`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const pdfSlice = createSlice({
  name: "pdf",
  initialState: {
    pdfs: [], // list of uploaded PDFs
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPdf.fulfilled, (state, action) => {
        state.loading = false;
        state.pdfs.push(action.payload); // ✅ Save uploaded PDF with ID
      })
      .addCase(uploadPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const selectLastUploadedPdfId = (state) =>
  state.pdf?.pdfs?.length > 0
    ? state.pdf.pdfs[state.pdf.pdfs.length - 1].id
    : null;

export default pdfSlice.reducer;
