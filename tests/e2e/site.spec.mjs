import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const screenshots = "artifacts/visual-validation";
const warmLazyImages = async (page) => page.evaluate(async () => {
  document.querySelectorAll("img[loading='lazy']").forEach((image) => { image.loading = "eager"; });
  for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  await Promise.all([...document.images].map((image) => image.complete
    ? image.decode?.().catch(() => undefined)
    : new Promise((resolve) => image.addEventListener("load", resolve, { once: true }))));
  window.scrollTo(0, 0);
});

test.beforeAll(async () => mkdir(screenshots, { recursive: true }));

test("desktop home has identity, content, no overflow, and no CMS bundle", async ({ page }) => {
  const adminRequests = [];
  page.on("request", (request) => { if (/decap|vditor/i.test(request.url())) adminRequests.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page).toHaveTitle(/CCF 四川大学学生分会/);
  await expect(page.getByRole("heading", { name: /让一次好奇.*共振/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /让成长有路径/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  expect(adminRequests).toEqual([]);
  await warmLazyImages(page);
  await expect(page.locator(".possibility-sheet img").first()).toHaveJSProperty("complete", true);
  await page.screenshot({ path: `${screenshots}/home-desktop.png`, fullPage: true });
});

test("home activity instrument changes the visible layer", async ({ page }) => {
  await page.goto("/");
  const competition = page.locator("[data-layer-tab='competition']");
  await competition.click();
  await expect(competition).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-activity-lab]")).toHaveAttribute("data-active", "competition");
  await expect(page.locator("[data-layer-panel='competition']")).toHaveClass(/active/);
});

test("activity filter and sharing interactions update observable state", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto("/activities/");
  await page.getByRole("button", { name: "学术引领" }).click();
  await expect(page.getByRole("button", { name: "学术引领" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator("[data-category]:visible").count()).toBeGreaterThan(0);
  await page.locator("[data-category]:visible h3 a").first().click();
  await expect(page.getByRole("heading", { name: "分享活动" })).toBeVisible();
  await page.getByRole("button", { name: "生成二维码" }).click();
  expect(runtimeErrors).toEqual([]);
  await expect(page.locator("[data-qr-image]")).toHaveAttribute("src", /^data:image\/png/);
  await expect(page.locator("[data-share-status]")).toHaveText("二维码已生成");
});

test("search and member disclosure work", async ({ page }) => {
  await page.goto("/search/");
  await page.getByRole("searchbox").fill("腾讯");
  await expect(page.locator("[data-search-count]")).toContainText("1 条结果");
  await expect(page.locator("[data-search-results]")).toContainText("腾讯");
  await page.goto("/archive/");
  const member = page.locator("details.member-card").first();
  await member.locator("summary").click();
  await expect(member).toHaveAttribute("open", "");
});

test("public inner pages share the visual system without layout regressions", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [path, heading, screenshot] of [
    ["/activities/", "活动中心", "activities-desktop.png"],
    ["/about/", "关于分会", "about-desktop.png"],
    ["/archive/", "历史档案", "archive-desktop.png"],
    ["/search/", "全站搜索", "search-desktop.png"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      headingTop: document.querySelector("h1")?.getBoundingClientRect().top ?? 0,
    }));
    expect(layout.overflow).toBe(false);
    expect(layout.headingTop).toBeGreaterThan(80);
    await warmLazyImages(page);
    await page.screenshot({ path: `${screenshots}/${screenshot}`, fullPage: true });
  }
  await page.goto("/activities/");
  await page.locator(".activity-card h3 a").first().click();
  await expect(page.getByRole("heading", { name: "分享活动" })).toBeVisible();
  await warmLazyImages(page);
  await page.screenshot({ path: `${screenshots}/activity-detail-desktop.png`, fullPage: true });
  expect(runtimeErrors).toEqual([]);
});

test("archive remains readable on a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/archive/");
  await expect(page.getByRole("heading", { name: "历史档案", level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await warmLazyImages(page);
  await page.screenshot({ path: `${screenshots}/archive-390.png`, fullPage: true });
});

for (const width of [360, 390, 430]) {
  test(`mobile home at ${width}px has usable menu and no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "打开导航" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await toggle.click();
    await warmLazyImages(page);
    await page.screenshot({ path: `${screenshots}/home-${width}.png`, fullPage: true });
  });
}

test("admin page is isolated and renders its application shell", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/");
  await expect(page).toHaveTitle(/内容后台/);
  await expect(page.getByRole("button", { name: "使用 GitHub 登录" })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("body")).not.toContainText("Error loading the CMS configuration");
  await page.screenshot({ path: `${screenshots}/admin-desktop.png`, fullPage: true });
});
