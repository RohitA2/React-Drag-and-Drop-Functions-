import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import recipientReducer from "./recipientSlice";
import headerReducer from "./headerSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipients: recipientReducer,
    header: headerReducer,
  },
});

export default store;
