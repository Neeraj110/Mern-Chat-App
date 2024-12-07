import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null,
  allUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredential: (state, action) => {
      state.user = action.payload;
      sessionStorage.setItem("user", JSON.stringify(action.payload));
    },
    logoutSuccess: (state) => {
      state.user = null;
      sessionStorage.removeItem("user");
    },
    getUser: (state, action) => {
      state.allUsers = [...action.payload];
    },
  },
});

export const { setCredential, logoutSuccess, getUser } = authSlice.actions;
export default authSlice.reducer;
