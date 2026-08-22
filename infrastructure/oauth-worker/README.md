# Decap CMS OAuth Worker

该 Worker 只负责在 Decap CMS 与 GitHub 之间交换 OAuth 授权码，不保存网站内容。

## 生产地址

- Worker：`https://ccf-scu-cms-oauth.1632145935.workers.dev`
- 授权入口：`/auth`
- GitHub 回调：`https://ccf-scu-cms-oauth.1632145935.workers.dev/callback`
- 健康检查：`/health`

## GitHub OAuth App

在拥有长期维护责任的 GitHub 账号或 Organization 下创建 OAuth App：

- Application name：`CCF SCU CMS`
- Homepage URL：`https://ccf-scu.github.io/admin/`
- Authorization callback URL：`https://ccf-scu-cms-oauth.1632145935.workers.dev/callback`

生成 Client Secret 后，只把以下两项写入 Cloudflare Worker 的加密 Secret：

- `GITHUB_OAUTH_ID`
- `GITHUB_OAUTH_SECRET`

不得把值写入本目录、聊天、Issue、PR、Actions 日志或截图。

## 手工部署与轮换

从本目录执行以下命令；Wrangler 版本必须显式固定并经过更新评审：

```powershell
npx wrangler@4.59.1 deploy
npx wrangler@4.59.1 secret put GITHUB_OAUTH_ID
npx wrangler@4.59.1 secret put GITHUB_OAUTH_SECRET
```

轮换 Secret 时先生成新值、更新 Worker、完成真实登录，再撤销旧值。回滚使用 Cloudflare Worker 版本回滚，不把 Secret 放入 Git。

## 安全边界

- OAuth `state` 使用安全随机数和 `HttpOnly`、`Secure`、`SameSite=Lax` Cookie 校验；
- 只接受 `https://ccf-scu.github.io` 发起的登录；
- 回调令牌只通过精确的 `targetOrigin` 发回 CMS；
- 返回令牌前再次确认用户对 `ccf-scu/ccf-scu.github.io` 有写权限；
- 仅请求公开仓库所需的 `public_repo` scope；
- GitHub OAuth App 的 `public_repo` 仍覆盖用户可访问的所有公开仓库，无法缩小到单仓库。安全负责人必须明确接受该剩余风险。
