import { defineConfig } from "astro/config";

const repository = process.env.GITHUB_REPOSITORY ?? "ccf-scu/ccf-scu.github.io";
const isProjectPages = !repository.endsWith(".github.io");
const repositoryName = repository.split("/").at(-1);

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL ?? "https://ccf-scu.github.io",
  base: process.env.SITE_BASE ?? (isProjectPages ? `/${repositoryName}` : "/"),
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
