import { createSlice } from "@reduxjs/toolkit";
import { SERVICES } from "../data/knowledgeBase";

const initialState = {
  list: SERVICES,
  categories: ["Tümü", "VPS", "Cloud Server", "Web Hosting"],
  selectedCategory: "Tümü",
  highlightedServiceId: null,
  selectedServiceId: "vps-pro",
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

    setSelectedServiceId: (state, action) => {
      state.selectedServiceId = action.payload;
    },
  },
});

export const {
  setSelectedCategory,
  setHighlightedService,
  setSelectedServiceId,
} = servicesSlice.actions;

export default servicesSlice.reducer;