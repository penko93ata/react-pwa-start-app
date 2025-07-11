import express from "express";
import cors from "cors";
import * as webpush from "web-push";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

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
  const id = Math.random().toString(36).substring(2);

  console.log("Received subscription:", subscription);
  subscriptions.set(id, subscription);

  res.json({ id, message: "Subscription saved" });
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

// Test endpoint
app.get("/api/test", (_req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
