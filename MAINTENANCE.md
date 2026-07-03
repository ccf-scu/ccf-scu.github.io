# CCF 川大学生分会网站维护规范

## 文件结构

```
ccf-scu.github.io/
├── index.html              # 主页（单页面）
├── activities.html         # 全部活动（含分类筛选）
├── team-history.html       # 历届执委（第1~15届）
├── css/style.css           # 全局样式
├── js/main.js              # 导航、滚动动画
├── images/
│   ├── honors/             # 荣誉证书图片
│   ├── spp/                # SPP 海报
│   ├── activities/         # 活动缩略图（72×48px）
│   ├── photo/              # 执委头像（正方形）
│   ├── ccf-logo.png
│   ├── scu-logo.png
│   └── nav-title.png
├── fonts/                  # HarmonyOS Sans SC 字体
├── CHANGELOG.md
└── MAINTENANCE.md
```

## 页面导航约定

所有页面共享相同的 `<header>` 导航栏。当前页面对应的链接加 `class="nav-current"`：

```html
<!-- 主页 index.html -->
<a href="#about">关于分会</a>
<a href="#activities">活动方向</a>
<a href="#events">活动开展</a>
<a href="#team">执委团队</a>
<a href="team-history.html">历届执委</a>
<a href="#join">加入我们</a>

<!-- 子页面（activities.html / team-history.html）用绝对路径 -->
<a href="index.html#about">关于分会</a>
<a href="index.html#activities">活动方向</a>
<a href="activities.html" class="nav-current">活动开展</a>  <!-- 当前页 -->
```

## 一、新增活动

### 1.1 活动数据规范

每条活动包含：
- `data-category`：分类标识
- `.tl-date`：日期（MM-DD 或 MM-DD 至 MM-DD）
- `.tl-tag`：分类标签（小徽章）
- `.tl-title`：活动标题
- `.tl-summary`：摘要（可选）
- `.tl-thumb`：缩略图

### 1.2 分类对照

| data-category | 标签文字 | CSS 类 | 标签颜色 |
|---------------|----------|--------|----------|
| `academic` | 学术引领 | `tag-academic` | 红 #9b2335 |
| `competition` | 竞赛训练 | `tag-competition` | 蓝 #2563eb |
| `tutoring` | 学业帮扶 | `tag-tutoring` | 绿 #16a34a |
| `career` | 生涯发展 | `tag-career` | 橙 #d97706 |
| `org` | 组织建设 | `tag-org` | 灰 #6b7280 |

### 1.3 模板

**无摘要**（主页 index.html 的缩进为 32 空格）：
```html
                            <div class="tl-item" data-category="分类">
                                <span class="tl-date">MM-DD</span>
                                <span class="tl-tag tag-分类">标签文字</span>
                                <span class="tl-title">活动标题</span>
                                <div class="tl-thumb"><img src="images/activities/YYYY-MM-DD-slug.jpg" alt="" loading="lazy" /></div>
                            </div>
```

**有摘要**（摘要和图片在同一行）：
```html
                            <div class="tl-item" data-category="分类">
                                <span class="tl-date">MM-DD</span>
                                <span class="tl-tag tag-分类">标签文字</span>
                                <span class="tl-title">活动标题</span>
                                <span class="tl-summary">摘要文字</span><div class="tl-thumb"><img src="images/activities/YYYY-MM-DD-slug.jpg" alt="" loading="lazy" /></div>
                            </div>
```

### 1.4 操作步骤

1. **缩略图**：放入 `images/activities/`，命名 `YYYY-MM-DD-slug.jpg`。暂无图片则使用 `placeholder.png`
2. **主页**：在 `index.html` 的 `<!-- Events Timeline -->` 区块中，找到 `.tl-year.current` > `.tl-items`，按日期倒序插入条目
3. **活动页**：在 `activities.html` 中同样位置插入（注意缩进为 36 空格）
4. **2025 年折叠区**：旧年份活动在主页的 `.tl-old#old2025` 中。如活动跨年，新一年放在 `.tl-year.current`
5. **更新 CHANGELOG**

### 1.5 图片命名

格式：`YYYY-MM-DD-简短英文描述.jpg`

已有图片可直接在 `01-活动材料归档/` 中搜索引擎匹配命名规则的文件，拷贝到 `images/activities/` 后更新 HTML 中 `placeholder.png` → 实际文件名。

## 二、更新执委

### 2.1 换届操作

1. **主页本届执委**：在 `index.html` 的 `#team` 中修改 `.team-grid` 内的 `.member-card`
2. **旧届移至历届页**：将上一届的数据作为新 `.team-section` 添加到 `team-history.html` 顶部（第15届之后）
3. **更新届别编号**：新一届为第 N+1 届

### 2.2 执委卡片模板

```html
<div class="member-card">
    <div class="member-avatar">
        <img src="images/photo/姓名.jpg" alt="姓名" />  <!-- 有照片 -->
        <!-- 或 &#128100; 占位 -->
    </div>
    <div class="member-name">姓名</div>
    <div class="member-role">职务</div>
    <div class="member-bio">202X级XX专业博士/硕士研究生</div>  <!-- 可选 -->
</div>
```

有个人主页链接：
```html
<div class="member-name"><a href="https://example.com" target="_blank" rel="noopener">姓名</a></div>
```

### 2.3 头像

- 放入 `images/photo/`，命名为 `姓名.jpg`
- 在 `index.html` 和 `team-history.html` 中搜索该姓名，替换 `&#128100;` 为 `<img src="images/photo/姓名.jpg" alt="姓名" />`

## 三、更新荣誉证书

### 3.1 模板

```html
<div class="honor-scroll-item">
    <img loading="lazy" decoding="async" src="images/honors/文件名.jpg" alt="描述" />
    <div class="caption">20XX年 奖项名称</div>
</div>
```

### 3.2 分类

两个分类在 `index.html` 的 `.honors` 区块中：
- **中国计算机学会授予**：CCF 颁发的荣誉
- **四川大学授予**：学校颁发的荣誉（十佳百佳、学术型社团优秀奖等）

### 3.3 证书尺寸

- **CCF 授予（竖版）**：`.honor-scroll` 默认样式，310px 高 + `object-fit: cover`
- **四川大学授予（横版）**：`.honor-scroll` 需加 `honor-landscape` 类，160px 高 + `object-fit: contain`

```html
<!-- 横版证书的滚动容器需加 honor-landscape -->
<div class="honor-scroll honor-landscape">
```

### 3.4 操作

1. 证书图片放入 `images/honors/`
2. 在对应 `.honor-category` 的 `.honor-scroll` 中添加条目
3. CCF 证书不加额外类，四川大学证书容器加 `honor-landscape`
4. 注意 `<img>` 属性：`loading="lazy" decoding="async"`

## 四、CSS 约定

### 4.1 品牌色
- 主色（CCF 红）：`#9b2335`
- 深色背景：`#111827`
- 正文：`#374151`
- 辅助文字：`#6b7280` / `#9ca3af`
- 浅背景：`#f9fafb` / `#fafbfc`

### 4.2 响应式断点
- `@media (max-width: 768px)` — 平板/小屏
- `@media (max-width: 480px)` — 手机

### 4.3 字体
- HarmonyOS Sans SC（4 个字重：400/500/700/900）
- 回退：`-apple-system, "Microsoft YaHei", "PingFang SC", sans-serif`

## 五、JS 约定

`js/main.js` 仅负责：
1. 移动端汉堡菜单开关
2. IntersectionObserver 滚动渐入动画（选择器列表中需保持更新）

筛选逻辑内嵌在 `activities.html` 的 `<script>` 标签中（`data-category` + `filter-btn`）。

时间轴折叠逻辑在 `index.html` 中（`toggleOld(btn, id)` 函数）。

## 六、常见操作清单

| 操作 | 涉及文件 | 关键注意 |
|------|----------|----------|
| 新年活动 | `index.html` + `activities.html` | 两处同步插入，注意缩进 |
| 年终归档 | `index.html` | 移至 `.tl-old` 折叠区，旧年份按钮需更新 |
| 换届 | `index.html` + `team-history.html` | 主页替换，历届页追加 |
| 更新照片 | `index.html` + `team-history.html` | 搜索姓名替换占位符 |
| 新增荣誉 | `index.html` | 确认分类后追加 |
| 加个人主页链接 | `index.html` + `team-history.html` | `.member-name` 内包 `<a>` |
| 更新导航 | 所有 HTML 文件 | 当前页加 `nav-current`，子页面用绝对路径 |

## 七、部署

推送 `main` 分支即可触发 GitHub Pages 自动部署：
```bash
git add -A && git commit -m "描述" && git push origin main
```

部署状态在 https://github.com/ccf-scu/ccf-scu.github.io/actions 查看。
