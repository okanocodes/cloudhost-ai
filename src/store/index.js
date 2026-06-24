import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";

export const store = configureStore({
  reducer: {
    // örnek,
    counter: counterReducer,
    //dersten örnekler:
    // auth: authReducer,
    // customers: customerReducer,
    // stock: stockReducer,
    // products: productReducer,
    // reports: reportReducer,
    // messaging: messageReducer,
  },
});
