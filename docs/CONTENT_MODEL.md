# 内容模型

内容模型是前台、Decap 配置、Vditor、迁移脚本和搜索索引之间的契约。字段变更必须同步这些消费者，并提供已有内容兼容方案。

## 通用规则

- 文件名使用稳定 slug，发布后不因标题调整而改变；
- 日期时间存 ISO 8601，并明确使用 Asia/Shanghai 解释和展示；
- 可见性使用显式布尔/状态字段，不以删除文件控制；
- URL 只允许站内路径或白名单协议；
- 图片字段同时具备资源、替代文本和可选焦点/裁切信息；
- Markdown 不允许任意脚本；原始 HTML 默认关闭或清理；
- CMS、schema 和迁移脚本共用相同枚举值。

## 首页 `src/data/homepage.yml`

首页结构由代码锁定，维护者可改内容、顺序和显隐。计划字段：

- `hero`：标题、副标题、背景图/替代文本、主次按钮；
- `introduction`：标题、摘要、详情入口；
- `recruitment`：状态、标题、说明、按钮和链接；
- `sections`：预定义模块标识的顺序、显隐和显示数量；
- `featuredActivityLimit`、`announcementLimit`；
- 联系方式、成员、老师和友情链接只保存引用或显示设置，数据本体位于独立文件。

`sections` 只允许 `announcements`、`activities`、`about`、`recruitment`、`members`、`teachers`、`links`、`contact` 等已实现标识。

## 活动 `src/content/activities/*.md`

| 字段 | 类型 | 必填 | 约束 |
|---|---|---:|---|
| `title` | string | 是 | 非空，适合页面标题 |
| `summary` | string | 是 | 卡片和 SEO 摘要 |
| `cover` | image | 是 | 仓库资源或后续受控引用 |
| `coverAlt` | string | 是 | 描述图片内容 |
| `category` | enum | 是 | `academic` / `competition` / `tutoring` / `career` / `organization` |
| `startAt` | datetime | 是 | 上海时区解释 |
| `endAt` | datetime | 是 | 不早于 `startAt` |
| `featured` | boolean | 是 | 置顶优先 |
| `showOnHomepage` | boolean | 是 | 首页候选 |
| `archived` | boolean | 是 | 隐藏但保留文件 |
| 正文 | Markdown | 是 | Vditor 编辑，标准 Markdown |

自动状态：当前时间早于开始时间为“预告 / 报名中”，位于区间为“进行中”，晚于结束时间为“已结束”。首期没有报名截止字段，不得显示更精确的自动报名结论。

## 公告 `src/content/announcements/*.md`

字段：`title`、`summary`、`publishedAt`、`expiresAt`、`featured`、`visible`、可选 `link` 和正文。`expiresAt` 到期后退出首页，但内容文件不删除。

## 成员 `src/content/members/*.md`

字段：`name`、`role`、`cohort`、`order`、可选照片及替代文本、`visible` 和 Markdown 个人简介。个人简介初始为空，可插入图片；不生成独立成员详情页，在列表内展开或弹层展示。

## 公共 YAML

- `organization.yml`：分会名称、简介、成立信息和品牌描述；
- `teachers.yml`：姓名、职务/职称、简介、照片、排序、显隐；
- `links.yml`：名称、HTTPS URL、Logo、排序、显隐；
- `contact.yml`：邮箱、QQ群、GitHub、二维码、标签和显隐；
- 招新状态可进入 `homepage.yml` 或独立 `recruitment.yml`，实现前以避免字段重复为准。

## 变更流程

1. 记录问题和兼容策略；
2. 更新 Astro schema 与类型；
3. 更新 Decap 字段和中文帮助；
4. 更新示例/fixture；
5. 更新查询、页面、搜索和 SEO；
6. 更新迁移脚本和本文档；
7. 验证旧内容仍可构建；
8. 必要时新增 ADR。
