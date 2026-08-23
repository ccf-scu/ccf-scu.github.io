# 开发进度

> 最后更新：2026-08-23
>
> 当前分支：`develop/astro-cms`
>
> 当前状态：生产全量上线已完成，站点与 OAuth 线上冒烟验证通过

## 后台应用壳层重新实现（2026-08-23，未发布）

- 在 `docs/admin-visual-contract` 分支重建独立 React 管理壳层，六个一级入口固定为首页管理、活动页面、关于与档案、全站设置、待发布和图片中心；具体 Decap 编辑器继续保留在统一壳层和返回上下文内。
- 首页工作区直接展示公告顺序、四个固定活动位和三项荣誉；活动工作区提供可搜索、分类筛选并可扫读置顶/归档状态的列表；关于、档案与全站低频设置按前台归属分区。
- 图片中心由右下角悬浮按钮和大型 dialog 改为正式全宽一级页面；图床配置默认收起，普通图片字段统一显示“从图片中心选择”，完整页面与字段选择器复用媒体索引和上传配置。
- 删除 `document.body.append(...)`、主要功能 `MutationObserver`、悬浮图片中心按钮和旧 dialog 样式；桌面使用固定侧栏，移动端使用可由 Escape 关闭并恢复焦点的导航抽屉。
- 新增构建期 `/admin/content-index.json`，只聚合已发布公开内容摘要，不包含草稿、Token 或私密数据。
- 验证：`npm run check` 为 0 错误/警告/提示；17 项 Node 测试通过；34 页面构建与产物隔离验证通过；13 项常规 E2E 通过；`CMS_LOCAL=1` 的 1 项 CMS 专项通过，覆盖壳层、图片中心、390px 导航、登录后编辑器、Markdown 预览和统一选图入口。
- 真实浏览器检查确认桌面与 390px 无页面级横向溢出，图片中心显示 47 张已发布图片且不存在悬浮业务按钮。截图保存在忽略目录 `artifacts/visual-validation/`。
- 未发布门禁：生产真实账号仍需复核待发布条目状态变更、逐条发布、保存/取消返回上下文和真实图床上传；本分支未执行外部发布、合并或上传。

## 后台页面化与图片中心发布（2026-08-23）

- 首页公告、四方向活动和三项荣誉改为 `homepage.yml` 中的稳定 ID 显式编排；活动中心置顶改用独立 `pinned` 字段。
- 39 个现有内容文件已由幂等迁移器清除旧 `featured/showOnHomepage` 字段；旧 `/uploads/...` 图片未删除或迁移。
- CMS 图片字段支持 HTTPS URL，并新增共享图片中心、本地图床配置和通用 multipart 上传。图床 Token 默认仅保存在会话中，主动选择后才留在本机。
- 已完成类型、17 项 Node 测试、内容校验、34 页面根/子路径构建及产物隔离检查；13 项常规浏览器测试通过，覆盖桌面、360/390/430、主要交互、后台外壳和图片中心。
- 生产合并提交 `28bc5e9a9f5e702a8fd8a9a5b6ecb0c3139a553a` 已推送至 `main` 并由 Cloudflare Pages 发布；首页、活动、关于、后台与配置均返回 200，`media-index.json` 返回 47 张已发布图片，CMS API 健康检查为 `configured: true`。

## 阶段总览

| 阶段 | 状态 | 完成证据 |
|---|---|---|
| 1. Astro/Decap 工程基座 | 已完成 | Astro 7 静态构建、严格内容 schema、Node 测试、Linux 非生产 CI |
| 2. 视觉骨架和移动端 | 已完成 | CCF 品牌设计、语义导航、首页、360/390/430 与桌面自动截图 |
| 3. 内容页面和搜索 | 已完成 | 活动列表/详情、关于、归档、搜索、SEO、分享和旧入口兼容 |
| 4. CMS、Markdown 和图片链路 | 已上线 | 中文 Decap 配置、原生 Markdown 编辑/预览、仓库图片优化；生产后台配置与 OAuth 授权跳转验证通过 |
| 5. 旧内容迁移和上线准备 | 已完成 | 26 条活动、203 条成员、12 条荣誉、46 张 WebP、迁移清单、运维手册与生产发布记录 |

## 本轮实现

- CMS 媒体 API 从可能被客户端网络拦截的 `workers.dev/github` 迁移至 Worker Custom Domain `https://cms-api.ccfscu.com/github`；OAuth 回调域名保持不变，避免影响 GitHub OAuth App；
- 生产托管从已停用的 GitHub Pages 切换为 Cloudflare Pages，正式域名统一为 `https://www.ccfscu.com`；后台、Astro、SEO、OAuth Worker 和部署文档同步迁移；
- 后台右上角站点入口改为动态“返回前台”，始终指向当前访问域名根路径，避免未来换域名时按钮失效；
- 修复 Decap Core 3.17.1 媒体库空选择时读取 `selectedFile.path` 的上游缺陷；补丁在 `npm ci` 后自动、幂等执行，并以精确版本和目标代码校验防止静默漂移；
- 相关链接解除 HTTPS-only 限制，允许完整 HTTP/HTTPS 外链，同时继续拒绝脚本等危险协议；保留后台已保存的四川大学开源硬件协会 HTTP 链接；
- “03 关于分会｜相关链接”移除类型和用途选择，首页开源按钮、全站页脚链接拆为独立数据文件和后台入口；
- 关于页“连接专业共同体与校园成长”“指导老师”“相关链接”升级为差异化卡片视觉，并补充 390px 移动端无溢出验证；
- 移除 Vditor 依赖和自定义控件，正文统一改用 Decap 原生 Markdown 编辑器；消除 unpkg 语言包请求、编辑器卸载竞态和额外运行资源；
- 后台集合按前台页面重命名：首页公告、活动中心、关于分会/历史档案成员、首页/历史档案荣誉，以及包含首页、关于分会和全站配置的页面设置；指导老师、相关链接和 QQ 群入口直接标明前台位置；
- 新增原生 Markdown 格式化预览模板与本地 CMS 登录后浏览器测试，并补充 GitHub OAuth App 组织访问申请/批准操作说明；
- 修复 Decap 正文控件的 Vditor 初始化/卸载竞态：只销毁已完成初始化的实例，销毁异常不再击穿后台路由；同步外部值并保留 Markdown 文本框降级；
- 纠正首页活动字段：`首页显示` 现在实际过滤首页候选，`首页优先` 在首页与活动列表中生效；删除与固定四方向布局冲突且实际无效的“首页活动数量”；
- 新增 `organization.currentCohort` 作为本届执委的明确来源，并校验其必须匹配现有成员届次；历届档案继续按成员届次自动生成标题和分组；
- 普通/页脚友情链接新增前台消费者，指导老师、联系方式和 QQ 群的前台位置及显隐/排序规则完成审计；新增 `docs/CMS_FRONTEND_ALIGNMENT.md` 作为字段对照与换届操作指南；
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
- 公开站点全部静态生成，前台不加载 Decap 或 OAuth bundle；
- 内容由 `src/content/` 与 `src/data/` 驱动，并由 Zod/schema 和构建脚本双重校验；
- CMS 支持活动、公告、成员、荣誉、首页、分会、老师、链接和联系方式；物理删除关闭；
- 活动支持状态、分类筛选、归档、复制链接和二维码；搜索覆盖活动与成员；
- 旧内容保留来源，未确认成员简介统一标记 `profileConfirmed: false`，没有补写个人信息；
- Astro 新站已通过 PR #1 合并至 `main` 并发布到 GitHub Pages；Cloudflare Worker `ccf-scu-cms-oauth` 已部署并启用生产 `workers.dev` 地址。
- 新增可审计的 Cloudflare OAuth Worker、生产 URL 与 ADR；2026-08-22 验证未配置凭据时 `/auth` 按设计返回 503，配置加密 Secret 后健康检查返回 `configured: true` 且 `/auth` 正确跳转 GitHub。

## 验证记录

- CMS API 自定义域名迁移：`npm run validate` 通过，Astro 0 错误/警告/提示、15 项 Node 测试、内容校验、34 页面构建与产物校验通过；Worker 版本 `8c38e9e1-a56e-4de7-9486-c62373a3a532` 已部署，`cms-api.ccfscu.com/health` configured，上传 OPTIONS 为 204，POST 可正确透传 GitHub 状态并携带生产 CORS；
- 生产提交 `e1abdd2` 已由 Cloudflare Pages 发布；线上 `admin/config.yml` 的 `api_root` 与后台 CSP 均已切至并允许 `cms-api.ccfscu.com`；真实登录媒体上传待维护者恢复浏览器操作后验收；
- Cloudflare/CMS 媒体修复：全新 `npm ci` 自动应用补丁；`npm run validate` 通过（Astro 0 错误/警告/提示、Node 12 项、内容安全与 34 页面构建）；CMS 专项 1 项通过并覆盖空媒体库，常规 E2E 13 项通过、1 项按预期跳过；线上 OAuth Worker 已接受 `www.ccfscu.com`、拒绝旧 GitHub Pages 来源且健康检查 configured；
- 链接模型与关于页视觉优化：`npm run validate` 通过，Astro 0 错误/警告/提示，Node 12 项、内容安全校验、34 页面构建与产物校验均通过；常规 E2E 13 项通过、1 项本地 CMS 专项按预期跳过；本地 CMS 模式 14 项全部通过；
- 生产提交 `c0fb103e806d9f2f9a3c1f318ad54cfa28e8a4a2` 已由 Actions 运行 32562536675 成功发布；线上首页、关于页、后台与配置均返回 200，HTTP 硬件协会链接、最新指导老师、首页仓库按钮和两个独立链接设置入口均已确认。
- CMS/前台对齐修复：`npm run check` 0 错误/警告/提示；Node 测试 12 项通过；内容校验、根路径构建与构建产物校验通过，共 34 页面；
- 浏览器端到端 13 项通过，覆盖本届执委、普通友情链接和 QQ 群前台消费；本地 CMS 登录后测试覆盖集合导航、原生 Markdown 编辑、格式化预览及无 unpkg 请求；
- CMS 对齐修复已由生产提交 `4c18d2343c300940a75c45e40dcc7a3210a3f0e1` 发布；GitHub Actions `Deploy production site` 运行 32558856709 的 build/deploy 均成功，首页、关于、历史档案和后台入口线上返回 200，关于页可见相关链接与本届执委；
- CMS 原生 Markdown 与页面化后台由生产提交 `34d2ce7b5c1c828c05e96d985379c3cd2d26d561` 发布；GitHub Actions 运行 32560608160 成功；线上首页、关于、历史档案、后台与配置均返回 200，配置含 4 个原生 Markdown 控件，生产后台 bundle 不再包含 Vditor 或 unpkg；
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
- 生产发布：PR #1 已合并，生产 commit 为 `0e9f197f3f23eb212ebbba0cecbf844183111941`，GitHub Actions `Deploy production site` 第 1 次运行成功；
- 线上冒烟：主页、活动列表、活动详情、关于、档案、搜索、后台、`robots.txt` 与 `sitemap.xml` 均返回 200；后台配置确认使用 `main` 和生产 OAuth Worker；OAuth `/health` 返回 `configured: true`，授权入口返回 302 并跳转 GitHub。
- 上线后修复 Decap 使用仅主机名 `site_id` 时被来源校验误拒的问题；Worker 继续只允许生产域名，生产复测返回 302 并正确跳转 GitHub。

## 已知且接受的风险

- Decap 3.15.1 的间接依赖存在 9 项已记录的高危审计告警；采用固定版本、后台独立 bundle、仅后台放宽 `unsafe-eval`、最小权限和 Git 回退作为补偿控制；
- `public/admin/config.yml` 已指向生产 Worker；Cloudflare 已配置 `GITHUB_OAUTH_ID` 与 `GITHUB_OAUTH_SECRET`，远程健康检查返回 `configured: true`，`/auth` 正确跳转 GitHub；完整授权回调需在新站后台发布到生产域名后由真实维护者验收；
- 本地已验证登录后的集合导航、原生 Markdown 编辑与预览；生产保存仍被 GitHub 组织 OAuth App access restrictions 阻止，须由 `ccf-scu` Owner 批准 `CCF SCU CMS` 后复测保存、重开和图片上传；
- 迁移内容来自旧站自动提取，仍需内容负责人逐项确认图片授权、姓名、届次、日期和对外联系方式。

## 上线门禁结论

项目负责人于 2026-08-22 确认全部测试和人工验收完成，接受 `docs/SECURITY.md` 已记录风险，并明确批准全量上线。生产发布和线上冒烟验证均已完成。签字记录见 `docs/RELEASE_READINESS.md`；旧站回滚 commit 为 `b904313`。

## 下一步

完成后台新壳层的维护者真实登录验收，重点检查待发布、保存/取消返回和真实图床；签字后再决定是否合并与发布。公众前台仍按常规内容运营和监控；如发生生产故障，按 `docs/INCIDENT_ROLLBACK.md` 回滚至 `pre-astro-launch-2026-08-22` 或 commit `b904313`。
