/// <reference lib="webworker" />
/// <reference lib="dom" />
/// <reference lib="es2015" />

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

// Enable service worker immediately
clientsClaim();
self.skipWaiting();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Handle push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data?.text() ?? "No payload",
    icon: "/pwa-192x192.png",
    badge: "/pwa-512x512.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View App",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("New Notification", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(
      (async () => {
        // Get all windows
        const windowClients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        // If a window already exists, focus it
        for (const windowClient of windowClients) {
          if (windowClient.url === "/" && "focus" in windowClient) {
            await windowClient.focus();
            return;
          }
        }

        // If no window exists, open a new one
        await self.clients.openWindow("/");
      })()
    );
  }
});
