import { VitePWA } from "vite-plugin-pwa";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
        },
      },
    },
    define: {
      "import.meta.env.VITE_VAPID_PUBLIC_KEY": JSON.stringify(env.VAPID_PUBLIC_KEY),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        },
        devOptions: {
          enabled: true,
          type: "module",
        },
        manifest: {
          name: "Vite PWA Push TS Example",
          short_name: "PWA Push TS",
          description: "A simple Vite PWA with push notification example in TypeScript",
          theme_color: "#ffffff",
          icons: [
            // IMPORTANT: You should generate these icons using @vite-pwa/assets-generator
            // For now, ensure you have these dummy files in your 'public' folder
            {
              src: "pwa-64x64.png",
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        // Configuration for injectManifest strategy (for custom service worker)
        strategies: "injectManifest",
        srcDir: "src", // Directory where your custom service worker is located
        filename: "sw.ts", // Name of your custom service worker file (now .ts)
      }),
    ],
    // plugins: [
    //   react(),
    //   VitePWA({
    //     registerType: "autoUpdate",
    //     injectRegister: "auto",
    //     devOptions: {
    //       enabled: true,
    //       type: "module",
    //       navigateFallback: "index.html",
    //     },
    //     includeAssets: ["pwa-192x192.png", "pwa-512x512.png", "favicon.ico"],
    //     manifest: {
    //       name: "react-pwa-starter-app",
    //       short_name: "react-pwa-starter-app",
    //       description: "Introduction to PWA",
    //       theme_color: "#ffffff",
    //       background_color: "#ffffff",
    //       display: "standalone",
    //       scope: "/",
    //       start_url: "/",
    //       icons: [
    //         {
    //           src: "/pwa-192x192.png",
    //           sizes: "192x192",
    //           type: "image/png",
    //         },
    //         {
    //           src: "/pwa-512x512.png",
    //           sizes: "512x512",
    //           type: "image/png",
    //           purpose: "any maskable",
    //         },
    //       ],
    //     },
    //     workbox: {
    //       navigateFallback: "/index.html",
    //       globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    //       runtimeCaching: [
    //         {
    //           urlPattern: ({ url }) => url.pathname.startsWith("/api"),
    //           handler: "NetworkFirst",
    //           options: {
    //             cacheName: "api-cache",
    //             networkTimeoutSeconds: 5,
    //             expiration: {
    //               maxEntries: 50,
    //               maxAgeSeconds: 60 * 60 * 24, // 24 hours
    //             },
    //           },
    //         },
    //       ],
    //       cleanupOutdatedCaches: true,
    //     },
    //   }),
    // ],
  };
});
