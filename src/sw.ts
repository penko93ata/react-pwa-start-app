/// <reference lib="webworker" />
/// <reference lib="dom" />
/// <reference lib="es2015" />

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

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

// Enable service worker immediately
clientsClaim();
self.skipWaiting();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const options: NotificationOptions = {
    body: data.body ?? "New notification",
    icon: "/pwa-192x192.png",
    badge: "/pwa-512x512.png",
    // vibrate: [200, 100, 200],
    data: {
      url: data.url ?? "/",
      ...data,
    } as NotificationData,
    actions: [
      {
        action: "open",
        title: "Open App",
        icon: "/icons/open.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/dismiss.png",
      },
      {
        action: "like",
        title: "Like",
        icon: "/icons/like.png",
      },
    ] as NotificationAction[],
  };

  event.waitUntil(self.registration.showNotification(data.title ?? "New Notification", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", async (event) => {
  console.log("Notification clicked:", event.action);
  event.notification.close();

  const urlToOpen = event.notification.data?.url ?? "/";

  switch (event.action) {
    case "open": {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Try to find an existing window
      const existingWindow = windowClients.find((client) => client.url === urlToOpen || client.visibilityState === "visible");

      if (existingWindow) {
        await existingWindow.focus();
        return;
      }

      // If no existing window, open a new one
      await self.clients.openWindow(urlToOpen);
      break;
    }

    case "like": {
      console.log("Like action clicked");
      const postId = event.notification.data?.postId;
      if (postId) {
        try {
          // You would replace this with your actual API endpoint
          const response = await fetch(`/api/like/${postId}`, {
            method: "POST",
          });
          console.log("Like response:", response.ok);
        } catch (error) {
          console.error("Error sending like:", error);
        }
      }
      break;
    }

    case "dismiss":
      console.log("Notification dismissed");
      break;

    default: {
      // Add opening brace here
      // If no action specified, open the default URL
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      if (allClients.length > 0) {
        await allClients[0].focus();
      } else {
        await self.clients.openWindow(urlToOpen);
      }
      break;
    } // Add closing brace here
  }
});
