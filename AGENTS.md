# AGENTS.md

CCF 四川大学学生分会网站 — GitHub Pages 静态站点

## Quick Facts

- **Tech**: Pure HTML/CSS/JS, no build step, no framework
- **Pages**: `index.html` (home), `activities.html` (timeline), `team-history.html` (committee history)
- **Deploy**: Push to `main` → GitHub Pages auto-deploys
- **Local preview**: `npx serve .` or `python -m http.server 8000`
- **Maintenance guide**: See `MAINTENANCE.md` for detailed workflows

## Critical Conventions

### Navigation Links
- Current page gets `class="nav-current"`
- Sub-pages use absolute paths: `href="index.html#about"`
- All 3 HTML files share identical `<header>` — update all when changing nav

### Activity Entries (in `index.html` and `activities.html`)
- Template: `<div class="tl-item" data-category="分类">` with `.tl-date`, `.tl-tag`, `.tl-title`, `.tl-summary`, `.tl-thumb`
- Categories: `academic` (红), `competition` (蓝), `tutoring` (绿), `career` (橙), `org` (灰)
- Indentation: `index.html` uses 32 spaces, `activities.html` uses 36 spaces
- Image naming: `YYYY-MM-DD-slug.jpg` in `images/activities/`

### Visitor Map (bottom of all pages)
- Uses LiveTrafficFeed 3D Globe Widget for real-time visitor tracking
- Shows rotating 3D globe with visitor location markers
- Do NOT use MapMyVisitors — map tiles fail to load (only shows blue background)
- Do NOT use 2D version — use 3D globe instead
- Current implementation: LiveTrafficFeed 3D globe, 500px width, CCF red markers (#9b2335)

### CSS/JS Architecture
- Single CSS file: `css/style.css`
- Single JS file: `js/main.js` (hamburger menu + IntersectionObserver)
- Filter logic is inline in `activities.html`
- Timeline collapse logic is inline in `index.html`

### Brand Colors
- CCF Red: `#9b2335`
- Dark bg: `#111827`
- Text: `#374151`
- Muted: `#6b7280` / `#9ca3af`

### Responsive Breakpoints
- `@media (max-width: 768px)` — tablet
- `@media (max-width: 480px)` — mobile

### Fonts
- HarmonyOS Sans SC (weights: 400/500/700/900)
- Fallback: `-apple-system, "Microsoft YaHei", "PingFang SC", sans-serif`

## Common Pitfalls

1. **Updating nav?** Must edit all 3 HTML files
2. **Adding activity?** Insert in both `index.html` AND `activities.html`
3. **Honor certificates?** CCF awards: default style; Sichuan Univ awards: add `honor-landscape` class
4. **Member photos?** Search name in both `index.html` and `team-history.html`, replace `&#128100;` placeholder
5. **Visitor map broken?** Check that `map.png` is used, not `map.js`

## File Ownership

| Area | Files |
|------|-------|
| Homepage | `index.html` |
| Activities | `index.html` (current year) + `activities.html` (all) |
| Committee | `index.html` (current) + `team-history.html` (history) |
| Styles | `css/style.css` |
| Interactions | `js/main.js` + inline `<script>` in HTML |
| Images | `images/activities/`, `images/photo/`, `images/honors/` |

## References

- `MAINTENANCE.md` — Complete maintenance workflows (activities, committee, honors, CSS/JS conventions)
- `CHANGELOG.md` — Recent changes and decisions
- `README.md` — Project overview and local setup
