/// <reference lib="webworker" />
/// <reference lib="dom" />
/// <reference lib="es2015" />

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

// Define a custom interface for notification options to include actions
interface CustomNotificationOptions extends NotificationOptions {
  actions?: { action: string; title: string; icon?: string }[];
}

// Enable service worker immediately
self.skipWaiting();
clientsClaim();

console.log("[Service Worker] Initializing");

// Log installation
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...", event);
});

// Log activation
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activated", event);
});

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Handle push events
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push event received", {
    event,
    data: event.data?.text(),
    timestamp: new Date().toISOString(),
  });

  if (!event.data) {
    console.log("[Service Worker] No data received in push event");
    return;
  }

  try {
    const data = event.data.json();
    console.log("[Service Worker] Push data:", data);

    // Use the custom interface here
    const options: CustomNotificationOptions = {
      body: data.body || "New message received",
      icon: "/pwa-192x192.png",
      badge: "/pwa-512x512.png",
      data: {
        url: data.url || "/",
        ...data,
      },
      actions: [
        {
          action: "open",
          title: "Open",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    };

    console.log("[Service Worker] Showing notification with options:", options);

    event.waitUntil(
      self.registration
        .showNotification(data.title || "New Message", options)
        .then(() => console.log("[Service Worker] Notification shown successfully"))
        .catch((error) => console.error("[Service Worker] Error showing notification:", error))
    );
  } catch (error) {
    console.error("[Service Worker] Error handling push event:", error);
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", async (event) => {
  console.log("Notification clicked:", event.action);
  event.notification.close();

  const urlToOpen = (event.notification.data as { url?: string })?.url ?? "/";
  const action = event.action;

  switch (action) {
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

    case "dismiss":
      console.log("Notification dismissed");
      break;

    default: {
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
    }
  }
});
