import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import servicesReducer from "./servicesSlice";
import authReducer from "./authSlice";
import ticketReducer from "./ticketSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    //dersten örnekler:
    // auth: authReducer,
    services: servicesReducer,
    // customers: customerReducer,
    // stock: stockReducer,
    // products: productReducer,
    // reports: reportReducer,
    // messaging: messageReducer,
    auth: authReducer,
    tickets: ticketReducer,
  },
});
