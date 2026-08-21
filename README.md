# CCF 四川大学学生分会网站

这是 CCF 四川大学学生分会网站的正式仓库。当前 `main` 仍保留旧版纯 HTML/CSS/JavaScript 网站；新一代 Astro + Decap CMS 网站在 `develop/astro-cms` 分支开发，未经上线验收不会覆盖旧站。

## 项目目标

- 生成无业务后端的纯静态网站；
- 面向四川大学在校学生展示活动、招新和分会信息；
- 由非技术维护者通过 Decap CMS 和 GitHub 账号更新内容；
- 保持精美、现代、移动端友好和国内网络环境可用；
- 让所有内容、发布和回滚都有 Git 记录，便于换届交接。

## 当前状态

开发状态、验证证据和下一步统一记录在 [`docs/PROGRESS.md`](docs/PROGRESS.md)。不要根据 README 推定某项功能已经完成。

## 文档入口

- [开发文档索引](docs/README.md)
- [系统架构](docs/ARCHITECTURE.md)
- [本地开发](docs/DEVELOPMENT.md)
- [内容模型](docs/CONTENT_MODEL.md)
- [CMS 与编辑流程](docs/CMS.md)
- [测试与验收](docs/TESTING.md)
- [部署与回滚](docs/DEPLOYMENT.md)
- [安全与隐私](docs/SECURITY.md)
- [Agent 开发工作流](docs/AGENT_WORKFLOW.md)
- [贡献规范](CONTRIBUTING.md)

## 分支说明

- `main`：当前生产分支；
- `develop/astro-cms`：新站集成分支；
- `feature/*`、`fix/*`、`docs/*`：短期任务分支；
- `content/*`：CMS 编辑工作流内容分支。

## 旧站

旧站文件目前继续保留在仓库根目录。其历史维护说明见 `MAINTENANCE.md` 和 `CHANGELOG.md`。新站切换完成前，不删除这些文件。
