import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [
    {
      name: "admin",
      email: "admin@admin.com",
      password: "0000",
    },
  ],
  user: null,
  isLoggedIn: false,
  activeTab: "home",
  notice: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const existsUser = state.users.find(
        (user) =>
          user.email === action.payload.email &&
          user.password === action.payload.password,
      );
      if (existsUser) {
        state.isLoggedIn = true;
        state.user = {
          ...existsUser,
          name: existsUser.name || existsUser.email.split("@")[0],
        };
        state.activeTab = "dashboard";
        state.notice = "";
      } else {
        state.isLoggedIn = false;
        state.user = null;
        state.notice = "E-posta adresi veya şifre hatalı.";
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.activeTab = "home";
      state.notice = "";
    },
    register: (state, action) => {
      const newUser = action.payload;
      state.users.push(newUser);
      state.isLoggedIn = true;
      state.user = newUser;
      state.activeTab = "dashboard";
      state.notice = "";
    },
    setActiveTab: (state, action) => {
      const page = action.payload;
      const PROTECTED_PAGES = ["dashboard", "myservices", "tickets"];
      if (PROTECTED_PAGES.includes(page) && !state.isLoggedIn) {
        state.notice = "Bu sayfayı görüntülemek için giriş yapmalısınız.";
        state.activeTab = "login";
      } else {
        state.notice = "";
        state.activeTab = page;
      }
    },
    setNotice: (state, action) => {
      state.notice = action.payload;
    },
  },
});

export const { login, logout, register, setActiveTab, setNotice } =
  authSlice.actions;
export default authSlice.reducer;
