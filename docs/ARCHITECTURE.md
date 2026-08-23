# 系统架构

## 目标和边界

网站面向公众的生产链路必须是静态文件。后台只负责把受控内容写入 GitHub；CMS 或 OAuth 故障不能使已发布页面下线。

```text
维护者 -> /admin/ React 管理壳层 + Decap 编辑器 -> OAuth 辅助服务 -> GitHub 内容分支
                                                     -> PR/审核/合并
GitHub 仓库 -> Cloudflare Pages 安装/校验与 Astro 构建 -> www.ccfscu.com -> 访问者
```

OAuth 辅助服务是认证基础设施，不是业务后端：不保存文章、成员或站点配置，不参与公众页面请求。

## 主要技术

- Astro：固定稳定版本，`output: "static"`；
- TypeScript：内容 schema、工具函数和组件接口使用严格类型；
- Decap CMS：后台内容管理，固定已验证版本；
- Decap Markdown：内置编辑与预览，保存标准 Markdown；
- Markdown/YAML：Git 中的内容源；
- Sharp/Astro 图片能力：构建期生成响应式图片；
- GitHub Actions：检查、构建和最终发布；
- Cloudflare Pages：生产静态托管与自定义域名；GitHub Pages 已停用。

## 代码职责

| 区域 | 职责 | 禁止事项 |
|---|---|---|
| `src/pages` | 路由和页面组合 | 硬编码批量业务内容 |
| `src/layouts` | HTML 骨架、SEO、全局资源 | 页面专属业务查询 |
| `src/components` | 可复用展示和交互 | 直接写仓库内容 |
| `src/content` | Markdown 内容集合 | 脚本和不受控 HTML |
| `src/data` | 首页与公共 YAML 配置 | 组件实现细节 |
| `src/lib` | 纯函数、查询、URL、状态和校验 | DOM 副作用 |
| `src/admin` | 后台应用壳层、页面工作区、Decap 控件与视觉适配 | 公众前台依赖、DOM 注入式主导航 |
| `public/admin` | Decap 入口和配置 | 前台公共依赖 |
| `scripts` | 迁移、检查和重复自动化 | 修改生产或外部服务 |

## 数据流

1. schema 校验 Markdown frontmatter 与 YAML；
2. 页面查询只读取已发布、未隐藏内容；
3. 活动状态按构建时区间自动计算；
4. 首页按置顶、显隐、数量和时间规则组合；
5. `src/lib/search.ts` 从活动与成员集合生成同一份本地搜索索引；Header 全屏搜索面板和 `/search/` 兼容页共用 `src/scripts/search-ui.ts` 渲染，不发起外部请求；
6. sitemap 和分享元数据从相同内容源生成；
7. 构建失败阻断发布，不输出部分更新。

## 后台应用边界

- `/admin/` 由项目自己的 React 壳层提供六个一级路由、桌面侧栏、移动导航、页面工作区和图片中心；每个入口都可通过 hash 直接访问与刷新；
- `src/pages/admin/content-index.json.ts` 在构建期聚合已发布内容，只为后台页面提供列表和编排摘要，不包含草稿、凭据或私密信息；
- Decap 继续负责身份认证、集合读取、表单、原生 Markdown、预览和 Git editorial workflow；具体编辑路由显示在统一壳层内；
- 原生 Decap 主导航在固定版本适配层中不可见且不可聚焦，维护者只面对一套主导航；升级 Decap 时必须用 CMS 专项浏览器测试复核该适配；
- 图片中心的完整图库是正式一级页面；字段内选择器是受控对话框，二者共用同一媒体索引、上传配置和图片选择语义。

## 渐进增强

- 核心内容必须在服务端静态 HTML 中存在；
- Header 搜索入口在 JavaScript 可用时打开原生全屏 `dialog`，否则链接到 `/search/`；菜单、动画等客户端能力失败时仍可浏览主要页面；
- Canvas 和重动画独立加载，遵守 `prefers-reduced-motion`；
- 前台不得加载 Decap；
- 第三方统计或图片失败不得阻断正文。

## URL 设计

- 首页 `/`；活动列表 `/activities/`；详情 `/activities/{slug}/`；
- 关于 `/about/`；归档 `/archive/`；搜索 `/search/`；后台 `/admin/`；
- slug 发布后保持稳定；
- 内部链接通过统一 base URL 工具生成，兼容根域和项目子路径；
- 旧路径优先保留，无法保留时建立静态兼容页。

## 架构变更

以下变化必须新增 ADR：静态输出边界、CMS、内容存储格式、生产托管、OAuth 方案、URL 结构、搜索引擎、图片主存储或权限模型。
