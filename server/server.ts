import express from "express";
import cors from "cors";
import * as webpush from "web-push";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

// VAPID keys should be generated and stored in your .env file
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error("VAPID keys must be set in .env file");
  process.exit(1);
}

console.log("VAPID keys loaded successfully");

webpush.setVapidDetails(
  "mailto:your-email@example.com", // Replace with your email
  vapidPublicKey,
  vapidPrivateKey
);

// Store subscriptions in memory (use a database in production)
const subscriptions = new Map<string, webpush.PushSubscription>();

// Save push subscription
app.post("/api/subscribe", (req, res) => {
  const subscription = req.body as webpush.PushSubscription;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  console.log("Received new subscription:", subscription.endpoint);
  subscriptions.set(subscription.endpoint, subscription);

  res.status(201).json({ message: "Subscription saved" });
});

// Send push notification
app.post("/api/send-notification", async (req, res) => {
  const { title, body, url } = req.body;

  console.log("Sending notification:", { title, body, url });

  try {
    const notifications = Array.from(subscriptions.values()).map((subscription) =>
      webpush.sendNotification(
        subscription,
        JSON.stringify({
          title,
          body,
          url,
          timestamp: new Date().getTime(),
        })
      )
    );

    await Promise.all(notifications);
    res.json({ message: "Notifications sent successfully" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

// The VAPID public key endpoint is no longer needed.
// app.get("/api/vapid-public-key", (_req, res) => {
//   res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
// });

// Test endpoint
app.get("/api/test", (_req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
