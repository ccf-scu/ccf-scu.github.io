# 参与开发

本仓库是 CCF 四川大学学生分会网站的正式资产。开发者和编码 Agent 都必须遵守根目录 [`AGENTS.md`](AGENTS.md)。

## 开始之前

1. 阅读 [`docs/README.md`](docs/README.md) 和 [`docs/PROGRESS.md`](docs/PROGRESS.md)。
2. 从当前集成分支创建范围明确的 `feature/*`、`fix/*`、`docs/*` 或 `content/*` 分支。
3. 在 Issue、计划或提交说明中写清验收条件。
4. 确认工作区没有将被覆盖的他人改动。

## 提交约定

提交格式：`type(scope): 中文摘要`。

常用类型：`feat`、`fix`、`docs`、`refactor`、`test`、`build`、`ci`、`chore`、`content`。

一个提交应可独立理解和回滚。不要把格式化、无关内容和功能开发混在同一提交中。

## Pull Request

PR 默认先创建为草稿，并说明：

- 目标与范围；
- 页面和内容模型影响；
- 桌面与移动端截图（涉及 UI 时）；
- 实际执行的检查及结果；
- 新依赖、安全和隐私影响；
- 迁移、发布和回滚方式；
- 已知未完成项。

合并前必须通过自动检查，并由维护者确认不影响旧站迁移和生产发布边界。
