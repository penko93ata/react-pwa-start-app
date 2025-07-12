// import { VAPID_PUBLIC_KEY } from "../config/vapid";

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  console.log("Checking notification permission...");
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    console.log("Notification permission already granted");
    return true;
  }

  if (Notification.permission === "denied") {
    console.log("Notification permission denied");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("Permission request result:", permission);
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

const API_URL = "http://localhost:5001";

export const subscribeToNotifications = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  const registration = await navigator.serviceWorker.ready;
  console.log("Subscribing to push notifications...");

  try {
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("VAPID public key is not defined. Make sure it's set in your .env file and exposed in vite.config.ts");
      throw new Error("VAPID public key is missing");
    }

    console.log("Using VAPID public key for subscription:", vapidPublicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log("Push subscription:", subscription);

    // Send subscription to backend
    const response = await fetch(`${API_URL}/api/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error("Failed to send subscription to server");
    }

    const result = await response.json();
    console.log("Subscription saved on server:", result);

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe:", error);
    throw error;
  }
};

export const testServerNotification = async (payload: { title: string; body: string; url?: string }) => {
  try {
    const response = await fetch(`${API_URL}/api/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send notification");
    }

    const result = await response.json();
    console.log("Server notification result:", result);
    return result;
  } catch (error) {
    console.error("Error sending server notification:", error);
    throw error;
  }
};
