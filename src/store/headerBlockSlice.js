// headerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const headerSlice = createSlice({
  name: "headerBlocks",
  initialState: {
    ids: [],
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
      state.ids = action.payload;
    },
    clearHeaderIds: (state) => {
      state.ids = [];
    },
  },
});

export const { addHeaderId, removeHeaderId, setHeaderIds, clearHeaderIds } = headerSlice.actions;
export default headerSlice.reducer;