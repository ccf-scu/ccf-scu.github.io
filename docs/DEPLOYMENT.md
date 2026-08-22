# 部署与回滚

## 环境

| 环境 | 来源 | 用途 | 是否影响生产 |
|---|---|---|---|
| 本地 | 任意任务分支 | 开发和交互验证 | 否 |
| CI 检查 | PR / 开发分支 | 安装、检查和构建 | 否 |
| 内容预览 | Cloudflare Pages Preview | 分支/PR 预览 | 否 |
| 生产 | `main` | Cloudflare Pages + `www.ccfscu.com` | 是 |

## 当前保护边界

`main` 是唯一生产来源，Cloudflare Pages 的生产分支必须设为 `main`，构建命令为 `npm run build`，输出目录为 `dist`。其他分支只能产生 Preview 部署，不得绑定正式域名。仓库已删除 GitHub Pages 发布工作流；旧站通过 commit `b904313` 和标签 `pre-astro-launch-2026-08-22` 保持可恢复。

## CI 设计

- 固定 Node.js 和包管理器版本；
- 在 Linux 中使用 lockfile 和 `npm ci`；
- PR 与 push 使用不同 concurrency group，避免原型中互相取消；
- 检查类型、内容、测试、构建、链接和资源；
- GitHub Actions 权限保持只读，只负责非生产校验；Cloudflare Pages 使用其 Git 集成读取仓库；
- CI 不打印 Secret，不执行来自不可信内容的脚本。

## 正式发布步骤

1. 完成上线硬门禁并冻结内容；
2. 备份旧站 commit、构建结果和 URL 清单；
3. 合并经过评审的新站到生产分支；
4. Cloudflare Pages 从 `main` 安装依赖、运行 Astro 构建并发布 `dist`；
5. 验证首页、活动、详情、后台入口、静态资源和旧 URL；
6. 记录 commit、workflow run、时间和负责人；
7. 观察国内网络和错误反馈；
8. 解冻内容发布。

## 回滚

- 内容错误：revert 对应内容 commit 或恢复归档状态；
- 代码错误：revert 合并 commit，重新部署上一个可用版本；
- 构建系统错误：在 Cloudflare Pages 回滚到上一个成功部署，不手工上传来源不明的 `dist`；
- OAuth/CMS 故障：不回滚公众网站，启用 GitHub PR 应急内容流程；
- 域名/DNS（后期）：变更前记录原值和 TTL，分步切换。

## Cloudflare Pages

- 正式域名：`https://www.ccfscu.com`；根域是否跳转到 `www` 由 Cloudflare DNS/Redirect Rules 管理；
- 构建环境使用项目声明的 Node 24、`npm ci`/Cloudflare 自动安装和 `npm run build`；安装阶段会执行受版本保护的 Decap 媒体库补丁；
- Astro 默认 `site` 为正式域名、`base` 为 `/`，因此 robots、sitemap、后台“返回前台”和静态资源均不依赖 GitHub Pages 域名；
- 域名、构建变量或生产分支变更后，必须检查首页、后台、OAuth、robots 与 sitemap。
