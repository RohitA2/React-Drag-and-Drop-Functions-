import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  headerId: null,
};

const headerSlice = createSlice({
  name: "header",
  initialState,
  reducers: {
    setHeaderId: (state, action) => {
      state.headerId = action.payload;
    },
    clearHeaderId: (state) => {
      state.headerId = null;
    },
  },
});

export const { setHeaderId, clearHeaderId } = headerSlice.actions;

// Selector
export const selectHeaderId = (state) => state.header.headerId;

export default headerSlice.reducer;
