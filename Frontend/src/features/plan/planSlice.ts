import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DailyTask, Plan } from "../../types";

const initialState: Plan[] | null = [];

const taskSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      return action.payload;
    },
    clearPlans: (state) => {
      state = null;
    },
  },
});

export const { setPlans, clearPlans } = taskSlice.actions;
export default taskSlice.reducer;
