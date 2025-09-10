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


const signatureSlice = createSlice({
  name: "signatures",
  initialState: {
    items: [],
    status: "idle",
    error: null,
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
      });
  },
});

export default signatureSlice.reducer;
