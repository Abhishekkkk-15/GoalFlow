import { Schema, model, Document } from "mongoose";

export interface ITokenUsage extends Document {
  user: Schema.Types.ObjectId;
  monthKey: string; // YYYY-MM
  tokensUsed: number;
}

const tokenUsageSchema = new Schema<ITokenUsage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    monthKey: { type: String, required: true },
    tokensUsed: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

tokenUsageSchema.index({ user: 1, monthKey: 1 }, { unique: true });

export const TokenUsage = model<ITokenUsage>("TokenUsage", tokenUsageSchema);

