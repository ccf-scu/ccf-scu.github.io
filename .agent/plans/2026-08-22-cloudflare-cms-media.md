# Cloudflare Pages 正式域名与 CMS 媒体库修复

## 目的与用户可见结果
生产站以 `https://www.ccfscu.com` 和 Cloudflare Pages 为准；后台右上角入口始终返回当前域名首页并显示“返回前台”；媒体库在未选择文件时不再因读取 `selectedFile.path` 崩溃。

## 范围与明确不做
更新 Astro/CMS/OAuth/部署文档和 Decap 构建补丁；停用仓库内 GitHub Pages 发布工作流。不迁移仓库、不更换 OAuth App，不提交 Secret。

## 当前事实与相关文件
- `public/admin/config.yml` 的 `site_url/display_url` 仍写死 `https://ccf-scu.github.io`。
- `astro.config.mjs`、robots、sitemap、OAuth Worker 和部署文档仍以 GitHub Pages 为生产。
- 当前 `decap-cms-app 3.15.1` 解析到 `decap-cms-core 3.17.1`；其官方源码在 `hasSelection=false` 时仍读取 `selectedFile.path/name/draft`。

## 验收标准
- 后台按钮文案为“返回前台”，href 使用当前页面 origin 的 `/`，不写死域名。
- 媒体库空选择能正常打开、上传和关闭，不产生 `selectedFile.path` 错误。
- 安装补丁有精确版本/目标检查，Cloudflare `npm ci` 后自动应用，异常时构建失败而非静默跳过。
- 默认站点、CMS、SEO、OAuth 白名单和文档统一为 `www.ccfscu.com`；GitHub Pages 工作流停用。
- 自动检查、登录后浏览器验证、Cloudflare Pages 发布和线上冒烟完成。

## 分阶段步骤
1. 加入动态前台入口和 Decap 媒体库补丁。
2. 迁移域名、OAuth 与部署配置，更新测试和文档。
3. 完成安装、构建、媒体库与响应式浏览器验证。
4. 提交推送，确认 Cloudflare Pages 与 Worker，线上冒烟。

## 进度（带时间）
- 2026-08-22：完成根因定位并开始实现。
- 2026-08-23：完成动态前台入口、媒体库补丁、Cloudflare Pages/域名/OAuth 配置迁移与本地验证，进入发布。

## 发现与证据
- 线上 bundle 的 `MediaLibraryTop` 无条件访问 `selectedFile.path`，而 `selectedFile` 初始为 `undefined`。
- npm 最新 `decap-cms-app` 为 3.15.1，当前间接安装的 `decap-cms-core` 为 3.17.1；官方 main 源码仍存在相同行为。

## 决策记录
- 使用受版本约束的 postinstall 小补丁，等待上游发布正式修复后删除；不换用非官方 CMS fork。
- `display_url` 使用 `/`，再由后台脚本将文案改为“返回前台”，使自定义域名迁移无需改按钮。
- Cloudflare Pages 继续从 `main` 自动构建，GitHub Actions 只保留非生产校验。

## 验证命令与结果
- `npm ci --no-audit --no-fund`：通过，postinstall 在全新安装后自动应用媒体库补丁。
- `npm run validate`：通过；Astro 0 错误/警告/提示，Node 12 项、内容安全、34 页面构建与产物校验通过。
- `CMS_LOCAL=1 npm run test:e2e -- tests/e2e/cms-local.spec.mjs`：通过；确认动态“返回前台”、媒体库空选择打开/关闭、Markdown 编辑与预览。
- `npm run test:e2e`：13 项通过，1 项本地 CMS 专项按预期跳过。
- 线上 OAuth Worker：`www.ccfscu.com` 返回 302，旧 `ccf-scu.github.io` 返回 403，`/health` 为 configured。
- Wrangler 4.125.0 dry-run 通过；CLI 实际 deploy 因本环境无 API Token 被拒绝，但线上配置已是目标状态，无需重复发布。

## 风险与回滚
- Decap Core 升级会触发补丁版本保护并要求人工复核；可回滚本提交恢复旧行为。
- OAuth Worker 的生产变量必须随域名同步部署，否则新域名登录会被 403 拒绝。

## 未完成项与下一步
- 提交到 `main`，等待 Cloudflare Pages 构建并执行线上冒烟。
