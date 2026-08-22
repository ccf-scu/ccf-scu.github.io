# 开发文档索引

本文档集是新站开发、评审、上线和换届交接的仓库内唯一事实来源。外部方案文档负责说明“为什么”，本目录负责说明“如何实现、如何验证、目前完成到哪里”。

## 必读顺序

1. [`PROGRESS.md`](PROGRESS.md)：当前阶段、完成证据和阻塞项；
2. [`ARCHITECTURE.md`](ARCHITECTURE.md)：系统边界和代码职责；
3. [`DEVELOPMENT.md`](DEVELOPMENT.md)：环境、本地开发和分支流程；
4. [`CONTENT_MODEL.md`](CONTENT_MODEL.md)：内容字段和不变量；
5. 与任务相关的专题文档；
6. Agent 还必须遵守根 [`AGENTS.md`](../AGENTS.md) 和 [`AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md)。

## 专题文档

| 文档 | 负责内容 |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Astro、CMS、OAuth、静态输出和目录职责 |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | 开发环境、命令、编码和依赖流程 |
| [`CONTENT_MODEL.md`](CONTENT_MODEL.md) | 首页、活动、公告、成员及公共数据 schema |
| [`CMS.md`](CMS.md) | Decap、Markdown、审核和图片上传 |
| [`TESTING.md`](TESTING.md) | 自动检查、浏览器、移动端和上线验收 |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | 分支、Cloudflare Pages、预览、发布和回滚 |
| [`SECURITY.md`](SECURITY.md) | OAuth、依赖、内容、隐私和事件响应 |
| [`MIGRATION.md`](MIGRATION.md) | 旧站内容、图片和 URL 迁移 |
| [`AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md) | 编码 Agent 的逐任务执行和提交规范 |
| [`PROGRESS.md`](PROGRESS.md) | 进度、验证证据、风险和下一步 |
| [`MAINTAINER_GUIDE.md`](MAINTAINER_GUIDE.md) | 非技术维护者日常编辑和发布 |
| [`RELEASE_READINESS.md`](RELEASE_READINESS.md) | 生产上线人工硬门禁和签字 |
| [`INCIDENT_ROLLBACK.md`](INCIDENT_ROLLBACK.md) | 故障分级、凭据事件和回滚 |
| [`HANDOVER_CHECKLIST.md`](HANDOVER_CHECKLIST.md) | 换届权限、账号与演练交接 |
| [`CCFWEB_VISUAL_MIGRATION.md`](CCFWEB_VISUAL_MIGRATION.md) | ccfweb 视觉母版分析与迁移规范 |

## 决策记录

影响架构、内容兼容、部署、安全或维护流程的决定写入 `docs/decisions/`。已接受决策不直接覆写；若方向变化，新增 ADR 并注明被替代关系。

## 文档维护规则

- 代码和文档在同一个提交中保持一致；
- 命令必须可以复制执行，未实现的命令标记为“计划”；
- 完成状态必须附命令、CI 链接、截图或人工验收记录；
- 不把原型结果自动等同于正式仓库结果；
- 不在文档中保存 Secret、Token、个人隐私或内部群二维码原图。
