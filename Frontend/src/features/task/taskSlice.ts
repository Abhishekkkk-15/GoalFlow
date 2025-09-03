import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DailyTask } from "../../types";

const initialState: DailyTask[] | null = [];

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<DailyTask[]>) => {
      return action.payload;
    },
    clearTasks: (state) => {
      state = null;
    },
  },
});

export const { setTasks, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
