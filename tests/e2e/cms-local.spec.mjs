import { test, expect } from "@playwright/test";

test.skip(process.env.CMS_LOCAL !== "1", "requires a running Decap local backend");

test("page-oriented CMS shell, image center, and native editor work", async ({ page }) => {
  const runtimeErrors = [];
  const unpkgRequests = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("request", (request) => { if (request.url().includes("unpkg.com")) unpkgRequests.push(request.url()); });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/#/manage/home", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "首页管理", exact: true })).toBeVisible();
  const primaryNavigation = page.getByRole("navigation");
  await expect(primaryNavigation.getByRole("link")).toHaveCount(6);
  await expect(page.getByRole("link", { name: /首页管理/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "四个活动位" })).toBeVisible();
  await expect(page.locator(".admin-slot-grid").first().getByRole("link")).toHaveCount(4);
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(page.locator(".cms-image-center-button")).toHaveCount(0);

  await page.goto("/admin/#/manage/activities");
  await expect(page.getByRole("heading", { name: "活动页面", exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: "活动列表" })).toBeVisible();
  await expect(page.getByRole("link", { name: "新建活动" })).toBeVisible();

  await page.goto("/admin/#/manage/images");
  await expect(page.getByRole("heading", { name: "图片中心", exact: true })).toBeVisible();
  await expect(page.getByText("47 张已发布图片")).toBeVisible();
  await expect(page.getByRole("button", { name: /图床连接设置/ })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".image-grid button")).toHaveCount(47);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: "artifacts/visual-validation/cms-image-center-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: /菜单/ })).toBeVisible();
  await page.getByRole("button", { name: /菜单/ }).click();
  await expect(page.getByRole("dialog", { name: "后台主导航" })).toBeVisible();
  await expect(page.getByRole("button", { name: "关闭导航", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /菜单/ })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: "artifacts/visual-validation/cms-image-center-mobile.png", fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/#/collections/activities");
  const login = page.getByRole("button", { name: /登录/ });
  if (await login.isVisible()) await login.click();
  await expect(page.getByRole("heading", { name: "编辑内容 · 活动页面" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: "返回活动页面" })).toBeVisible();
  await expect(page.getByTestId("activities")).toBeHidden();
  await page.locator("a").filter({ hasText: "腾讯" }).first().click();
  await expect(page.getByText("正文", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[contenteditable="true"]').last()).toBeVisible();
  await expect(page.getByRole("button", { name: "从图片中心选择" })).toBeVisible();
  const preview = page.frameLocator("#preview-pane");
  await expect(preview.getByText("CCF@SCU · 内容预览", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/visual-validation/cms-editor-shell-desktop.png", fullPage: true });

  expect(unpkgRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});
