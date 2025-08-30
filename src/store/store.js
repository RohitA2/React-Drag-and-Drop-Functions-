import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import recipientReducer from "./recipientSlice";
import headerReducer from "./headerSlice"
import headerBlockReducer from "./headerBlockSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipients: recipientReducer,
    header: headerReducer,
    headerBlocks: headerBlockReducer,
  },
});

export default store;
