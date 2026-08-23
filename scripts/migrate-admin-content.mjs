import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const write = process.argv.includes("--write");
const roots = ["src/content/activities", "src/content/announcements", "src/content/honors"];
const report = [];

for (const root of roots) {
  for (const name of (await fs.readdir(root)).filter((file) => file.endsWith(".md")).sort()) {
    const file = path.join(root, name);
    const original = await fs.readFile(file, "utf8");
    let next = original;
    if (root.endsWith("activities")) {
      next = next.replace(/^featured:\s*(true|false)\s*$/m, "pinned: $1").replace(/^showOnHomepage:\s*(true|false)\s*\r?\n/m, "");
    } else {
      next = next.replace(/^featured:\s*(true|false)\s*\r?\n/m, "");
    }
    if (next !== original) {
      report.push({ file, changes: root.endsWith("activities") ? "featured→pinned, remove showOnHomepage" : "remove featured" });
      if (write) await fs.writeFile(file, next);
    }
  }
}

console.log(JSON.stringify({ mode: write ? "write" : "dry-run", files: report.length, report }, null, 2));
