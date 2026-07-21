import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Local dev only: proxy /api straight to a `vercel dev` instance that
    // does nothing but serve api/* as serverless functions (see the
    // "dev:api" / "dev:functions" split in package.json). Keeps the app on
    // Vite's own reliable dev server instead of routing every request
    // through vercel dev's frontend proxy.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
