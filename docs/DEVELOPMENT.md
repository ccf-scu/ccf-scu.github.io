# 本地开发

## 当前与目标环境

当前分支尚未加入 Astro 工程；下列为阶段 1 应实现的开发契约：

- Node.js：与 GitHub Actions 固定同一主版本；
- npm：使用仓库 lockfile；
- 安装：`npm ci`；
- 开发：`npm run dev`；
- 类型与内容检查：`npm run check`；
- 构建：`npm run build`；
- 预览：`npm run preview`；
- 综合验证：`npm run validate`。

在脚本真正加入 `package.json` 前，这些命令不得标为已通过。Linux lockfile 需在与 CI 一致环境生成，避免原型中 Windows 可选依赖不完整的问题。

## 首次设置

1. 克隆 Organization 正式仓库；
2. 切换到 `develop/astro-cms` 或从其创建任务分支；
3. 安装文档指定的 Node 版本；
4. 使用 `npm ci`，不要手工删除 lockfile 绕过错误；
5. 复制 `.env.example` 为本地 `.env`（仅在功能需要时）；
6. 运行 `npm run validate`；
7. 启动开发服务器并验证首页、活动和后台入口。

## 分支和任务

- 功能：`feature/<short-name>`；修复：`fix/<short-name>`；文档：`docs/<short-name>`；
- 每个任务先定义验收标准；跨模块任务使用 `.agent/PLANS.md` 格式记录执行计划；
- 不从旧 `main` 直接开发新架构；
- 不把本地构建产物提交到仓库。

## 编码约定

- TypeScript 优先，避免无理由的 `any`；
- Astro 组件使用语义 HTML，Props 定义明确；
- CSS 从小屏开始，使用设计 token，避免散落魔法数；
- 可复用状态计算放入纯函数并单测；
- 内容查询集中封装，页面不重复过滤和排序逻辑；
- 用户可编辑 URL、Markdown 和 HTML 都视为不可信输入；
- 中文 UI 文案保持清晰，后台字段带帮助文本。

## 依赖变更

新增依赖前记录：解决的问题、为何现有能力不足、前台或后台 bundle 影响、许可证、维护活跃度、安全告警和移除方式。依赖必须使用精确版本并更新 lockfile；Decap 升级须先走隔离原型。

## 环境变量

- 只把无秘密的示例键写入 `.env.example`；
- GitHub Actions Secret 只在仓库设置中保存；
- `PUBLIC_` 前缀变量会进入前端，绝不用于 Secret；
- OAuth Client Secret 不得出现在 Astro 构建产物、Pages 或 CMS 配置中。
