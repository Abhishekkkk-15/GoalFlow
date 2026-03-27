import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(stripeSecretKey, {
  // Use the Stripe SDK default pinned API version for this package.
});

