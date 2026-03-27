import { model, Schema, Document } from "mongoose";

export type UserPlanTier = "free" | "pro";
export type BillingStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "none";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  goals: string[];
  currentPlan?: Schema.Types.ObjectId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planTier: UserPlanTier;
  billingStatus: BillingStatus;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    goals: [{ type: String }],
    currentPlan: { type: Schema.Types.ObjectId, ref: "Plan" },
    stripeCustomerId: { type: String, index: true, sparse: true },
    stripeSubscriptionId: { type: String, index: true, sparse: true },
    planTier: { type: String, enum: ["free", "pro"], default: "free" },
    billingStatus: {
      type: String,
      enum: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "incomplete",
        "unpaid",
        "none",
      ],
      default: "none",
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
