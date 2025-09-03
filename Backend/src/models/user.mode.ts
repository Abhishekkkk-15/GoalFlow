import { model, Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  goals: string[];
  currentPlan?: Schema.Types.ObjectId;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    goals: [{ type: String }],
    currentPlan: { type: Schema.Types.ObjectId, ref: "Plan" },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
