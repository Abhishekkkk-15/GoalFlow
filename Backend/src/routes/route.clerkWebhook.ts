import express from "express";
import { Webhook } from "svix";
import { User } from "../models/user.mode";
import { clerkClient } from "@clerk/express";
const router = express.Router();
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt: any;
    try {
      const payload = req.body.toString("utf8");
      const headers = req.headers;
      evt = wh.verify(payload, headers as any);
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return res.status(400).json({ error: "Invalid webhook" });
    }

    const { type, data } = evt as any;

    try {
      if (type === "user.created") {
        const isUserExists = await User.exists({
          clerkId: data.id,
        });
        if (isUserExists) {
          console.log(isUserExists);
          console.log("Its exited from here, UserId : ", data.id);
          return res.status(200).json({ message: "User alredy exists" });
        }
        const {
          id,
          first_name,
          last_name,
          email_addresses = [],
          primary_email_address_id,
          image_url,
        } = data;

        const primaryEmail =
          email_addresses.find((e: any) => e.id === primary_email_address_id)
            ?.email_address || null;

        await User.findOneAndUpdate(
          { clerkId: id },
          {
            clerkId: id,
            email: primaryEmail,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            imageUrl: image_url,
          },
          { upsert: true, new: true }
        );

        console.log("✅ User synced in DB:", id);
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("DB Sync Error:", err);
      return res.status(500).json({ error: "DB sync failed" });
    }
  }
);

export default router;
