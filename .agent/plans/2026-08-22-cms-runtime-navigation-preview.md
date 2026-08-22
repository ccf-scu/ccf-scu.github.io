# CMS 原生 Markdown、页面导航与预览修复

## 目的与用户可见结果
后台移除 Vditor 并不再请求 unpkg；集合按前台首页、活动中心、关于分会、历史档案清晰排列；Markdown 预览渲染为内容而非源码；保存失败时给出可操作的 GitHub 组织授权说明。

## 范围与明确不做
修改 Decap 配置/预览、移除 Vditor 依赖并更新运维文档。OAuth App 组织授权是 GitHub 外部管理设置，代码不能代替组织所有者批准；不关闭组织安全限制，不提交凭据。

## 当前事实与相关文件
- 原 `src/admin/main.tsx` 的 Vditor 会动态访问 unpkg，且与 Decap 生命周期和预览重复。
- `public/admin/config.yml` 将老师、链接等藏在单个“站点设置”集合，活动预览被关闭。
- 当前 OAuth Token 已被 `ccf-scu` 组织的 OAuth App access restrictions 拒绝写入。

## 验收标准
- 后台依赖中不存在 Vditor，运行时网络请求不存在 unpkg。
- 后台侧栏标签明确对应四个前台页面，指导老师和相关链接入口可直接找到。
- 正文预览显示格式化 Markdown，并使用前台基础视觉样式。
- 文档写明成员申请及组织所有者批准路径；不得宣称代码能够绕过 GitHub 限制。
- 类型、内容、构建、桌面和移动浏览器验证通过。

## 分阶段步骤
1. 移除 Vditor 并切换全部正文到 Decap 原生 Markdown widget。
2. 重组 Decap 集合标签与文件集合，修正预览组件和样式。
3. 更新 OAuth 授权与页面字段映射文档。
4. 执行自动检查和真实浏览器验证。
5. 提交、合入 main、发布并线上冒烟。

## 进度（带时间）
- 2026-08-22：完成问题定位，开始实现。
- 2026-08-22：完成原生 Markdown、页面化导航、预览与移动端适配；进入生产发布。

## 发现与证据
- Vditor 3.11.2 默认动态加载 unpkg 资源；用户确认改用 Decap 原生 Markdown，删除这条运行链路。
- GitHub 官方说明：启用 OAuth App access restrictions 时，成员须请求组织访问，组织所有者在 OAuth app policy 中批准。

## 决策记录
- 使用 Decap 原生 Markdown，避免第三方编辑器适配层和额外资源。
- 保持组织 OAuth 限制开启，采用批准当前 OAuth App 的最小变更路径。

## 验证命令与结果
- `npm run validate`：通过；Astro 0 错误/警告/提示，Node 12 项通过，内容与 34 页面构建校验通过。
- `CMS_LOCAL=1` 本地 CMS E2E：1 项通过，覆盖导航、原生编辑、格式化预览、移动布局及无 unpkg 请求。
- `npm run test:e2e`：13 项通过、1 项本地模式专项按预期跳过。
- Edge 桌面与 390px 移动截图人工检查：预览格式正确，移动表单无页面级横向溢出。

## 风险与回滚
- Decap 版本升级可能改变 Markdown 工具栏或预览行为，需保留登录后 E2E。
- 可 revert 本任务提交恢复原 CMS，但不会改变 GitHub 组织策略。

## 未完成项与下一步
- 发布到 `main` 并执行线上冒烟；组织所有者批准 OAuth App 后，由真实维护者复测保存、重开和图片上传。
