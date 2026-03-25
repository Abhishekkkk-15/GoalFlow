import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DailyTask } from "../../types";

const initialState: DailyTask[] = [];

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<DailyTask[]>) => {
      return action.payload;
    },
    clearTasks: () => {
      return [];
    },
  },
});

export const { setTasks, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
