import { Schema, model, Document } from "mongoose";

export interface ITaskAnalytics extends Document {
  user: Schema.Types.ObjectId;
  plan: Schema.Types.ObjectId;
  task: Schema.Types.ObjectId;
  date: Date;
  weekNumber?: number;
  monthNumber?: number;
  year?: number;
  completed: boolean;
  completionTime?: number;
  streak?: number;
  category?: string;
  frequency?: string;
}

const taskAnalyticsSchema = new Schema<ITaskAnalytics>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    date: { type: Date, required: true },
    weekNumber: Number,
    monthNumber: Number,
    year: Number,
    completed: { type: Boolean, default: false },
    completionTime: Number,
    streak: Number,
    category: String,
    frequency: String,
  },
  { timestamps: true }
);

taskAnalyticsSchema.index({ user: 1, plan: 1, date: 1 });
taskAnalyticsSchema.index({ user: 1, task: 1, date: 1 });

export const TaskAnalytics = model<ITaskAnalytics>(
  "TaskAnalytics",
  taskAnalyticsSchema
);

