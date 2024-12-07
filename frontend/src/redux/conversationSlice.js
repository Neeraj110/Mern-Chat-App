import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedConversation: null,

  isGroupUpdated: false,
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setGroupUpdated: (state, action) => {
      state.isGroupUpdated = action.payload;
    },
  },
});

export const { setSelectedConversation, setGroupUpdated } =
  conversationSlice.actions;

export default conversationSlice.reducer;
