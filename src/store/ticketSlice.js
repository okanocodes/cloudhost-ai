import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickets: [
    {
      id: 1042,
      subject: "Faturalama sorgusu",
      message: "Geçen ayın faturası beklediğimden yüksek geldi.",
      status: "resolved",
      userEmail: "admin@admin.com",
    },
    {
      id: 1043,
      subject: "Server yavaşlaması",
      message: "Peak saatlerde server'ın client'a yanıtı bazen gecikebiliyor.",
      status: "open",
      userEmail: "admin@admin.com",
    },
  ],
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    createTicket: (state, action) => {
      const { subject, message, userEmail } = action.payload;
      const id = 1000 + state.tickets.length + 1;
      state.tickets.unshift({
        id,
        subject: subject || "Genel Talep",
        message,
        status: "open",
        userEmail,
      });
    },
  },
});

export const { createTicket } = ticketSlice.actions;
export default ticketSlice.reducer;
