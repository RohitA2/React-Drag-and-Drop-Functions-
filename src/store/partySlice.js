import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  partyId: null,
  toParties: [],
  fromParty: null,
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
      state.toParties = [];
      state.fromParty = null;
    },
    setParties: (state, action) => {
      state.toParties = action.payload.toParties || [];
      state.fromParty = action.payload.fromParty || null;
    },
  },
});

export const { setPartyId, clearPartyId, setParties } = partySlice.actions;
export default partySlice.reducer;
