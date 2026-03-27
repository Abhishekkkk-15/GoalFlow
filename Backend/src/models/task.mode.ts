import { Schema, model, Document } from "mongoose";

export type TaskFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "one-time"
  // backward-compat (existing DB values)
  | "once";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "quarterly";

export interface ITask extends Document {
  plan: Schema.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  category: string;
  dueDate?: Date;
  startDate?: Date;
  frequency: TaskFrequency;
  priority?: "low" | "medium" | "high";

  recurrence?: {
    pattern?: RecurrencePattern;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
  };
  originalTaskId?: Schema.Types.ObjectId;
  isRecurring: boolean;
  completedInstances: {
    date: Date;
    completedAt: Date;
  }[];
}

const taskSchema = new Schema<ITask>(
  {
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    title: { type: String, required: true },
    description: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "one-time", "once"],
      default: "one-time",
      required: true,
    },
    startDate: { type: Date },
    category: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: Date,

    recurrence: {
      pattern: { type: String, enum: ["daily", "weekly", "monthly", "quarterly"] },
      interval: { type: Number, default: 1 },
      daysOfWeek: [{ type: Number }],
      dayOfMonth: { type: Number },
      endDate: { type: Date },
    },
    originalTaskId: { type: Schema.Types.ObjectId, ref: "Task" },
    isRecurring: { type: Boolean, default: false },
    completedInstances: [
      {
        date: { type: Date, required: true },
        completedAt: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);
export const Task = model<ITask>("Task", taskSchema);
