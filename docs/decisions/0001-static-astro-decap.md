# ADR 0001：采用 Astro 静态输出和 Decap CMS

- 状态：已接受
- 日期：2026-08-22

## 背景

分会需要无自有业务后端、可由非技术维护者更新、可追溯回滚且适合国内访问的官网。现有新版视觉原型内容硬编码，旧站重复维护严重。

## 决定

使用 Astro 生成纯静态站点；内容存为 Markdown/YAML；使用 Decap CMS 和 GitHub 账号编辑；使用 Vditor 提供 Markdown 正文体验；GitHub Pages 首期托管。首页模块固定，维护者编辑内容、顺序和显隐。

> 2026-08-22 后续状态：Vditor 已由 Decap 原生 Markdown 取代，生产托管已迁移到 Cloudflare Pages + `www.ccfscu.com`；本段保留为原始决策历史。

## 结果

公众访问不依赖 CMS 或 OAuth。需要维护内容 schema、GitHub OAuth 辅助服务和构建流程。Decap 已知依赖告警通过固定版本、最小权限、前后台隔离和定期复查缓解；该风险不能从文档中删除或描述为已解决。
