import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import YAML from "yaml";

const contentRoot = resolve("src/content");
const dataRoot = resolve("src/data");
const errors = [];
const httpLinkFiles = new Set([
  join(dataRoot, "links.yml"),
  join(dataRoot, "repository.yml"),
  join(dataRoot, "footer-links.yml"),
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}

for (const file of [...await walk(contentRoot), ...await walk(dataRoot)]) {
  const source = await readFile(file, "utf8");
  if (/\b(?:javascript:|data:text\/html)/i.test(source) || (!httpLinkFiles.has(file) && /\bhttp:/i.test(source))) {
    errors.push(`${file}: contains a disallowed URL protocol`);
  }
  if (extname(file) === ".md" && !source.startsWith("---\n")) errors.push(`${file}: missing YAML frontmatter`);
}

const organization = YAML.parse(await readFile(join(dataRoot, "organization.yml"), "utf8"));
const memberFiles = (await walk(join(contentRoot, "members"))).filter((file) => extname(file) === ".md");
const memberCohorts = new Set();
for (const file of memberFiles) {
  const source = await readFile(file, "utf8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (frontmatter) memberCohorts.add(YAML.parse(frontmatter).cohort);
}
if (!memberCohorts.has(organization.currentCohort)) {
  errors.push(`src/data/organization.yml: currentCohort must exactly match at least one member cohort (${organization.currentCohort})`);
}

const uploadRoot = resolve("public/uploads");
try {
  for (const file of await walk(uploadRoot)) {
    const size = (await stat(file)).size;
    if (size > 2 * 1024 * 1024) errors.push(`${file}: exceeds the 2 MiB repository image limit`);
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Content safety and asset-size checks passed.");
