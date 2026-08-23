# CMS 媒体 API 自定义域名迁移

## 目的与用户可见结果
后台媒体上传改用 `https://cms-api.ccfscu.com/github`，不再依赖客户端可能拦截的 `workers.dev` API 地址；OAuth 登录回调保持原地址。

## 范围与明确不做
为现有 OAuth Worker 增加 Cloudflare Custom Domain，更新 Decap `api_root`、后台 CSP、测试和运维文档。不更换 OAuth App，不轮换 Secret，不修改内容模型。

## 当前事实与相关文件
- `public/admin/config.yml` 的 `api_root` 当前指向 `workers.dev/github`。
- `infrastructure/oauth-worker/wrangler.jsonc` 尚未声明 Custom Domain。
- `base_url` 和 `OAUTH_BASE_URL` 必须继续使用现有 OAuth 回调域名。

## 验收标准
- Wrangler 成功创建 `cms-api.ccfscu.com` Custom Domain。
- 新域名 `/health` 返回 configured，上传预检返回 204。
- 生产后台仅将 `api_root` 切至新域名，OAuth `base_url` 不变。
- 自动测试、构建与线上配置检查通过。

## 分阶段步骤
1. 更新 Worker、CMS、CSP、测试和文档。
2. 运行测试、构建与 Wrangler dry-run。
3. 部署 Worker Custom Domain 并验证线上接口。
4. 提交推送到生产分支，等待 Pages 发布并完成线上冒烟。

## 进度（带时间）
- 2026-08-23：完成根因边界确认，开始自定义域名迁移。
- 2026-08-23：实现、自动验证与 Worker Custom Domain 部署完成，进入 Pages 发布。

## 发现与证据
- 服务端测试 POST 可见于 Worker 日志，但用户上传失败时没有 Worker invocation，失败发生在请求到达 Worker 之前。
- Cloudflare 官方推荐 Worker 作为源站时使用 Custom Domain；DNS 与证书由 Cloudflare自动创建。

## 决策记录
- 仅迁移媒体 `api_root`；保留 OAuth `base_url`，避免改变 GitHub OAuth App callback URL。

## 验证命令与结果
- `npm run validate`：通过；Astro 0 错误/警告/提示，15 项 Node 测试、内容校验、34 页面构建与产物校验通过。
- `npx wrangler@4.59.1 deploy --dry-run`：通过。
- `npx wrangler@4.59.1 deploy`：成功，版本 `8c38e9e1-a56e-4de7-9486-c62373a3a532`，创建 `cms-api.ccfscu.com` Custom Domain。
- 线上 `/health` 返回 `configured: true`；上传 OPTIONS 返回 204；使用无效令牌的 POST 返回可读的 GitHub 401 且包含正确 CORS 头。

## 风险与回滚
- 若证书未就绪，后台暂不切换；回滚时恢复旧 `api_root` 并移除 Custom Domain 配置。

## 未完成项与下一步
- 提交推送 `main`，等待 Cloudflare Pages 更新后台配置并完成线上冒烟。
