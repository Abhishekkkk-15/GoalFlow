import { Schema, model, Document } from "mongoose";

export type DashboardDefaultView = "daily" | "weekly" | "monthly";
export type DashboardSortBy = "dueDate" | "priority" | "category";
export type PreferredChartType = "line" | "bar" | "calendar";

export interface IUserPreferences extends Document {
  user: Schema.Types.ObjectId;
  dashboard: {
    defaultView: DashboardDefaultView;
    showCompleted: boolean;
    sortBy: DashboardSortBy;
  };
  notifications: {
    email: boolean;
    push: boolean;
    reminderTime: number;
  };
  analytics: {
    showTrends: boolean;
    preferredChartType: PreferredChartType;
    metricsToShow: string[];
  };
}

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dashboard: {
      defaultView: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
      },
      showCompleted: { type: Boolean, default: false },
      sortBy: {
        type: String,
        enum: ["dueDate", "priority", "category"],
        default: "dueDate",
      },
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminderTime: { type: Number, default: 60 },
    },
    analytics: {
      showTrends: { type: Boolean, default: true },
      preferredChartType: {
        type: String,
        enum: ["line", "bar", "calendar"],
        default: "line",
      },
      metricsToShow: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const UserPreferences = model<IUserPreferences>(
  "UserPreferences",
  userPreferencesSchema
);

