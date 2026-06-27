import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchServicesData = createAsyncThunk(
  "services/fetchServicesData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/data.json");

      if (!response.ok) {
        throw new Error("data.json okunamadı");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  list: [],
  company: null,
  categories: ["Tümü"],
  selectedCategory: "Tümü",
  highlightedServiceId: null,
  selectedServiceId: "vps-pro",
  status: "idle",
  error: null,
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

  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchServicesData.fulfilled, (state, action) => {
        const services = action.payload.SERVICES || [];

        state.status = "succeeded";
        state.list = services;
        state.company = action.payload.COMPANY || null;

        state.categories = [
          "Tümü",
          ...new Set(services.map((service) => service.category)),
        ];
      })

      .addCase(fetchServicesData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedCategory,
  setHighlightedService,
  setSelectedServiceId,
} = servicesSlice.actions;

export default servicesSlice.reducer;