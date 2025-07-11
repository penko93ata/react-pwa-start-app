import { VAPID_PUBLIC_KEY } from "../config/vapid";

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

const getVapidPublicKey = async (): Promise<Uint8Array> => {
  return urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
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
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: await getVapidPublicKey(),
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

export const testServerNotification = async () => {
  try {
    const response = await fetch(`${API_URL}/api/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Notification",
        body: "This is a test notification from the server!",
        url: "/",
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

export const sendTestNotification = async (type: "default" | "like" | "custom" = "default") => {
  console.log(`Attempting to send ${type} notification...`);

  if (!("Notification" in window)) {
    console.error("Notifications not supported");
    throw new Error("Notifications not supported");
  }

  if (Notification.permission !== "granted") {
    console.error("Notification permission not granted");
    throw new Error("Notification permission not granted");
  }

  try {
    // Try direct notification first
    console.log("Trying direct notification...");
    new Notification("Test Direct Notification", {
      body: "This is a direct notification test",
      icon: "/pwa-192x192.png",
    });

    // Then try through service worker
    console.log("Trying through service worker...");
    const registration = await navigator.serviceWorker.ready;
    console.log("Service Worker ready:", registration);

    const options: NotificationOptions = {
      body: "This is a test notification",
      icon: "/pwa-192x192.png",
      badge: "/pwa-512x512.png",
      tag: "test-notification",
      // renotify: true,
      requireInteraction: true,
      data: {
        type: type,
        url: "/",
      },
    };

    await registration.showNotification("Test Notification", options);
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};
