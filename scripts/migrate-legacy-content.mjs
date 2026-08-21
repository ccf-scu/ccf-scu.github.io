import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

const root = resolve(".");
const activitiesHtml = await readFile(join(root, "activities.html"), "utf8");
const membersHtml = await readFile(join(root, "team-history.html"), "utf8");
const activitiesDir = join(root, "src/content/activities");
const membersDir = join(root, "src/content/members");
const honorsDir = join(root, "src/content/honors");
const migrationDir = join(root, "migrations");
await Promise.all([activitiesDir, membersDir, honorsDir, migrationDir].map((directory) => mkdir(directory, { recursive: true })));

const entityMap = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
const text = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => entityMap[entity] ?? entity).replace(/\s+/g, " ").trim();
const yaml = (value) => JSON.stringify(value);
const categoryMap = { academic: "academic", competition: "competition", tutoring: "tutoring", career: "career", org: "organization", organization: "organization" };
const manifest = { generatedAt: new Date().toISOString(), source: { activities: "activities.html", members: "team-history.html", honors: "images/honors" }, activities: [], members: [], honors: [], reviewRequired: [] };

const itemMatches = [...activitiesHtml.matchAll(/<div class="tl-item"[^>]*data-category="([^"]+)"[^>]*>/g)];
for (let index = 0; index < itemMatches.length; index += 1) {
  const match = itemMatches[index];
  const start = match.index;
  const end = itemMatches[index + 1]?.index ?? activitiesHtml.indexOf("</section>", start);
  const chunk = activitiesHtml.slice(start, end);
  const years = [...activitiesHtml.slice(0, start).matchAll(/data-year="(\d{4})"/g)];
  const year = years.at(-1)?.[1];
  const dateText = text(chunk.match(/class="tl-date"[^>]*>([\s\S]*?)<\/span\s*>/)?.[1]);
  const title = text(chunk.match(/class="tl-title"[^>]*>([\s\S]*?)<\/span\s*>/)?.[1]);
  const summary = text(chunk.match(/class="tl-summary"[^>]*>([\s\S]*?)<\/span\s*>/)?.[1]) || "活动资料由旧站迁移，详情待分会维护者补充。";
  if (!year || !title) continue;
  const dateParts = dateText.match(/(\d{2})-(\d{2})/);
  const month = dateParts?.[1] ?? "01";
  const day = dateParts?.[2] ?? "01";
  const date = `${year}-${month}-${day}`;
  const imageSource = chunk.match(/<img[^>]+src="([^"]+)"/)?.[1];
  const hasRealImage = imageSource && !imageSource.includes("placeholder") && !imageSource.startsWith("http");
  const outputImage = hasRealImage ? `/uploads/legacy/activities/${date}-${String(index + 1).padStart(2, "0")}.webp` : "/uploads/featured/ccf-campus-talk.webp";
  const id = `${date}-activity-${String(index + 1).padStart(2, "0")}`;
  const entry = `---\ntitle: ${yaml(title)}\nsummary: ${yaml(summary)}\ncover: ${yaml(outputImage)}\ncoverAlt: ${yaml(`${title}活动现场或宣传资料`)}\ncategory: ${categoryMap[match[1]] ?? "organization"}\nstartAt: ${date}T00:00:00+08:00\nendAt: ${date}T23:59:59+08:00\nfeatured: false\nshowOnHomepage: true\narchived: false\nsourceUrl: /activities.html\n---\n\n> 本条目由旧站公开活动时间线迁移。原页面未提供完整正文，正式发布前请补充活动介绍并复核日期、分类和图片授权。\n`;
  await writeFile(join(activitiesDir, `${id}.md`), entry, "utf8");
  manifest.activities.push({ id, title, date, category: categoryMap[match[1]] ?? "organization", sourceImage: imageSource ?? null, outputImage, needsReview: true });
}

const sections = membersHtml.split(/<div class="team-section">/).slice(1);
for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
  const section = sections[sectionIndex];
  const cohort = text(section.match(/<h3>([\s\S]*?)<\/h3>/)?.[1]);
  if (!cohort) continue;
  const cards = section.split(/<div class="member-card">/).slice(1);
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const name = text(card.match(/class="member-name"[^>]*>([\s\S]*?)<\/div>/)?.[1]);
    const role = text(card.match(/class="member-role"[^>]*>([\s\S]*?)<\/div>/)?.[1]);
    if (!name || !role) continue;
    const photoSource = card.match(/<img[^>]+src="([^"]+)"/)?.[1];
    const cohortNumber = cohort.match(/第([^届]+)届/)?.[1] ?? String(sectionIndex + 1);
    const id = `cohort-${String(sectionIndex + 1).padStart(2, "0")}-member-${String(index + 1).padStart(3, "0")}`;
    const outputPhoto = photoSource ? `/uploads/legacy/members/${id}.webp` : null;
    const entry = `---\nname: ${yaml(name)}\nrole: ${yaml(role)}\ncohort: ${yaml(cohort)}\norder: ${index + 1}\n${outputPhoto ? `photo: ${yaml(outputPhoto)}\nphotoAlt: ${yaml(`${name}的公开照片`)}\n` : ""}visible: true\nprofileConfirmed: false\n---\n`;
    await writeFile(join(membersDir, `${id}.md`), entry, "utf8");
    manifest.members.push({ id, name, role, cohort, cohortNumber, sourceImage: photoSource ?? null, outputImage: outputPhoto, profileConfirmed: false });
  }
}

const honorFiles = (await readdir(join(root, "images/honors"))).filter((file) => /\.(?:jpe?g|png|webp)$/i.test(file)).sort();
for (let index = 0; index < honorFiles.length; index += 1) {
  const file = honorFiles[index];
  const title = basename(file, extname(file)).replace(/^\d{4}-/, "");
  const year = Number(file.match(/^(\d{4})/)?.[1]);
  if (!year) continue;
  const id = `${year}-honor-${String(index + 1).padStart(2, "0")}`;
  const outputImage = `/uploads/legacy/honors/${id}.webp`;
  await writeFile(join(honorsDir, `${id}.md`), `---\ntitle: ${yaml(title)}\nyear: ${year}\nimage: ${yaml(outputImage)}\nimageAlt: ${yaml(`${year}年${title}荣誉资料`)}\nfeatured: ${/CCF优秀学生分会/.test(title)}\nvisible: true\n---\n\n> 本资料由旧站荣誉图片目录迁移，正式上线前请核对奖项名称与公开授权。\n`, "utf8");
  manifest.honors.push({ id, title, year, sourceImage: `images/honors/${file}`, outputImage, needsReview: true });
}

manifest.reviewRequired = ["活动原始时间线只含月日，起止时间统一按当天占位", "活动正文与图片替代文本需人工复核", "成员姓名和职务来自旧站，个人简介保持未确认", "荣誉名称和图片授权需负责人复核"];
await writeFile(join(migrationDir, "legacy-content-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Migrated ${manifest.activities.length} activities, ${manifest.members.length} member records, and ${manifest.honors.length} honors.`);
