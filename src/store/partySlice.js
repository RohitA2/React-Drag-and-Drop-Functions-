// src/redux/slices/partySlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  partyId: null,
};

const partySlice = createSlice({
  name: "party",
  initialState,
  reducers: {
    setPartyId: (state, action) => {
      state.partyId = action.payload;
    },
    clearPartyId: (state) => {
      state.partyId = null;
    },
  },
});

export const { setPartyId, clearPartyId } = partySlice.actions;
export default partySlice.reducer;
