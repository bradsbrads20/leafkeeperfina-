import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  server: {
    host: true, // better than "::" for compatibility
    port: 3000,
    fs: {
      allow: [
        path.resolve(__dirname, "client"),
        path.resolve(__dirname, "shared"),
        path.resolve(__dirname, "index.html"),
      ],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
}));

function expressPlugin() {
  return {
    name: "express-plugin",
    apply: "serve", // dev only
    async configureServer(server) {
      try {
        const { createServer } = await import("./server/index.js"); 
        // 👆 explicitly point to file to avoid resolution issues

        const app = createServer();

        // attach BEFORE Vite fallback
        server.middlewares.use(app);
      } catch (err) {
        console.warn("Server module not available:", err.message);
      }
    },
  };
}