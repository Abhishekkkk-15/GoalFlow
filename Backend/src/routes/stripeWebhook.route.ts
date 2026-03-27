import express from "express";
import { stripe } from "../config/stripe";
import { User, type BillingStatus, type UserPlanTier } from "../models/user.mode";

const router = express.Router();

const toBillingStatus = (status: string): BillingStatus => {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "canceled" ||
    status === "incomplete" ||
    status === "unpaid"
  ) {
    return status;
  }
  return "none";
};

const toPlanTierFromStatus = (status: BillingStatus): UserPlanTier => {
  if (status === "active" || status === "trialing") return "pro";
  return "free";
};

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || Array.isArray(sig) || !webhookSecret) {
      return res.status(400).json({ error: "Missing Stripe signature/secret" });
    }

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return res.status(400).json({ error: "Invalid Stripe webhook" });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const clerkUserId =
            session.client_reference_id ?? session.metadata?.clerkUserId;
          if (!clerkUserId) break;

          const stripeCustomerId = session.customer as string | undefined;
          const stripeSubscriptionId = session.subscription as string | undefined;

          await User.findOneAndUpdate(
            { clerkId: clerkUserId },
            {
              ...(stripeCustomerId ? { stripeCustomerId } : {}),
              ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
            }
          );
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as any;
          const stripeCustomerId = subscription.customer as string | undefined;
          const stripeSubscriptionId = subscription.id as string | undefined;
          const status = toBillingStatus(subscription.status);
          const planTier = toPlanTierFromStatus(status);

          if (!stripeCustomerId) break;

          await User.findOneAndUpdate(
            { stripeCustomerId },
            {
              ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
              billingStatus: status,
              planTier,
            }
          );
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as any;
          const stripeCustomerId = invoice.customer as string | undefined;
          const stripeSubscriptionId = invoice.subscription as string | undefined;
          if (!stripeCustomerId) break;

          await User.findOneAndUpdate(
            { stripeCustomerId },
            {
              ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
              billingStatus: "active",
              planTier: "pro",
            }
          );
          break;
        }

        default:
          break;
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Stripe webhook handler failed:", err);
      return res.status(500).json({ error: "Webhook handling failed" });
    }
  }
);

export default router;

