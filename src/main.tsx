import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Register PWA in development
if (import.meta.env.DEV) {
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Prompt user to refresh when new content is available
      if (confirm("New content available. Reload?")) {
        window.location.reload();
      }
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
