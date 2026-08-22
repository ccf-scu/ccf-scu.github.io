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
  document.querySelector("astro-dev-toolbar")?.remove();
  window.scrollTo(0, 0);
});
const captureSection = async (page, selector, path) => {
  const target = page.locator(selector);
  await target.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 110));
  await page.waitForTimeout(180);
  await expect(target).toBeInViewport({ ratio: 0.45 });
  await page.screenshot({ path });
};

test.beforeAll(async () => mkdir(screenshots, { recursive: true }));

test("desktop home has identity, content, no overflow, and no CMS bundle", async ({ page }) => {
  const adminRequests = [];
  page.on("request", (request) => { if (/decap|vditor/i.test(request.url())) adminRequests.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page).toHaveTitle(/CCF 四川大学学生分会/);
  await expect(page.getByRole("heading", { name: /让一次好奇.*共振/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /让成长有路径/ })).toBeVisible();
  await expect(page.getByText("CN", { exact: true })).toHaveCount(0);
  await expect(page.locator("[data-resonance-canvas]")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  expect(adminRequests).toEqual([]);
  await warmLazyImages(page);
  await expect(page.locator(".possibility-sheet img").first()).toHaveJSProperty("complete", true);
  await page.screenshot({ path: `${screenshots}/home-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await captureSection(page, "[data-activity-lab]", `${screenshots}/home-activity-desktop.png`);
  await captureSection(page, "[data-repo-card]", `${screenshots}/home-open-source-desktop.png`);
});

test("home activity instrument changes the visible layer", async ({ page }) => {
  await page.goto("/");
  await page.locator(".lab-stage").hover({ position: { x: 500, y: 200 } });
  await page.mouse.move(900, 500);
  await expect(page.locator("[data-activity-lab]")).toHaveAttribute("data-active", "academic");
  const competition = page.locator("[data-layer-tab='competition']");
  await competition.click();
  await expect(competition).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-activity-lab]")).toHaveAttribute("data-active", "competition");
  await expect(page.locator("[data-layer-panel='competition']")).toHaveClass(/active/);
  await competition.press("ArrowRight");
  await expect(page.locator("[data-layer-tab='tutoring']")).toHaveAttribute("aria-selected", "true");
  await page.waitForTimeout(700);
  const careerCard = page.locator("[data-layer-card='career']");
  const clickablePoint = await careerCard.evaluate((card) => {
    const bounds = card.getBoundingClientRect();
    for (let x = bounds.right - 4; x > bounds.left; x -= 8) {
      for (let y = bounds.top + 8; y < bounds.bottom; y += 12) {
        if (document.elementFromPoint(x, y)?.closest("[data-layer-card]") === card) return { x, y };
      }
    }
    return null;
  });
  expect(clickablePoint).not.toBeNull();
  await page.mouse.click(clickablePoint.x, clickablePoint.y);
  await expect(page.locator("[data-layer-tab='career']")).toHaveAttribute("aria-selected", "true");
  await expect(careerCard).toHaveAttribute("aria-pressed", "true");
});

test("header search opens a full-screen dialog, searches locally, and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const trigger = page.locator(".desktop-nav [data-search-open]");
  await trigger.click();
  const dialog = page.locator("[data-search-dialog]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("searchbox")).toBeFocused();
  await dialog.getByRole("searchbox").fill("腾讯");
  await expect(dialog.locator("[data-search-count]")).toContainText("1 条结果");
  await expect(dialog.locator("[data-search-results]")).toContainText("腾讯");
  await page.screenshot({ path: `${screenshots}/search-dialog-desktop.png` });
  await dialog.click({ position: { x: 8, y: 8 } });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("activity filter and sharing interactions update observable state", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto("/activities/");
  const firstMeta = page.locator(".activity-meta").first();
  const metaLayout = await firstMeta.evaluate((element) => {
    const items = [...element.children];
    return {
      alignItems: getComputedStyle(element).alignItems,
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      bottoms: items.map((item) => Math.round(item.getBoundingClientRect().bottom)),
    };
  });
  expect(metaLayout.alignItems).toBe("flex-end");
  expect(metaLayout.fontSize).toBeGreaterThan(11);
  expect(Math.max(...metaLayout.bottoms) - Math.min(...metaLayout.bottoms)).toBeLessThanOrEqual(1);
  await expect(firstMeta.locator("time")).toHaveText(/^\d{4}年\d{1,2}月\d{1,2}日$/);
  await page.getByRole("button", { name: "学术引领" }).click();
  await expect(page.getByRole("button", { name: "学术引领" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator("[data-category]:visible").count()).toBeGreaterThan(0);
  await page.locator("[data-category]:visible h3 a").first().click();
  await expect(page.getByRole("heading", { name: "分享活动" })).toBeVisible();
  const activityTime = page.locator(".prose > p").filter({ hasText: "活动时间：" });
  await expect(activityTime).toHaveText(/活动时间：\s*\d{4}年\d{1,2}月\d{1,2}日$/);
  await page.getByRole("button", { name: "生成二维码" }).click();
  expect(runtimeErrors).toEqual([]);
  await expect(page.locator("[data-qr-image]")).toHaveAttribute("src", /^data:image\/png/);
  await expect(page.locator("[data-share-status]")).toHaveText("二维码已生成");
});

test("activity card metadata stays readable and bottom-aligned on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/activities/");
  const card = page.locator(".activity-card").first();
  await card.scrollIntoViewIfNeeded();
  const layout = await card.locator(".activity-meta").evaluate((element) => {
    const items = [...element.children];
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      bottoms: items.map((item) => Math.round(item.getBoundingClientRect().bottom)),
    };
  });
  expect(layout.overflow).toBe(false);
  expect(layout.fontSize).toBeGreaterThan(11);
  expect(Math.max(...layout.bottoms) - Math.min(...layout.bottoms)).toBeLessThanOrEqual(1);
  await expect(card.locator(".activity-meta time")).toHaveText(/^\d{4}年\d{1,2}月\d{1,2}日$/);
  await page.screenshot({ path: `${screenshots}/activities-390.png` });
});

test("search and member dialog work", async ({ page }) => {
  await page.goto("/search/");
  const searchPage = page.locator(".search-page");
  await searchPage.getByRole("searchbox").fill("腾讯");
  await expect(searchPage.locator("[data-search-count]")).toContainText("1 条结果");
  await expect(searchPage.locator("[data-search-results]")).toContainText("腾讯");
  await page.goto("/archive/");
  const member = page.locator("button.member-card").first();
  await member.click();
  const dialog = page.locator("[data-member-dialog][open]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: /关闭.+的介绍/ })).toBeFocused();
  await page.screenshot({ path: `${screenshots}/member-dialog-desktop.png` });
  await dialog.getByRole("button", { name: /关闭.+的介绍/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(member).toBeFocused();
});

test("about page exposes CMS-managed organization content", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/about/");
  await expect(page.getByRole("heading", { name: "第十五届（2025–2026） 执委" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "相关链接" })).toBeVisible();
  await expect(page.getByRole("link", { name: /中国计算机学会/ })).toHaveAttribute("href", "https://www.ccf.org.cn/");
  await expect(page.getByText("QQ 群 · 1033172661").first()).toBeVisible();
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
    const layout = await page.evaluate(() => {
      const container = document.querySelector(".page-container")?.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        headingTop: document.querySelector("h1")?.getBoundingClientRect().top ?? 0,
        container: container ? { left: container.left, right: container.right } : null,
      };
    });
    expect(layout.overflow).toBe(false);
    expect(layout.headingTop).toBeGreaterThan(80);
    expect(layout.container?.left).toBeGreaterThanOrEqual(31);
    expect(layout.container?.right).toBeLessThanOrEqual(1409);
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
    if (width === 360) {
      await page.setViewportSize({ width, height: 844 });
      await captureSection(page, "[data-activity-lab]", `${screenshots}/home-activity-360.png`);
      await captureSection(page, "[data-repo-card]", `${screenshots}/home-open-source-360.png`);
    }
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
