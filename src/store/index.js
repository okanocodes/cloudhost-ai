import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import authReducer from "./authSlice";
import ticketReducer from "./ticketSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    tickets: ticketReducer,
  },
});
