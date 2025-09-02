import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import recipientReducer from "./recipientSlice";
import headerReducer from "./headerSlice"
import headerBlockReducer from "./headerBlockSlice"
import partyReducer from "./partySlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipients: recipientReducer,
    header: headerReducer,
    headerBlocks: headerBlockReducer,
     party: partyReducer,
  },
});

export default store;
