import { access, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const dist = resolve("dist");
const expectedBase = process.env.SITE_BASE ?? "/";
const required = ["index.html", "activities/index.html", "about/index.html", "archive/index.html", "search/index.html", "admin/index.html", "activities.html", "team-history.html", "team-building.html", "404.html", "robots.txt", "sitemap.xml"];
const errors = [];

for (const path of required) {
  try { await access(join(dist, path)); } catch { errors.push(`Missing build output: ${path}`); }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}

for (const file of await walk(dist)) {
  if (!file.endsWith(".html")) continue;
  const source = await readFile(file, "utf8");
  const internalPaths = [...source.matchAll(/(?:href|src)=["'](\/(?!\/)[^"']*)/g)].map((match) => match[1]);
  const rootHardcoded = expectedBase !== "/" && internalPaths.some((path) => !path.startsWith(expectedBase));
  if (/replace-with-oauth-host|website-cms-prototype(?:activities|admin)|ccf-scu\.github\.io(?:activities|admin)/.test(source) || (rootHardcoded && !file.includes(`${join("admin", "index.html")}`))) {
    errors.push(`${file}: contains a placeholder or root-hardcoded public URL`);
  }
  if (!file.includes(`${join("admin", "index.html")}`) && /decap-cms|vditor/i.test(source)) {
    errors.push(`${file}: public page references CMS/editor assets`);
  }
}

if (expectedBase !== "/") {
  for (const file of await walk(dist)) {
    if (!file.endsWith(".css")) continue;
    const source = await readFile(file, "utf8");
    const assetPaths = [...source.matchAll(/url\(["']?(\/(?!\/)[^)"']*)/g)].map((match) => match[1]);
    if (assetPaths.some((path) => !path.startsWith(expectedBase))) errors.push(`${file}: CSS contains a root-hardcoded asset URL`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Build outputs, base paths, and public/admin bundle isolation passed.");
