import { createSlice } from "@reduxjs/toolkit";
import { SERVICES } from "../data/knowledgeBase";

const initialState = {
  list: SERVICES,
  categories: ["Tümü", "VPS", "Cloud Server", "Web Hosting"],
  selectedCategory: "Tümü",
  highlightedServiceId: null,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },

    setHighlightedService: (state, action) => {
      state.highlightedServiceId = action.payload;
    },
  },
});

export const { setSelectedCategory, setHighlightedService } =
  servicesSlice.actions;

export default servicesSlice.reducer;