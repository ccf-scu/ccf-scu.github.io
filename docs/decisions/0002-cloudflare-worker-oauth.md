# ADR 0002：使用 Cloudflare Worker 承载 Decap GitHub OAuth

- 状态：待生产凭据验收
- 日期：2026-08-22

## 背景

GitHub Pages 只提供静态文件，Decap CMS 的 GitHub 后端需要服务端安全保存 Client Secret 并交换授权码。公众网站不得引入常驻业务后端，OAuth 故障也不得影响已发布页面。

## 决策

使用独立 Cloudflare Worker `ccf-scu-cms-oauth` 作为 OAuth 辅助服务。Worker 不保存内容，只提供 `/auth`、`/callback` 和 `/health`；Client ID 与 Secret 只进入 Cloudflare 加密 Secret。站点继续由 GitHub Pages 静态托管。

Worker 固定生产 CMS 来源、校验 OAuth `state`、使用精确 `postMessage` 来源，并在返回令牌前确认登录用户对正式仓库有写权限。公开仓库仅申请 `public_repo` scope。

## 权衡与风险

传统 GitHub OAuth App 的 scope 不能限定到单个仓库；`public_repo` 会覆盖用户可访问的公开仓库。Worker 的仓库权限复核能限制谁取得令牌，但不能缩小令牌自身权限。上线前由安全负责人接受该风险；后续如采用与 Decap 兼容的 GitHub App 细粒度令牌方案，应替换本方案并重新验收。

OAuth 服务故障时，公众站保持可用，维护者改用 GitHub 内容 PR 应急流程。
