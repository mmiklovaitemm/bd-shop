/* eslint-env node */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const repoName = "bd-shop";

export default defineConfig(() => ({
  plugins: [react()],
  base: process.env.DEPLOY_TARGET === "gh" ? `/${repoName}/` : "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/__tests__/setup.js",
  },
}));
