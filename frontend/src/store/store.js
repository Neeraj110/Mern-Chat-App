import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../redux/themeSlice";
import authReducer from "../redux/authSlice";
import conversationReducer from "../redux/conversationSlice";

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    conversations: conversationReducer,
  },
});

export default store;
