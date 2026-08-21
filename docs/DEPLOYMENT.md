# 部署与回滚

## 环境

| 环境 | 来源 | 用途 | 是否影响生产 |
|---|---|---|---|
| 本地 | 任意任务分支 | 开发和交互验证 | 否 |
| CI 检查 | PR / 开发分支 | 安装、检查和构建 | 否 |
| 内容预览 | 后续 Cloudflare Pages 或隔离方案 | 草稿/PR 预览 | 否 |
| 生产 | 受保护生产分支 | GitHub Pages | 是 |

## 当前保护边界

`main` 仍是旧站生产分支。`develop/astro-cms` 在重构期间只运行检查，不得把 artifact 部署到 `ccf-scu.github.io`。新部署工作流只有在上线评审和负责人明确批准后才启用。

## CI 设计

- 固定 Node.js 和包管理器版本；
- 在 Linux 中使用 lockfile 和 `npm ci`；
- PR 与 push 使用不同 concurrency group，避免原型中互相取消；
- 检查类型、内容、测试、构建、链接和资源；
- 权限默认只读；仅正式部署 job 获取 Pages 所需最小权限；
- CI 不打印 Secret，不执行来自不可信内容的脚本。

## 正式发布步骤

1. 完成上线硬门禁并冻结内容；
2. 备份旧站 commit、构建结果和 URL 清单；
3. 合并经过评审的新站到生产分支；
4. GitHub Actions 构建并上传 Pages artifact；
5. 验证首页、活动、详情、后台入口、静态资源和旧 URL；
6. 记录 commit、workflow run、时间和负责人；
7. 观察国内网络和错误反馈；
8. 解冻内容发布。

## 回滚

- 内容错误：revert 对应内容 commit 或恢复归档状态；
- 代码错误：revert 合并 commit，重新部署上一个可用版本；
- 构建系统错误：保留现有 Pages 版本，不手工上传来源不明的 `dist`；
- OAuth/CMS 故障：不回滚公众网站，启用 GitHub PR 应急内容流程；
- 域名/DNS（后期）：变更前记录原值和 TTL，分步切换。

## Cloudflare Pages

Cloudflare Pages 可在后期承担 PR 预览、备用入口或候选主站。使用其境外服务通常不因服务本身要求中国大陆 ICP 备案；但若启用中国大陆网络、国内 CDN 或大陆服务器，应重新评估域名实名、备案和服务资质。接入前验证构建一致性、环境变量、预览隔离、国内可达性和回滚。
