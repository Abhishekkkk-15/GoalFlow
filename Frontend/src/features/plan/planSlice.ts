import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plan } from "../../types";

const initialState: Plan[] = [];

const taskSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      return action.payload;
    },
    clearPlans: () => {
      return [];
    },
  },
});

export const { setPlans, clearPlans } = taskSlice.actions;
export default taskSlice.reducer;
