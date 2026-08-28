# 内容模型

## 首页展示编排

`src/data/homepage-featured.yml` 只保存首页公告和荣誉引用：公告为 1–10 个稳定 ID，荣誉至少 1 个且不可重复，二者都按列表顺序展示。四个代表活动不再放在独立编排文件中，而是与方向文案一起保存在 `homepage.yml`。活动引用不存在或类别不符时构建失败；若引用活动被归档，首页临时使用同类别中开始时间最新的未归档活动，后台会提示维护者回到首页管理确认替代项。该类别完全没有未归档活动时仍阻止构建。

活动的 `pinned` 只控制活动中心排序，不影响首页。公告和荣誉不再携带首页精选字段。

图片字段接受站内 `/...` 路径或外部 HTTPS URL。历史 `/uploads/...` 保留；新图片可使用后台本地图床上传器，公开内容中的图片会生成 `/media-index.json` 共享索引。

内容模型是前台、Decap 配置、原生 Markdown 编辑器、迁移脚本和搜索索引之间的契约。字段变更必须同步这些消费者，并提供已有内容兼容方案。

## 通用规则

- 文件名使用稳定 slug，发布后不因标题调整而改变；
- 日期时间存 ISO 8601，并明确使用 Asia/Shanghai 解释和展示；
- 可见性使用显式布尔/状态字段，不以删除文件控制；
- URL 只允许站内路径或白名单协议；
- 图片字段同时具备资源、替代文本和可选焦点/裁切信息；
- Markdown 不允许任意脚本；原始 HTML 默认关闭或清理；
- CMS、schema 和迁移脚本共用相同枚举值。

## 首页 `src/data/homepage.yml`

首页结构与装饰标签由代码锁定，维护者可改访客文案和链接：

- `hero`：眉题、两行主标题、强调词、副标题和主次按钮；
- `introduction`：标题、摘要、详情入口、固定 3 项原则、引用和署名；
- `activities`：章节标题、说明，以及固定 4 个活动方向的类别、代表活动引用、眉题、标题和说明；每个方向的文案和活动选择在同一对象维护；
- `achievements`：章节与档案文案、档案入口，以及至少 1 项可增删、可拖动的时间轴；荣誉卡仍从荣誉集合读取；
- `openSource`：章节标题和说明；按钮文字、目标 URL 与显隐从独立 `repository.yml` 读取；
- `recruitment`：状态、标题、说明、主次按钮和固定 3 项加入路径；
- `announcementLimit`：首页公告展示数量限制。首页活动区固定展示四个方向，每个方向从符合条件的活动中选择一项，不提供容易与固定布局冲突的“活动数量”设置。

三项原则、四个活动方向和三项加入路径由 Zod 与 CMS 的 `min`/`max` 同时限制，并关闭新增、删除和拖动。成果时间轴和首页荣誉以 YAML 列表顺序为唯一顺序源，允许新增、删除和拖动。动画参数、章节编号、坐标和技术状态不进入 CMS。

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
| `featured` | boolean | 是 | 在首页候选中优先；活动列表中也排在普通活动之前 |
| `showOnHomepage` | boolean | 是 | 是否可成为首页四个方向的代表活动 |
| `archived` | boolean | 是 | 隐藏但保留文件 |
| 正文 | Markdown | 是 | Decap 原生 Markdown 编辑器，保存标准 Markdown |

自动状态：当前时间早于开始时间为“预告 / 报名中”，位于区间为“进行中”，晚于结束时间为“已结束”。前端按 Asia/Shanghai 自然日显示活动时间：开始与结束在同一天时只显示一次日期，跨天时显示完整起止日期。首期没有报名截止字段，不得显示更精确的自动报名结论。

## 公告 `src/content/announcements/*.md`

字段：`title`、`summary`、`publishedAt`、`expiresAt`、`featured`、`visible`、可选 `link` 和正文。`expiresAt` 到期后退出首页，但内容文件不删除。

## 成员 `src/content/members/*.md`

字段：`name`、`role`、`cohort`、`order`、可选照片及替代文本、`visible`、`profileConfirmed` 和 Markdown 个人简介。个人简介初始为空，可写段落并插入图片；不生成独立成员详情页，点击成员卡片后在可关闭的模态介绍框中展示。`profileConfirmed: false` 时不公开正文。

## 公共 YAML

- `organization.yml`：分会名称、简介、成立信息、品牌描述和 `currentCohort`。`currentCohort` 必须与至少一条成员记录的 `cohort` 完全一致，用于“关于分会”的本届执委；历史档案仍自动按全部成员的届次分组；
- `teachers.yml`：姓名、职务/职称、简介、照片、排序、显隐；
- `links.yml`：关于页相关链接的名称、HTTP/HTTPS URL、排序和显隐，不再承载类型或跨页面用途；
- `repository.yml`：首页开源按钮的文字、HTTP/HTTPS 地址和显隐；
- `footer-links.yml`：全站页脚外链的名称、HTTP/HTTPS 地址、排序和显隐；
- `contact.yml`：邮箱、QQ群、GitHub、二维码、标签和显隐；可见项显示在页脚及“关于分会”的联系方式区，因此 QQ 群号可直接在后台更换；
- 招新状态可进入 `homepage.yml` 或独立 `recruitment.yml`，实现前以避免字段重复为准。

老师、相关链接、页脚链接、联系方式和成员都以 `order` 数字为唯一显示顺序，数字越小越靠前。CMS 对包含这些对象的 YAML 列表关闭拖动排序，避免文件位置与 `order` 产生两个相互冲突的顺序来源；首页展示引用等没有 `order` 字段的列表则以文件中的拖动顺序为准。

## 变更流程

1. 记录问题和兼容策略；
2. 更新 Astro schema 与类型；
3. 更新 Decap 字段和中文帮助；
4. 更新示例/fixture；
5. 更新查询、页面、搜索和 SEO；
6. 更新迁移脚本和本文档；
7. 验证旧内容仍可构建；
8. 必要时新增 ADR。
