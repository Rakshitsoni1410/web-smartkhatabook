import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      devOptions: {
        enabled: true,
      },

      manifest: {
        name: "Smart Khata ERP",

        short_name: "SmartKhata",

        description: "AI Powered Smart ERP System",

        theme_color: "#4f46e5",

        background_color: "#ffffff",

        display: "standalone",

        start_url: "/",

        
      },
    }),
  ],
});
