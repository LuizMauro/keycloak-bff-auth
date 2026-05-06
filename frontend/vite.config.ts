import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:3001",
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes, req) => {
            if (req.url?.includes("/notifications")) {
              proxyRes.headers["cache-control"] = "no-cache";
              proxyRes.headers["content-type"] = "text/event-stream";
            }
          });
        },
      },
    },
  },
});
