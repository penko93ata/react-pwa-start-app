import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker
const registerSW = async () => {
  try {
    const { registerSW } = await import("virtual:pwa-register");
    const updateSW = registerSW({
      immediate: true,
      onRegistered(registration) {
        console.log("Service worker registered:", registration);

        if (registration) {
          registration.addEventListener("push", (event) => {
            console.log("Push event received in registration:", event);
          });
        }
      },
      onNeedRefresh() {
        if (confirm("New content available. Reload?")) {
          window.location.reload();
        }
      },
    });

    // Log service worker status
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log("Service Worker ready, scope:", registration.scope);
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Message from Service Worker:", event.data);
      });
    }

    return updateSW;
  } catch (error) {
    console.error("Failed to register service worker:", error);
  }
};

registerSW();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
