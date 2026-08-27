import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import YAML from "yaml";

const config = YAML.parse(await readFile(new URL("../public/admin/config.yml", import.meta.url), "utf8"));
const workerConfig = JSON.parse(await readFile(new URL("../infrastructure/oauth-worker/wrangler.jsonc", import.meta.url), "utf8"));
const settings = config.collections.find((collection) => collection.name === "settings");
const setting = (name) => settings.files.find((entry) => entry.name === name);
const field = (fields, name) => fields.find((entry) => entry.name === name);

test("CMS and OAuth Worker use the same canonical GitHub repository", () => {
  assert.equal(config.backend.repo, "ccf-scu/ccfscu-website-source");
  assert.equal(workerConfig.vars.GITHUB_REPOSITORY, config.backend.repo);
});

test("homepage activity copy and selections stay together", () => {
  const homepage = setting("homepage");
  const featured = setting("homepageFeatured");
  assert.ok(homepage);
  assert.ok(featured);
  assert.equal(homepage.file, "src/data/homepage.yml");
  assert.equal(featured.file, "src/data/homepage-featured.yml");
  assert.equal(field(homepage.fields, "featuredContent"), undefined);
  assert.equal(field(featured.fields, "activities"), undefined);
  const directions = field(field(homepage.fields, "activities").fields, "directions");
  assert.ok(directions.fields.some((entry) => entry.name === "activity" && entry.widget === "relation"));
});

test("fixed homepage copy lists cannot add, remove, or reorder items", () => {
  const homepageFields = setting("homepage").fields;
  const fixedLists = [
    field(field(homepageFields, "introduction").fields, "principles"),
    field(field(homepageFields, "activities").fields, "directions"),
    field(field(homepageFields, "recruitment").fields, "routes"),
  ];
  for (const list of fixedLists) {
    assert.equal(list.min, list.max);
    assert.equal(list.allow_add, false);
    assert.equal(list.allow_remove, false);
    assert.equal(list.allow_reorder, false);
  }
});

test("homepage timeline can grow and uses list order", () => {
  const timeline = field(field(setting("homepage").fields, "achievements").fields, "timeline");
  assert.equal(timeline.min, 1);
  assert.equal(timeline.max, undefined);
  assert.equal(timeline.allow_add, true);
  assert.equal(timeline.allow_remove, true);
  assert.equal(timeline.allow_reorder, true);
});

test("homepage honors can grow and numeric-order lists cannot also drag", () => {
  const honors = field(setting("homepageFeatured").fields, "honors");
  assert.equal(honors.min, 1);
  assert.equal(honors.max, undefined);
  assert.equal(honors.allow_add, true);
  assert.equal(honors.allow_remove, true);

  for (const name of ["teachers", "links", "footerLinks", "contact"]) {
    const list = setting(name).fields[0];
    assert.equal(list.allow_reorder, false, `${name} must use numeric order only`);
    assert.ok(list.fields.some((entry) => entry.name === "order"));
  }
});
