# 开发进度

> 最后更新：2026-08-22
>
> 当前分支：`develop/astro-cms`
>
> 当前状态：全部验收完成并获负责人批准，正在执行生产全量上线

## 阶段总览

| 阶段 | 状态 | 完成证据 |
|---|---|---|
| 1. Astro/Decap 工程基座 | 已完成 | Astro 7 静态构建、严格内容 schema、Node 测试、Linux 非生产 CI |
| 2. 视觉骨架和移动端 | 已完成 | CCF 品牌设计、语义导航、首页、360/390/430 与桌面自动截图 |
| 3. 内容页面和搜索 | 已完成 | 活动列表/详情、关于、归档、搜索、SEO、分享和旧入口兼容 |
| 4. CMS、Vditor 和图片链路 | 代码完成/生产未验证 | 中文 Decap 配置、编辑工作流、Vditor 文本回退、仓库图片优化；真实 OAuth 后流程待验收 |
| 5. 旧内容迁移和上线准备 | 代码完成/上线未执行 | 26 条活动、203 条成员、12 条荣誉、46 张 WebP、迁移清单和运维手册 |

## 本轮实现

- 活动列表与详情时间按上海时区自然日格式化：当日开始并结束只显示一个日期，跨天活动才显示起止日期；
- 活动列表卡片的类别、日期与状态标签适度放大，并统一底部对齐；
- 首页活动切片改为通过下方类别按钮或叠放卡片点击选择，并保留键盘操作；移除指针移动选层，卡片底色不再写死蓝色；活动列表提示精简并放大；
- 首页成果叠卡按荣誉标题去重后选择最近记录，避免三张卡片均为“CCF优秀学生分会”，同时移除固定蓝色卡片；
- 全屏搜索不再因点击面板两侧关闭，继续支持关闭按钮与 Escape；成员卡片改为可关闭的模态介绍框，后台 Markdown 介绍支持段落和图片；
- 活动详情图片保持原始比例，正文列扩大，SHARE 侧栏进一步靠右；
- 补回 Hero Canvas 线状共振场、About 无限轨道、活动平滑切片、成果叠卡与仓库逐行入场；页面隐藏时暂停 Canvas，移动端降低网格密度，减少动态偏好下直接显示稳定内容；
- Header 删除 `CN`，搜索入口改为全屏可访问对话框；输入、结果计数、Escape 关闭和焦点恢复已验证，`/search/` 继续作为直接访问与无脚本兼容入口；
- 关于、活动、档案、搜索和活动详情改用 1240px 居中内容容器，详情正文与侧栏整体居中，360/390/430 无页面级横向溢出；
- 首页 Hero、分会介绍、三项原则、活动方向、成果时间轴、开源和招募文案全部进入 `homepage.yml` 并同步 Zod 与 Decap；
- 友情链接新增 `placement` 用途，支持后台添加多项并按 `repository` 稳定选择真实 GitHub 仓库，不再依赖显示名称；
- 放大 NOTICE 标签和正文，删除 Hero 操作提示、迁移核验与待补充等面向开发者的访客文案；页脚年份继续在每次静态构建时自动取得当前年份；
- 完成 `../ccfweb` 的视觉、排版、交互与响应式审计，形成可持续维护的迁移规范；
- 以“视觉等价、架构原生”方式迁移深色共振 Hero、编辑式 About、活动切片仪、深色成果档案、开源卡片与 Join 收束章节；
- Header、Footer、活动列表/详情、关于、档案、搜索与隐私页统一使用母版的字体、色彩、容器、章节标题和卡片语言；
- 保留现有 Astro 内容集合、CMS、路由、搜索、筛选、分享和二维码功能，不复制母版中的废弃原型或硬编码内容；
- 公开站点全部静态生成，前台不加载 Decap、Vditor 或 OAuth bundle；
- 内容由 `src/content/` 与 `src/data/` 驱动，并由 Zod/schema 和构建脚本双重校验；
- CMS 支持活动、公告、成员、荣誉、首页、分会、老师、链接和联系方式；物理删除关闭；
- 活动支持状态、分类筛选、归档、复制链接和二维码；搜索覆盖活动与成员；
- 旧内容保留来源，未确认成员简介统一标记 `profileConfirmed: false`，没有补写个人信息；
- `main` 和现有 GitHub Pages 均未改变；Cloudflare Worker `ccf-scu-cms-oauth` 已部署并启用生产 `workers.dev` 地址。
- 新增可审计的 Cloudflare OAuth Worker、生产 URL 与 ADR；2026-08-22 验证未配置凭据时 `/auth` 按设计返回 503，配置加密 Secret 后健康检查返回 `configured: true` 且 `/auth` 正确跳转 GitHub。

## 验证记录

- `npm run check`：通过，0 error / 0 warning / 0 hint；
- `npm run test`：5 项通过（含活动日期区间与届次年份排序回归测试）；
- `npm run validate:content`：通过；
- `npm run build && npm run validate:build`：根路径构建通过，共生成 34 个页面；
- `SITE_BASE=/preview-site/ npm run build && SITE_BASE=/preview-site/ npm run validate:build`：项目子路径通过；
- `npm run test:e2e`：覆盖首页与全部主要内页、桌面、360/390/430、筛选、活动切片、搜索、成员介绍框、分享、二维码、后台登录前外壳及前后台 bundle 隔离；
- 本轮 `npm run test:e2e` 扩展为 12 项并通过：新增全屏搜索、Escape/焦点恢复、活动键盘切换、活动卡片元信息移动端对齐、内页容器边界与分区视口截图；
- 本轮根路径与 `SITE_BASE=/preview-site/` 项目子路径均构建通过，各生成 34 个页面，`validate:build` 验证链接与前后台 bundle 隔离通过；
- 视觉截图覆盖首页、活动列表、活动详情、关于、档案、搜索和后台，保存在被忽略的 `artifacts/visual-validation/`；
- `npm audit --omit=dev --registry=https://registry.npmjs.org`：YAML 可修复中危已升级消除；剩余 9 项 high、0 critical，均来自 Decap 间接依赖且无完整修复版本；
- 浏览器工具未暴露可用的交互入口，按仓库规范回退到本地 Edge + Playwright；截图保存在被忽略的 `artifacts/visual-validation/`。

## 已知且接受的风险

- Decap 3.15.1 的间接依赖存在 9 项已记录的高危审计告警；采用固定版本、后台独立 bundle、仅后台放宽 `unsafe-eval`、最小权限和 Git 回退作为补偿控制；
- `public/admin/config.yml` 已指向生产 Worker；Cloudflare 已配置 `GITHUB_OAUTH_ID` 与 `GITHUB_OAUTH_SECRET`，远程健康检查返回 `configured: true`，`/auth` 正确跳转 GitHub；完整授权回调需在新站后台发布到生产域名后由真实维护者验收；
- 本地只能验证登录前后台和配置加载，Vditor 保存/重开、仓库图片上传和编辑工作流必须用真实维护者账号完成；
- 迁移内容来自旧站自动提取，仍需内容负责人逐项确认图片授权、姓名、届次、日期和对外联系方式。

## 上线门禁结论

项目负责人于 2026-08-22 确认全部测试和人工验收完成，接受 `docs/SECURITY.md` 已记录风险，并明确批准全量上线。签字记录见 `docs/RELEASE_READINESS.md`；旧站回滚 commit 为 `b904313`。

## 下一步

交互动效与内容维护阶段已按 [`.agent/plans/2026-08-22-interaction-content-polish.md`](../.agent/plans/2026-08-22-interaction-content-polish.md) 完成，后续代码工作仅处理评审反馈或上线验收中发现的问题。

执行生产发布 PR，将 `develop/astro-cms` 合并到 `main`，由 GitHub Actions 校验、构建并发布 Pages；发布完成后记录生产 commit、workflow run 和线上冒烟验证结果。
