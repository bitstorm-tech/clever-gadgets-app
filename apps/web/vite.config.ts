import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const apiTarget = process.env.CLEVER_GADGETS_API_URL ?? "http://localhost:3100";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
    },
  },
});
