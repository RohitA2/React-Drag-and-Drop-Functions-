import { configureStore } from "@reduxjs/toolkit";
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

export const store = configureStore({
  reducer: {
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
  },
});

export default store;
