import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import servicesReducer from "./servicesSlice";

export const store = configureStore({
  reducer: {
    // örnek,
    counter: counterReducer,
    //dersten örnekler:
    // auth: authReducer,
    services: servicesReducer,
    // customers: customerReducer,
    // stock: stockReducer,
    // products: productReducer,
    // reports: reportReducer,
    // messaging: messageReducer,
  },
});
