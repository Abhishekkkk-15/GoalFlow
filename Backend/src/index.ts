import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { requireAuth, clerkMiddleware } from "@clerk/express";
import clerkWebhook from "./routes/route.clerkWebhook";
import { connectDB } from "./config/db";
import bodyParser from "body-parser";
import planRouter from "./routes/plan.route";
import tasksRouter from "./routes/tasks.route";
import preferencesRouter from "./routes/preferences.route";
import plansRouter from "./routes/plans.route";
import billingRouter from "./routes/billing.route";
import stripeWebhookRouter from "./routes/stripeWebhook.route";
import chatRouter from "./routes/chat.route";

config();
const app = express();
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
  })
);
app.use(clerkMiddleware());
app.use("/api/webhooks", clerkWebhook);
app.use("/api/webhooks", stripeWebhookRouter);
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Connect to MongoDB before serving requests.
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  // Fail fast so configuration issues are obvious.
  throw new Error("Missing required environment variable: MONGO_URI");
}
connectDB();

// All Routes
app.use("/api", planRouter);
app.use("/api", tasksRouter);
app.use("/api", preferencesRouter);
app.use("/api", plansRouter);
app.use("/api", billingRouter);
app.use("/api", chatRouter);

app.get("/", (req, res) => {
  res.send("hey there");
});

app.get("/api/protected", requireAuth(), async (req, res) => {
  res.json({ message: "Hey there how are you" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
