/* eslint-env node */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const repoName = "bd-shop"; // <-- jei repo pavadinimas kitoks, pakeisk čia

export default defineConfig(() => ({
  plugins: [react()],
  // GitHub Pages: https://username.github.io/bd-shop/
  // Netlify: https://site.netlify.app/
  base: process.env.DEPLOY_TARGET === "gh" ? `/${repoName}/` : "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
