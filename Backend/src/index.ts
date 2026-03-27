import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { requireAuth, clerkMiddleware } from "@clerk/express";
import clerkWebhook from "./routes/route.clerkWebhook";
import { connectDB } from "./config/db";
import bodyParser from "body-parser";
import planRouter from "./routes/plan.route";

config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(clerkMiddleware());
app.use("/api/webhooks", clerkWebhook);
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
// connectDB();
// All Routes
app.use("/api", planRouter);

app.get("/", (req, res) => {
  res.send("hey there");
});

app.get("/api/protected", requireAuth(), async (req, res) => {
  res.json({ message: "Hey there how are you" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
