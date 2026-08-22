import { test, expect } from "@playwright/test";

test.skip(process.env.CMS_LOCAL !== "1", "requires a running Decap local backend");

test("CMS navigation, native Markdown editor, and preview work", async ({ page }) => {
  const runtimeErrors = [];
  const unpkgRequests = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("request", (request) => { if (request.url().includes("unpkg.com")) unpkgRequests.push(request.url()); });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/", { waitUntil: "networkidle" });
  const login = page.getByRole("button", { name: /登录/ });
  if (await login.isVisible()) await login.click();
  await expect(page.getByTestId("activities")).toContainText("02 活动中心｜活动内容", { timeout: 15_000 });
  await page.getByTestId("settings").click();
  await expect(page.getByText("03 关于分会｜指导老师", { exact: true })).toBeVisible();
  await expect(page.getByText("03 关于分会｜相关链接", { exact: true })).toBeVisible();

  await page.getByTestId("activities").click();
  await page.locator("a").filter({ hasText: "腾讯" }).first().click();
  await expect(page.getByText("正文", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[contenteditable="true"]').last()).toBeVisible();
  const preview = page.frameLocator("#preview-pane");
  await expect(preview.getByText("CCF@SCU · 内容预览", { exact: true })).toBeVisible();
  await expect(preview.locator(".cms-content-preview article.prose")).not.toBeEmpty();
  await page.screenshot({ path: "artifacts/visual-validation/cms-editor-preview-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[contenteditable="true"]').last()).toBeVisible();
  await expect(page.locator("#preview-pane")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: "artifacts/visual-validation/cms-editor-mobile.png", fullPage: true });

  expect(unpkgRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});
