// src/redux/slices/scheduleSlice.js
import { createSlice } from "@reduxjs/toolkit";

const scheduleSlice = createSlice({
  name: "schedule",
  initialState: {
    scheduleId: null,
  },
  reducers: {
    setScheduleId: (state, action) => {
      state.scheduleId = action.payload;
    },
  },
});

export const { setScheduleId } = scheduleSlice.actions;
export default scheduleSlice.reducer;
