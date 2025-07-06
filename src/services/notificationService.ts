import { VAPID_PUBLIC_KEY } from "../config/vapid";

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationData {
  type: string;
  url: string;
  postId?: string;
  customData?: Record<string, unknown>;
}

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

const baseOptions: NotificationOptions = {
  icon: "/pwa-192x192.png",
  badge: "/pwa-512x512.png",
  // vibrate: [200, 100, 200],
  requireInteraction: true,
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.log("Notification permission denied");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const subscribeToNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: await getVapidPublicKey(),
    });

    // Send the subscription to your backend
    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    throw error;
  }
};

export const sendTestNotification = async (type: "default" | "like" | "custom" = "default") => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  const registration = await navigator.serviceWorker.ready;

  switch (type) {
    case "like": {
      console.log("Sending like notification");
      const options: NotificationOptions = {
        ...baseOptions,
        body: "Someone liked your post",
        data: {
          type: "like",
          postId: "123",
          url: "/posts/123",
        } as NotificationData,
        actions: [
          {
            action: "open",
            title: "View Post",
          },
          {
            action: "like",
            title: "Like Back",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ] as NotificationAction[],
      };
      await registration.showNotification("New Like!", options);
      break;
    }

    case "custom": {
      const options: NotificationOptions = {
        ...baseOptions,
        body: "This is a custom notification with actions",
        data: {
          type: "custom",
          customData: { key: "value" },
          url: "/custom",
        } as NotificationData,
        actions: [
          {
            action: "open",
            title: "Open",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ] as NotificationAction[],
      };
      await registration.showNotification("Custom Notification", options);
      break;
    }

    default: {
      const options: NotificationOptions = {
        ...baseOptions,
        body: "This is a test notification",
        data: {
          type: "default",
          url: "/",
        } as NotificationData,
        actions: [
          {
            action: "open",
            title: "Open App",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ] as NotificationAction[],
      };
      await registration.showNotification("Test Notification", options);
    }
  }
};
