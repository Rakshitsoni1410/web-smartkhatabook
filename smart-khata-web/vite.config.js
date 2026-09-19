import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: ["favicon.ico", "favicon-48.png", "apple-touch-icon.png"],

      manifest: {
        id: "/",

        name: "SmartKhataBook",

        short_name: "SmartKhata",

        description:
          "Digital khata, inventory, ledger, billing, orders and business management for retailers and wholesalers.",

        theme_color: "#4f46e5",

        background_color: "#ffffff",

        display: "standalone",

        start_url: "/",

        scope: "/",

        orientation: "portrait-primary",

        categories: ["business", "finance", "productivity"],

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },

          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },

          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        navigateFallback: "/index.html",
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});
