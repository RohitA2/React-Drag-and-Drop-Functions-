// signatureSlice.js
import { createSlice } from "@reduxjs/toolkit";

const signatureSlice = createSlice({
  name: "signatures",
  initialState: {
    items: [],
  },
  reducers: {
    createSignature: (state) => {
      const id = Date.now();
      state.items.push({ id });
    },
  },
});

export const { createSignature } = signatureSlice.actions;
export default signatureSlice.reducer;
