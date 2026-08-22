# Agent 开发工作流

本文档定义编码 Agent 每个任务的执行闭环。目标不是制造提交数量，而是让每项改动可审查、可复现、可恢复并留下真实进度。

## 1. 接收任务

1. 用一句话重述目标和不做的范围；
2. 运行 `git status --short --branch`；
3. 确认不在 `main` 开发新站；
4. 识别未提交的用户改动并保留；
5. 阅读 `AGENTS.md`、`docs/PROGRESS.md` 和相关专题文档；
6. 检查目标目录是否有更深层 `AGENTS.md`；
7. 定义可观察的验收标准。

如果任务会改变架构、内容兼容、安全、部署或外部服务，先更新文档/ADR并取得必要确认。

## 2. 计划

满足任一条件时建立 ExecPlan：预计跨 3 个以上模块、包含迁移、超过一个可独立验收阶段、需要长时间测试、会改变数据格式或存在明显回滚风险。格式遵循 `.agent/PLANS.md`。

计划必须实时更新，包含发现、决定、验证和未完成项；不能只在开始时写一次。

## 3. 实现

- 先做最小可验证纵向切片；
- schema、CMS、类型、页面、测试和文档保持同步；
- 不清理无关代码，不批量格式化整个仓库；
- 不绕过错误检查或删除 lockfile；
- 需要联网、写外部服务、安装依赖或发布时遵守授权边界；
- 发现用户同时改动同一文件时暂停覆盖并说明冲突。

## 4. 验证矩阵

按改动类型选择，不能无条件跳过：

| 改动 | 最低验证 |
|---|---|
| 仅文档 | 链接/路径人工检查、`git diff --check`、Markdown 结构检查 |
| 内容/schema | schema、构建、目标页面、搜索/SEO、CMS 字段 |
| 纯函数 | 类型、单元测试、构建 |
| UI/CSS | 类型、构建、浏览器目标流程、控制台、桌面+移动截图 |
| 交互 JS | 单元/集成、浏览器交互、键盘/触控、无 JS/失败降级 |
| 图片 | 构建、尺寸/格式/alt、页面截图、慢网检查 |
| CMS/Markdown | 后台加载、保存重开、上传、预览、移动端短改 |
| CI/部署 | workflow 语法、非生产演练、权限、并发、失败与回滚路径 |
| 安全 | 输入边界、Secret 扫描、依赖风险、最小权限和失败模式 |

前端浏览器证据至少包含：正确 URL/标题、非空页面、无错误覆盖层、相关 console 无错误、目标交互后的状态和截图。环境无法执行时写“未验证”及原因，不声称通过。

## 5. 文档同步

每次任务至少更新 `docs/PROGRESS.md`。以下变化还需更新：

- 命令/环境：`DEVELOPMENT.md`；
- 路由/模块/数据流：`ARCHITECTURE.md`；
- 字段/枚举：`CONTENT_MODEL.md` 和 `CMS.md`；
- 测试矩阵：`TESTING.md`；
- 发布/环境：`DEPLOYMENT.md`；
- 权限/依赖/输入风险：`SECURITY.md`；
- 迁移行为：`MIGRATION.md`；
- 重大决定：新增 ADR。

## 6. Ignore 审查

开发后检查是否出现可再生文件：依赖目录、构建输出、缓存、日志、临时截图、测试报告和本地 Secret。只有这些内容可加入 `.gitignore`。

禁止忽略：`package-lock.json`、源码、正式内容、经确认的迁移 manifest、测试 fixture、正式截图基线、文档、配置示例和为了掩盖失败而产生的报告。新增 ignore 规则要具体，不使用可能吞掉业务目录的宽泛模式。

## 7. 提交前审查

依次执行：

```text
git status --short --branch
git diff --check
git diff -- <本任务路径>
```

随后：

1. 运行最终验证；
2. 更新进度和计划；
3. 再检查 diff 中是否有 Secret、调试代码、临时 URL 和未授权个人信息；
4. 使用 `git add -- <明确路径...>` 逐项暂存；
5. 用 `git diff --cached --stat` 和 `git diff --cached` 复核；
6. 确保未暂存文件属于用户或明确的后续任务。

禁止 `git add .`、`git add -A` 和 `git add --all`。

## 8. Commit

每个成功的自包含开发任务默认创建 commit，这是本项目的明确要求。例外：用户要求不提交、验证失败、存在未解决冲突、提交会包含不属于任务的用户改动、或任务只是尚未获批的业务方案。

格式：`type(scope): 中文摘要`。提交正文在需要时写明原因、验证和兼容影响。不要把“更新文件”作为摘要，要描述可观察结果。

提交后执行：

```text
git status --short --branch
git log -1 --oneline
```

不自动 push、不自动创建 PR、不自动部署，除非用户已明确授权相应外部操作。

## 9. 最终报告

必须报告：结果、关键文件、实际验证及结果、commit 哈希、工作区是否干净、未验证/风险、下一步。UI 任务附截图位置或说明验证环境。不得用“应该正常”替代证据。

## 10. 中止条件

遇到以下情况停止并请求方向：需要改写生产历史、目标权限不清、Secret/隐私可能泄露、与用户未提交改动无法安全合并、架构选择超出已确认范围、或同一阻塞连续复现且没有安全替代路径。

## 调研依据

本规范于 2026-08-22 参考以下当前资料编制，并结合本项目发布风险收紧了提交和生产保护规则：

- [OpenAI Codex 的 AGENTS.md 作用域规范](https://github.com/openai/codex/blob/main/codex-rs/models-manager/prompt.md)；
- [OpenAI 前端测试与调试 Skill](https://github.com/openai/plugins/blob/main/plugins/build-web-apps/skills/frontend-testing-debugging/SKILL.md)；
- [OpenAI Skill Creator 结构与验证规范](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md)；
- [OpenAI Cookbook：使用 ExecPlan 完成长任务](https://github.com/openai/openai-cookbook/blob/main/articles/codex_exec_plans.md)。

外部资料只提供通用模式；仓库根 `AGENTS.md`、用户明确要求和本项目文档决定实际行为。
