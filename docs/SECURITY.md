# 安全与隐私

## 外部图床

图床上传只在 `/admin/` 浏览器内发生，前台和构建产物不包含上传凭据。Token 默认写入 `sessionStorage`；仅当维护者明确选择“长期记住”时写入 `localStorage`。上传端点必须为 HTTPS，并由目标服务允许本站后台来源的 CORS。后台限制图片 MIME 与 10 MB 大小，持久化 URL 只接受站内路径或 HTTPS；共享索引仅包含已发布的公开 URL 和引用元数据。

## 资产和威胁

保护对象包括 Organization 权限、生产分支、OAuth Secret、站点内容、成员个人信息、图片版权和发布供应链。主要风险是账号失陷、过宽 OAuth、恶意 Markdown/URL、依赖漏洞、误发布、隐私泄露和第三方资源失效。

## 账号与权限

- 维护者使用个人 GitHub 账号，不共享密码；
- 强烈要求启用 GitHub 2FA；
- Organization 定期清理离任人员；
- CMS App 只授权正式仓库所需权限；
- `main` 禁止 force push，要求检查通过；
- 换届按清单移交和撤销旧权限。

## Secret

- Secret 只进入 GitHub/Cloudflare 等平台秘密存储；
- 仓库只提交 `.env.example`；
- PR、日志、截图和文档不得包含 Secret；
- 怀疑泄漏时立即撤销/轮换，之后再清理历史和调查影响；仅删除文件不是轮换。

生产 OAuth 由独立 Cloudflare Worker 承载。Worker 固定 CMS 来源、验证 OAuth `state`、使用精确 `postMessage` 来源并在发回令牌前验证正式仓库写权限。GitHub OAuth App 的 `public_repo` scope 不能限定到单仓库，仍会覆盖维护者可访问的公开仓库；这项剩余风险必须由安全负责人签字接受，并通过专用维护账号、2FA 和最小仓库权限降低影响。

## 内容安全

- Markdown 原始 HTML默认关闭或清理；
- 禁止 `javascript:`、不可信 iframe 和事件属性；
- 外链使用安全协议并在新窗口链接上设置适当 rel；
- 图片上传验证 MIME、扩展名、大小和解码；
- 个人简介和照片发布前确认授权；
- 搜索索引不得包含隐藏或草稿内容。

## Decap 已知风险

2026-08-22 使用 npm 官方审计源复查生产依赖：可修复的 YAML 中危已通过升级到 2.9.0 消除；剩余 9 项 high、0 critical，均沿 Decap 3.15.1 的旧 Markdown/Immutable 间接依赖链，当前没有完整无破坏修复版本。负责人决定继续使用 Decap。补偿控制：固定版本、前后台分包、最小仓库权限、独立安全响应头、季度复查、隔离升级测试、Git 审计和应急 GitHub 编辑流程。Decap 当前 bundle 需要动态代码求值，因此 `'unsafe-eval'` 仅在 `/admin/` CSP 中放行，公众页面不放行；这项例外需随每次 Decap 升级复核。任何新 critical 或可利用的跨站脚本风险应阻断上线并重新评估。

## 安全响应

1. 停止发布并保存证据；
2. 撤销受影响 Token/App/账号权限；
3. 确认是否影响公众站、仓库历史和个人信息；
4. 修复并通过独立检查；
5. 从已知安全 commit 恢复；
6. 记录时间线、影响、修复和防复发项；
7. 涉及个人信息时由分会负责人决定通知范围。

安全问题不要在公开 Issue 中粘贴可利用细节或 Secret；使用 Organization 约定的私下渠道联系负责人。
