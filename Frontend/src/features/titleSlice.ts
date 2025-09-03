import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  title: "",
  createdAt: "",
};

const titleSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export const { setTitle } = titleSlice.actions;
export default titleSlice.reducer;
