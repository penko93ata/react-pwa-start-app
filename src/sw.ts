/// <reference lib="webworker" />
/// <reference lib="dom" />
/// <reference lib="es2015" />

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

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
  console.log("[SW] Push event received. Attempting to show a basic notification.");

  const title = "It Works!";
  const options = {
    body: "If you see this, the push event was processed.",
    icon: "/pwa-192x192.png",
  };

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => {
        console.log("[SW] showNotification promise resolved successfully.");
      })
      .catch((err) => {
        console.error("[SW] showNotification promise was rejected:", err);
      })
  );
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
