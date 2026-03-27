import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { stripe } from "../config/stripe";
import { User } from "../models/user.mode";

const getAppBaseUrl = () => {
  const raw = process.env.APP_URL;
  return raw?.trim() ? raw.trim() : "http://localhost:5173";
};

export const handleCreateCheckoutSession = async (
  req: Request,
  res: Response
) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      res.status(500).json({
        success: false,
        error: "Missing STRIPE_PRICE_ID on server",
      });
      return;
    }

    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const appUrl = getAppBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: clerkUserId,
      customer: user.stripeCustomerId ?? undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/preferences?billing=success`,
      cancel_url: `${appUrl}/preferences?billing=cancel`,
      metadata: {
        clerkUserId,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleCreateBillingPortalSession = async (
  req: Request,
  res: Response
) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user || !user.stripeCustomerId) {
      res.status(404).json({
        success: false,
        error: "No billing profile found for user",
      });
      return;
    }

    const appUrl = getAppBaseUrl();
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/preferences`,
    });

    res.json({ success: true, url: portal.url });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};
