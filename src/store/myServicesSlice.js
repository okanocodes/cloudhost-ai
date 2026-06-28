import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  instances: [
    { id: 1, name: "web-prod-01", service: "VPS Pro", status: "active", ip: "185.42.11.7", userEmail: "admin@admin.com" },
    { id: 2, name: "db-staging-02", service: "Cloud Enterprise", status: "active", ip: "185.42.11.18", userEmail: "admin@admin.com" },
    { id: 3, name: "landing-site-03", service: "Web Hosting Starter", status: "stopped", ip: "185.42.11.29", userEmail: "admin@admin.com" },
    { id: 4, name: "vps-basic-04", service: "VPS Basic", status: "active", ip: "185.42.11.45", userEmail: "admin@admin.com" },
  ],
};

export const rebootInstance = createAsyncThunk(
  "myServices/rebootInstance",
  async (id, { dispatch }) => {
    dispatch(setInstanceStatus({ id, status: "rebooting" }));
    await new Promise((resolve) => setTimeout(resolve, 3000));
    dispatch(setInstanceStatus({ id, status: "active" }));
  }
);

const myServicesSlice = createSlice({
  name: "myServices",
  initialState,
  reducers: {
    addInstance: (state, action) => {
      state.instances.push(action.payload);
    },
    setInstanceStatus: (state, action) => {
      const { id, status } = action.payload;
      const inst = state.instances.find((i) => i.id === id);
      if (inst) {
        inst.status = status;
      }
    },
    toggleStopInstance: (state, action) => {
      const id = action.payload;
      const inst = state.instances.find((i) => i.id === id);
      if (inst) {
        inst.status = inst.status === "stopped" ? "active" : "stopped";
      }
    },
  },
});

export const { addInstance, setInstanceStatus, toggleStopInstance } = myServicesSlice.actions;
export default myServicesSlice.reducer;
