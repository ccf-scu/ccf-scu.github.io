# CCF 四川大学学生分会网站

这是 CCF 四川大学学生分会网站的正式仓库。Astro + Decap CMS 新站已于 2026-08-22 获批切换到 `main`，由 GitHub Actions 构建并发布到 GitHub Pages。

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
- [非技术维护手册](docs/MAINTAINER_GUIDE.md)
- [上线验收签字表](docs/RELEASE_READINESS.md)
- [故障与回滚](docs/INCIDENT_ROLLBACK.md)
- [换届交接](docs/HANDOVER_CHECKLIST.md)
- [Agent 开发工作流](docs/AGENT_WORKFLOW.md)
- [贡献规范](CONTRIBUTING.md)

## 分支说明

- `main`：当前生产分支；
- `develop/astro-cms`：后续较大功能的集成分支；
- `feature/*`、`fix/*`、`docs/*`：短期任务分支；
- `content/*`：CMS 编辑工作流内容分支。

## 旧站

旧站最后一个生产 commit 为 `b904313`，发布标签为 `pre-astro-launch-2026-08-22`。其历史维护说明见 `MAINTENANCE.md` 和 `CHANGELOG.md`；需要回滚时使用 revert PR，不改写 Git 历史。
