import { configureStore } from "@reduxjs/toolkit";
import servicesReducer from "./servicesSlice";
import authReducer from "./authSlice";
import ticketReducer from "./ticketSlice";
import myServicesReducer from "./myServicesSlice";

export const store = configureStore({
  reducer: {
    //dersten örnekler:
    // auth: authReducer,
    // customers: customerReducer,
    // stock: stockReducer,
    // products: productReducer,
    // reports: reportReducer,
    // messaging: messageReducer,
    services: servicesReducer,
    auth: authReducer,
    tickets: ticketReducer,
    myServices: myServicesReducer,
  },
});
