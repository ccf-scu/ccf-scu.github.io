# CCF 四川大学学生分会网站 Agent 规范

本文件适用于整个仓库。更深目录如存在 `AGENTS.md`，其规则仅覆盖对应子树；用户当次明确要求优先于本文件。

## 项目状态

- 生产分支：`main`，承载 Astro + Decap CMS 静态站，由 GitHub Actions 发布到 GitHub Pages。
- 集成分支：`develop/astro-cms`，用于较大功能集成；日常内容由 Decap CMS 通过受保护的 `main` 工作流发布。
- 当前阶段及完成证据以 [`docs/PROGRESS.md`](docs/PROGRESS.md) 为准。
- 架构、内容模型和发布边界分别见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)、[`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) 和 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

## 不可破坏的约束

1. 站点必须输出纯静态文件；不得引入需要常驻业务服务器的功能。
2. CMS 固定为 Decap CMS；正文使用 Decap 原生 Markdown 编辑器并保存标准 Markdown。
3. 前台不得加载 Decap 或 OAuth 代码。
4. 首期不得依赖 Google Fonts、unpkg 或只有境外节点可用的公共资源。
5. 移动端适配是功能要求；任何 UI 改动都要验证桌面端和至少一个移动端视口。
6. 旧站以 commit `b904313` 和标签 `pre-astro-launch-2026-08-22` 保持可恢复；非 `main` 分支不得部署到正式 GitHub Pages。
7. 不提交密钥、Token、OAuth Secret、真实个人敏感信息或未经授权的图片。
8. 不物理删除 CMS 内容；默认使用归档/隐藏状态。

## 开始任务前

1. 运行 `git status --short --branch`，确认分支和用户已有改动。
2. 阅读 `docs/PROGRESS.md` 和与任务相关的开发文档。
3. 复杂功能或跨 3 个以上模块的改动，先按 [`.agent/PLANS.md`](.agent/PLANS.md) 建立或更新执行计划。
4. 明确验收标准、影响页面、内容 schema、移动端和发布风险。
5. 不得覆盖、格式化或暂存与当前任务无关的用户改动。

## 实现规则

- 内容与展示分离：业务内容进入 `src/content/` 或 `src/data/`，不得硬编码在组件中。
- schema 先行：新增字段先更新 schema、CMS 配置、示例、文档和迁移兼容策略。
- 组件保持可降级：动画或 JavaScript 失败时，核心信息和导航仍可用。
- 站内 URL 统一通过 Astro 基础路径工具生成，不手工拼接仓库子路径。
- 外链只接受经过白名单的安全协议；Markdown/HTML 输出必须防止脚本注入。
- 仓库图片必须进入构建优化链路，保留尺寸信息和替代文本。
- 不随意新增依赖。新增依赖前说明用途、前台体积、维护状态、安全风险和替代方案。
- 使用精确版本和已提交 lockfile；不得忽略 package lock。

## 每次开发后的强制收尾

按 [`docs/AGENT_WORKFLOW.md`](docs/AGENT_WORKFLOW.md) 执行，最低要求如下：

1. 检查 `git diff`，确认只有本任务改动。
2. 运行与变更相称的格式、类型、schema、构建、链接和测试检查。
3. UI 改动必须启动站点，检查页面身份、可见内容、控制台、目标交互和截图；至少包含桌面和移动端。仅构建通过不能证明 UI 正确。
4. 更新 `docs/PROGRESS.md`：完成项、验证命令、结果、遗留风险和下一步。
5. 若架构、内容字段、依赖、安全或部署行为变化，同步更新对应文档和 ADR。
6. 检查 `.gitignore`，仅加入可再生输出、缓存、日志和本地秘密；不得用 ignore 隐藏源码、内容、lockfile、迁移数据或失败证据。
7. 使用 `git status --short` 和 `git diff --check` 做最终审查。
8. 只用 `git add -- <明确路径...>` 暂存当前任务文件；禁止 `git add .`、`git add -A`、`git add --all`。
9. 查看 `git diff --cached`，通过后创建一个自包含 commit。默认提交格式：`type(scope): 中文摘要`。
10. 提交后再次运行 `git status --short --branch`；报告 commit 哈希、验证结果、未提交文件和未完成事项。

若检查失败，不得把任务标记为完成，也不得提交明知损坏的代码。可以提交明确标注的文档/WIP 节点，但必须得到用户同意。

## Git 与发布安全

- 禁止 `git reset --hard`、`git checkout --` 覆盖用户改动和 force push。
- 未经请求不得 rebase 已共享分支或改写历史。
- 默认从非生产分支工作；如位于 `main`，先创建任务分支。
- 发布、创建 PR、修改分支保护、启用 Pages 或外部服务均属于外部状态变更，必须符合用户授权。
- PR 默认草稿；描述必须包含范围、截图/验证、内容迁移影响、安全影响和回滚方式。

## 完成定义

只有同时满足代码/文档实现、相关自动检查、真实页面验证、移动端验证、进度记录和自包含 commit，任务才可称为完成。若某项受环境限制，必须在 `docs/PROGRESS.md` 和交付说明中标为“未验证”，不能推定通过。
