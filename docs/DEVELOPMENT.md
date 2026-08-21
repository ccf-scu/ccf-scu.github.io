# 本地开发

## 环境和安装

- Node.js 24；npm 使用已提交的 `package-lock.json`；
- 首次安装运行 `npm ci --no-audit --no-fund`；
- `.env.example` 只包含公开构建参数，OAuth Secret 永远不进入本仓库。

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动本地站点 |
| `npm run check` | Astro/TypeScript 检查 |
| `npm run test` | 纯函数与内容规则测试 |
| `npm run validate:content` | 内容、图片和外链检查 |
| `npm run build` | 生成 `dist/` 静态站 |
| `npm run validate:build` | 页面、链接、base path 与 bundle 隔离检查 |
| `npm run test:e2e` | 使用本机 Edge 执行浏览器验收 |
| `npm run validate` | 除 E2E 外的完整自动检查 |

项目子路径检查（PowerShell）：

```powershell
$env:SITE_BASE='/preview-site/'; npm run build; npm run validate:build; Remove-Item Env:SITE_BASE
```

## 本地 CMS

`npx decap-server` 可用于文件代理调试，但是否绕过登录取决于浏览器来源和 Decap 行为。生产路径必须验证 GitHub OAuth；不要把本地代理结果当作生产授权通过。后台入口为 `/admin/`，OAuth 示例主机在生产评审前必须替换。

## 工程约定

- 可编辑内容放在 `src/content/` 或 `src/data/`；字段变更同步 schema、CMS、迁移与文档；
- 内部链接使用 `withBase()`，确保根路径和项目子路径均可构建；
- 前台不得导入 CMS 编辑器依赖；后台安全策略单独配置；
- 构建产物、截图、trace、日志和本地 Secret 不提交；
- 依赖固定精确版本；Decap 升级必须单独审计和隔离验证。

## 分支和提交

从 `develop/astro-cms` 创建 `feature/*`、`fix/*` 或 `docs/*` 分支。每次提交前运行相称的检查、浏览器验证、`git diff --check`，同步 `docs/PROGRESS.md`，且不得修改生产 `main` 或启用部署。
