import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL ?? "https://www.ccfscu.com",
  base: process.env.SITE_BASE ?? "/",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  vite: {
    build: {
      sourcemap: false,
    },
  },
});
