import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TitleState {
  title: string;
  createdAt: string;
}

const initialState: TitleState = {
  title: "",
  createdAt: "",
};

const titleSlice = createSlice({
  name: "title",
  initialState,
  reducers: {
    setTitle: (
      state,
      action: PayloadAction<{ title: string; createdAt: string }>
    ) => {
      state.title = action.payload.title;
      state.createdAt = action.payload.createdAt;
    },
  },
});

export const { setTitle } = titleSlice.actions;
export default titleSlice.reducer;
