import { test, expect } from "@playwright/test";

test.skip(process.env.CMS_LOCAL !== "1", "requires a running Decap local backend");
test.setTimeout(90_000);

test("page-oriented CMS shell, image center, and native editor work", async ({ page }) => {
  const runtimeErrors = [];
  const unpkgRequests = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("request", (request) => { if (request.url().includes("unpkg.com")) unpkgRequests.push(request.url()); });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/#/manage/home", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: /登录/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "首页管理", exact: true })).toBeHidden();
  await page.getByRole("button", { name: /登录/ }).click();
  await expect(page.getByRole("heading", { name: "首页管理", exact: true })).toBeVisible();
  const primaryNavigation = page.getByRole("navigation");
  await expect(primaryNavigation.getByRole("link")).toHaveCount(6);
  await expect(page.getByRole("link", { name: /首页管理/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "首页文案与活动方向" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "首页展示编排" })).toBeVisible();
  await expect(page.locator(".admin-slot-grid").first().getByRole("link")).toHaveCount(4);
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(page.locator(".cms-image-center-button")).toHaveCount(0);

  await page.getByRole("link", { name: "编辑首页文案", exact: true }).click();
  await expect(page.getByText("四个方向固定；每个方向的文案和代表活动在这里一起维护。")).toBeVisible();
  await expect(page.getByText("可新增、删除和拖动；列表顺序就是首页时间轴顺序。")).toBeVisible();
  await expect(page.getByText("首页展示编排", { exact: true })).toHaveCount(0);
  await page.locator('a[href="#/collections/settings"]').click();
  await expect(page).toHaveURL(/#\/manage\/home$/);
  await expect(page.getByRole("heading", { name: "首页管理", exact: true })).toBeVisible();

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
  await page.goto("/admin/#/collections/members");
  await expect(page.getByRole("table", { name: "成员记录" })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(".admin-sidebar")).toBeVisible();
  await expect(page.getByRole("link", { name: "← 返回关于与档案" })).toBeVisible();
  const memberEntries = page.getByRole("table", { name: "成员记录" }).locator('a[href^="#/collections/members/entries/"]');
  expect(await memberEntries.count()).toBeGreaterThan(0);
  await memberEntries.first().click();
  await expect(page).toHaveURL(/#\/collections\/members\/entries\//);
  await expect(page.locator(".admin-sidebar")).toBeHidden();
  await page.locator('a[href="#/collections/members"]').click();
  await expect(page).toHaveURL(/#\/collections\/members$/);
  await expect(page.getByRole("table", { name: "成员记录" })).toBeVisible();

  await page.goto("/admin/#/collections/honors");
  await expect(page.getByRole("table", { name: "荣誉记录" })).toBeVisible();
  await expect(page.locator(".admin-sidebar")).toBeVisible();
  const honorEntries = page.getByRole("table", { name: "荣誉记录" }).locator('a[href^="#/collections/honors/entries/"]');
  expect(await honorEntries.count()).toBeGreaterThan(0);
  await honorEntries.first().click();
  await expect(page).toHaveURL(/#\/collections\/honors\/entries\//);
  await page.locator('a[href="#/collections/honors"]').click();
  await expect(page.getByRole("table", { name: "荣誉记录" })).toBeVisible();

  await page.goto("/admin/#/manage/workflow");
  await page.getByRole("link", { name: "打开待发布列表" }).click();
  await expect(page).toHaveURL(/#\/workflow$/);
  await expect(page.locator("#nc-root")).toBeVisible();
  await expect(page.locator(".admin-sidebar")).toBeVisible();
  await expect(page.getByRole("link", { name: /待发布/ })).toHaveAttribute("aria-current", "page");

  await page.goto("/admin/#/collections/activities/entries/2026-04-21-activity-11");
  await expect(page.getByText("正文", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[contenteditable="true"]').last()).toBeVisible();
  await expect(page.getByRole("button", { name: "从图片中心选择" })).toBeVisible();
  const preview = page.frameLocator("#preview-pane");
  await expect(preview.getByText("CCF@SCU · 内容预览", { exact: true })).toBeVisible();
  await expect(page.locator('button[title*="同步滚动"]')).toHaveCount(0);
  await expect(page.locator(".admin-sidebar")).toBeHidden();
  await expect(page.getByRole("button", { name: /菜单/ })).toBeHidden();
  const editorBounds = await page.locator("#nc-root").evaluate((element) => element.getBoundingClientRect());
  expect(editorBounds.left).toBe(0);
  expect(editorBounds.width).toBe(1440);
  const nativeToolbarTop = await page.locator('[class*="ToolbarContainer"]').first().evaluate((element) => element.getBoundingClientRect().top);
  expect(nativeToolbarTop).toBe(0);
  await page.screenshot({ path: "artifacts/visual-validation/cms-editor-shell-desktop.png", fullPage: true });
  await page.locator('a[href="#/collections/activities"]').click();
  await expect(page).toHaveURL(/#\/manage\/activities$/);
  await expect(page.getByRole("heading", { name: "活动页面", exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/#/collections/activities/entries/2026-04-21-activity-11");
  await expect(page.getByText("正文", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("#preview-pane")).toBeHidden();
  const mobileEditorBounds = await page.locator("#nc-root").evaluate((element) => element.getBoundingClientRect());
  expect(mobileEditorBounds.left).toBe(0);
  expect(mobileEditorBounds.width).toBe(390);
  await expect(page.getByRole("button", { name: /菜单/ })).toBeHidden();
  await expect(page.locator(".admin-sidebar")).toBeHidden();
  await page.screenshot({ path: "artifacts/visual-validation/cms-editor-shell-mobile.png", fullPage: true });

  expect(unpkgRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});
