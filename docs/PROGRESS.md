# 开发进度

> 最后更新：2026-08-22
>
> 当前分支：`develop/astro-cms`
>
> 当前状态：五阶段代码、内容迁移与 ccfweb 视觉母版迁移完成，等待生产上线人工门禁

## 阶段总览

| 阶段 | 状态 | 完成证据 |
|---|---|---|
| 1. Astro/Decap 工程基座 | 已完成 | Astro 7 静态构建、严格内容 schema、Node 测试、Linux 非生产 CI |
| 2. 视觉骨架和移动端 | 已完成 | CCF 品牌设计、语义导航、首页、360/390/430 与桌面自动截图 |
| 3. 内容页面和搜索 | 已完成 | 活动列表/详情、关于、归档、搜索、SEO、分享和旧入口兼容 |
| 4. CMS、Vditor 和图片链路 | 代码完成/生产未验证 | 中文 Decap 配置、编辑工作流、Vditor 文本回退、仓库图片优化；真实 OAuth 后流程待验收 |
| 5. 旧内容迁移和上线准备 | 代码完成/上线未执行 | 26 条活动、203 条成员、12 条荣誉、46 张 WebP、迁移清单和运维手册 |

## 本轮实现

- 完成 `../ccfweb` 的视觉、排版、交互与响应式审计，形成可持续维护的迁移规范；
- 以“视觉等价、架构原生”方式迁移深色共振 Hero、编辑式 About、活动切片仪、深色成果档案、开源卡片与 Join 收束章节；
- Header、Footer、活动列表/详情、关于、档案、搜索与隐私页统一使用母版的字体、色彩、容器、章节标题和卡片语言；
- 保留现有 Astro 内容集合、CMS、路由、搜索、筛选、分享和二维码功能，不复制母版中的废弃原型或硬编码内容；
- 公开站点全部静态生成，前台不加载 Decap、Vditor 或 OAuth bundle；
- 内容由 `src/content/` 与 `src/data/` 驱动，并由 Zod/schema 和构建脚本双重校验；
- CMS 支持活动、公告、成员、荣誉、首页、分会、老师、链接和联系方式；物理删除关闭；
- 活动支持状态、分类筛选、归档、复制链接和二维码；搜索覆盖活动与成员；
- 旧内容保留来源，未确认成员简介统一标记 `profileConfirmed: false`，没有补写个人信息；
- `main`、现有 Pages 和外部服务均未改变。

## 验证记录

- `npm run check`：通过，0 error / 0 warning / 0 hint；
- `npm run test`：4 项通过（含届次年份排序回归测试）；
- `npm run validate:content`：通过；
- `npm run build && npm run validate:build`：根路径构建通过，共生成 34 个页面；
- `SITE_BASE=/preview-site/ npm run build && SITE_BASE=/preview-site/ npm run validate:build`：项目子路径通过；
- `npm run test:e2e`：10 项通过；Edge/Playwright 验证首页与全部主要内页、桌面、360/390/430、筛选、活动切片、搜索、成员展开、分享、二维码、后台登录前外壳及前后台 bundle 隔离；
- 视觉截图覆盖首页、活动列表、活动详情、关于、档案、搜索和后台，保存在被忽略的 `artifacts/visual-validation/`；
- `npm audit --omit=dev --registry=https://registry.npmjs.org`：YAML 可修复中危已升级消除；剩余 9 项 high、0 critical，均来自 Decap 间接依赖且无完整修复版本；
- 浏览器工具未暴露可用的交互入口，按仓库规范回退到本地 Edge + Playwright；截图保存在被忽略的 `artifacts/visual-validation/`。

## 已知且接受的风险

- Decap 3.15.1 的间接依赖存在 9 项已记录的高危审计告警；采用固定版本、后台独立 bundle、仅后台放宽 `unsafe-eval`、最小权限和 Git 回退作为补偿控制；
- `public/admin/config.yml` 中 OAuth 主机仍是示例值，生产登录在正式服务配置前不可用；
- 本地只能验证登录前后台和配置加载，Vditor 保存/重开、仓库图片上传和编辑工作流必须用真实维护者账号完成；
- 迁移内容来自旧站自动提取，仍需内容负责人逐项确认图片授权、姓名、届次、日期和对外联系方式。

## 上线前人工硬门禁

以下项目未验证，任何一项未通过都不得切换生产：

1. 配置限定正式仓库权限的 OAuth 服务并轮换/保管 Secret；
2. 两名启用 2FA 的维护者完成草稿、预览、审核、发布、冲突、归档和回滚演练；
3. 在真实后台验证 Vditor 中文输入、保存重开、文本回退和图片上传；
4. 内容负责人确认迁移清单、隐私、图片授权和当前联系方式；
5. 完成国内校园网、三家常用移动网络与真实手机验收；
6. 配置 `main` 分支保护、必需检查、Pages 权限和备份恢复演练；
7. 负责人签署 `RELEASE_READINESS.md` 后另行批准部署。

## 下一步

下一阶段按 [`.agent/plans/2026-08-22-interaction-content-polish.md`](../.agent/plans/2026-08-22-interaction-content-polish.md) 补齐 ccfweb 动效、内页留白、搜索面板、访客文案清理和首页后台可编辑能力；该计划已完成需求整理，尚未开始页面实现。

生产上线仍由负责人按 `MAINTAINER_GUIDE.md` 和 `RELEASE_READINESS.md` 执行人工验收。本分支可以提交或发起评审，但本轮不 push、不创建 PR、不部署。
