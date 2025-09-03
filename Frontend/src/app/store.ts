// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
// import your reducers here
import authReducer from "../features/auth/authSlice";
import planReducer from "../features/plan/planSlice";
import taskReducer from "../features/task/taskSlice";
import titleReducer from "../features/titleSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    task: taskReducer,
    title: titleReducer,
  },
});

// Infer types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
