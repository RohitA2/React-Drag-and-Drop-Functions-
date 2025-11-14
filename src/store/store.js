import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import recipientReducer from "./recipientSlice";
import headerReducer from "./headerSlice";
import headerBlockReducer from "./headerBlockSlice";
import partyReducer from "./partySlice";
import signatureReducer from "./signatureSlice";
import scheduleReducer from "./scheduleSlice";
import pdfReducer from "./pdfSlice";
import videoBlockReducer from "./videoBlockSlice";
import attachmentReducer from "./attachmentSlice";
import pricingReducer from "./pricingSlice";
import canvasReducer from "./canvasSlice";

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["canvas", "auth"], // Only persist canvas and auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  recipients: recipientReducer,
  header: headerReducer,
  headerBlocks: headerBlockReducer,
  party: partyReducer,
  signatures: signatureReducer,
  schedule: scheduleReducer,
  pdfs: pdfReducer,
  videoBlocks: videoBlockReducer,
  attachments: attachmentReducer,
  pricing: pricingReducer,
  canvas: canvasReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
