import { Schema, model, Document } from "mongoose";

export interface ITask extends Document {
  plan: Schema.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  dueDate?: Date;
  startDate: Date;
  createdAT: Date;
  frequency: "daily" | "weekly" | "monthly" | "once";
  priority?: "low" | "medium" | "high";
}

const taskSchema = new Schema<ITask>(
  {
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    title: { type: String, required: true },
    description: String,
    completed: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "once"],
      default: "daily",
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
  },
  { timestamps: true }
);
export const Task = model<ITask>("Task", taskSchema);
