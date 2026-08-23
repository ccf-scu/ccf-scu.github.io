import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

type AdminIndex = {
  homepage: { announcements: string[]; activities: Record<string, string>; honors: string[] };
  organization: { name: string; currentCohort: string; teacherCount: number; linkCount: number; contactCount: number; footerLinkCount: number; repositoryVisible: boolean };
  activities: Array<{ id: string; title: string; category: string; startAt: string; endAt: string; pinned: boolean; archived: boolean }>;
  announcements: Array<{ id: string; title: string; publishedAt: string; visible: boolean }>;
  members: Array<{ id: string; name: string; role: string; cohort: string; visible: boolean }>;
  honors: Array<{ id: string; title: string; year: number; visible: boolean }>;
};

type MediaItem = { url: string; title: string; source: string; count: number; references?: Array<{ title?: string }> };
type ImageHostConfig = { endpoint: string; fileField: string; headerName: string; responsePath: string; rememberToken: boolean };
type PickerRequest = { select?: (url: string) => void };

const CONFIG_KEY = "ccf-image-host-config";
const TOKEN_KEY = "ccf-image-host-token";
const DEFAULT_CONFIG: ImageHostConfig = { endpoint: "", fileField: "file", headerName: "Authorization", responsePath: "data.url", rememberToken: false };
const categoryNames: Record<string, string> = { academic: "学术引领", competition: "竞赛训练", tutoring: "学业帮扶", career: "生涯发展", organization: "组织建设" };

const getConfig = (): ImageHostConfig => {
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "{}") }; }
  catch { return DEFAULT_CONFIG; }
};
const getToken = () => sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY) ?? "";
const resolvePath = (value: unknown, path: string) => path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, value);
const nativeCollection = (collection: string) => `#/collections/${collection}`;
const nativeEntry = (collection: string, id: string) => `#/collections/${collection}/entries/${encodeURIComponent(id)}`;
const settingEntry = (name: string) => `#/collections/settings/entries/${name}`;

const navItems = [
  ["home", "首页管理"], ["activities", "活动页面"], ["about", "关于与档案"], ["settings", "全站设置"], ["workflow", "待发布"], ["images", "图片中心"],
] as const;

function routeFromHash(hash: string) {
  const managed = hash.match(/^#\/manage\/(home|activities|about|settings|workflow|images)/)?.[1];
  if (managed) return { page: managed, custom: true };
  const collection = hash.match(/^#\/collections\/([^/]+)/)?.[1];
  if (collection === "activities") return { page: "activities", custom: false };
  if (collection === "announcements") return { page: "home", custom: false };
  if (collection === "members" || collection === "honors") return { page: "about", custom: false };
  if (collection === "settings") {
    const entry = hash.match(/\/entries\/([^/?]+)/)?.[1];
    if (entry === "homepage" || entry === "homepageFeatured") return { page: "home", custom: false };
    if (["organization", "teachers", "links"].includes(entry ?? "")) return { page: "about", custom: false };
    return { page: "settings", custom: false };
  }
  if (hash.startsWith("#/workflow")) return { page: "workflow", custom: false };
  return { page: "home", custom: true };
}

function returnPageForSettingsEntry(hash: string) {
  const entry = hash.match(/^#\/collections\/settings\/entries\/([^/?]+)/)?.[1];
  if (entry === "homepage" || entry === "homepageFeatured") return "home";
  if (["organization", "teachers", "links"].includes(entry ?? "")) return "about";
  return entry ? "settings" : undefined;
}

function Section({ title, description, action, children }: React.PropsWithChildren<{ title: string; description?: string; action?: React.ReactNode }>) {
  return <section className="admin-section"><header><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>{children}</section>;
}

function LinkCard({ href, title, description, meta }: { href: string; title: string; description: string; meta?: string }) {
  return <a className="admin-link-card" href={href}><span><strong>{title}</strong><small>{description}</small></span>{meta && <b>{meta}</b>}<i aria-hidden="true">→</i></a>;
}

function HomePage({ data }: { data: AdminIndex }) {
  const activityById = new Map(data.activities.map((item) => [item.id, item]));
  const honorById = new Map(data.honors.map((item) => [item.id, item]));
  return <>
    <Section title="页面文案" description="这里只维护访客看到的 Banner、分会简介、固定活动方向文案、开源和招募文案，不包含公告、活动或荣誉条目。" action={<a className="button button--primary" href={settingEntry("homepage")}>编辑首页文案</a>}>
      <p className="admin-section-note">三项原则、四个活动方向、三项成果时间轴和三个加入路径均为固定结构，只能修改文案。</p>
    </Section>
    <Section title="首页展示编排" description="只从已有内容中选择首页公告、四个代表活动和三项荣誉；具体内容仍在对应条目中维护。" action={<a className="button" href={settingEntry("homepageFeatured")}>调整首页展示</a>}>
      <div className="admin-summary-grid"><article><strong>首页公告</strong><b>{data.homepage.announcements.length}</b><small>条已编排</small></article><article><strong>活动槽位</strong><b>4</b><small>个固定方向</small></article><article><strong>精选荣誉</strong><b>{data.homepage.honors.length}</b><small>项成果</small></article></div>
    </Section>
    <Section title="公告" description="调整公告内容后，再到首页设置中控制展示顺序。" action={<a className="button" href={nativeCollection("announcements")}>管理全部公告</a>}>
      <div className="admin-compact-list">{data.homepage.announcements.map((id, index) => { const item = data.announcements.find((entry) => entry.id === id); return <LinkCard key={id} href={nativeEntry("announcements", id)} title={item?.title ?? id} description={`首页顺序 ${index + 1}`} meta={item?.visible === false ? "已隐藏" : "显示中"} />; })}</div>
    </Section>
    <Section title="四个活动位" description="每个方向固定一个活动，方向与所选活动类别必须一致。">
      <div className="admin-slot-grid">{Object.entries(data.homepage.activities).map(([category, id]) => { const item = activityById.get(id); return <a href={nativeEntry("activities", id)} key={category}><small>{categoryNames[category]}</small><strong>{item?.title ?? id}</strong><span>{item?.archived ? "已归档，请重新选择" : "当前展示"}</span></a>; })}</div>
    </Section>
    <Section title="三项荣誉" description="按首页出现顺序展示，点击可检查荣誉条目。">
      <div className="admin-slot-grid admin-slot-grid--three">{data.homepage.honors.map((id, index) => { const item = honorById.get(id); return <a href={nativeEntry("honors", id)} key={id}><small>第 {index + 1} 项</small><strong>{item?.title ?? id}</strong><span>{item?.year ?? "年份未知"}</span></a>; })}</div>
    </Section>
  </>;
}

function ActivitiesPage({ data }: { data: AdminIndex }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const filtered = data.activities.filter((item) => (category === "all" || item.category === category) && `${item.title} ${categoryNames[item.category]}`.toLowerCase().includes(query.toLowerCase()));
  return <Section title="活动列表" description="置顶、时间、分类和归档状态均可直接扫读。">
    <div className="admin-filters"><label><span>搜索活动</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入活动名称" /></label><label><span>分类</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">全部分类</option>{Object.entries(categoryNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
    <div className="admin-table" role="table" aria-label="活动列表"><div className="admin-table__head" role="row"><span>活动</span><span>分类</span><span>日期</span><span>状态</span></div>{filtered.map((item) => <a role="row" href={nativeEntry("activities", item.id)} key={item.id}><strong>{item.title}</strong><span>{categoryNames[item.category]}</span><time>{new Date(item.startAt).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}</time><span className="admin-status">{item.archived ? "已归档" : item.pinned ? "置顶" : "已发布"}</span></a>)}</div>
    {!filtered.length && <p className="admin-empty">没有匹配的活动。</p>}
  </Section>;
}

function AboutPage({ data }: { data: AdminIndex }) {
  const current = data.members.filter((item) => item.cohort === data.organization.currentCohort && item.visible);
  const historical = new Set(data.members.filter((item) => item.cohort !== data.organization.currentCohort).map((item) => item.cohort));
  return <>
    <Section title="分会信息" description={`${data.organization.name} · 当前届次：${data.organization.currentCohort}`}><div className="admin-card-grid"><LinkCard href={settingEntry("organization")} title="分会资料与本届届次" description="名称、简介、成立年份和当前执委届次" /><LinkCard href={settingEntry("teachers")} title="指导老师" description="姓名、职务、简介与照片" meta={`${data.organization.teacherCount} 位`} /><LinkCard href={settingEntry("links")} title="相关链接" description="关于页显示的校内外相关组织" meta={`${data.organization.linkCount} 项`} /></div></Section>
    <Section title="本届成员" description="本届与历届共用同一成员数据源，不重复维护。" action={<a className="button" href={nativeCollection("members")}>管理全部成员</a>}><div className="admin-people-list">{current.slice(0, 12).map((item) => <a href={nativeEntry("members", item.id)} key={item.id}><strong>{item.name}</strong><span>{item.role}</span></a>)}</div></Section>
    <Section title="历史档案"><div className="admin-summary-grid"><article><strong>历史届次</strong><b>{historical.size}</b><small>届</small></article><article><strong>成员记录</strong><b>{data.members.length}</b><small>条</small></article><article><strong>荣誉记录</strong><b>{data.honors.length}</b><small>条</small></article></div><div className="admin-inline-actions"><a className="button" href={nativeCollection("members")}>查看历届成员</a><a className="button" href={nativeCollection("honors")}>管理荣誉记录</a></div></Section>
  </>;
}

function SettingsPage({ data }: { data: AdminIndex }) {
  return <><Section title="联系方式"><LinkCard href={settingEntry("contact")} title="联系方式与 QQ 群" description="关于页和招募区使用的公开联系信息" meta={`${data.organization.contactCount} 项`} /></Section><Section title="页脚与开源"><div className="admin-card-grid"><LinkCard href={settingEntry("footerLinks")} title="页脚链接" description="全站页脚的低频维护链接" meta={`${data.organization.footerLinkCount} 项`} /><LinkCard href={settingEntry("repository")} title="开源仓库入口" description="首页开源章节使用的仓库地址" meta={data.organization.repositoryVisible ? "显示中" : "已隐藏"} /></div></Section><Section title="图片服务"><LinkCard href="#/manage/images" title="图片中心与本地图床配置" description="共享图片、上传接口和当前浏览器凭据在图片中心统一管理" /></Section></>;
}

function WorkflowPage() {
  return <Section title="待发布内容" description="每条内容独立审核与发布，不合并为发布批次。"><div className="admin-empty admin-empty--large"><strong>待发布内容由 Decap 工作流实时读取</strong><p>进入审核列表后，可逐条查看改动、继续编辑或发布。不会改变已发布内容。</p><a className="button button--primary" href="#/workflow">打开待发布列表</a></div></Section>;
}

function ImageCenter({ picker, onClose }: { picker?: PickerRequest; onClose?: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([]); const [query, setQuery] = useState(""); const [source, setSource] = useState("all");
  const [selected, setSelected] = useState<MediaItem | null>(null); const [settingsOpen, setSettingsOpen] = useState(false); const [config, setConfig] = useState<ImageHostConfig>(getConfig); const [token, setToken] = useState(getToken); const [status, setStatus] = useState("");
  useEffect(() => { fetch(new URL("media-index.json", new URL(import.meta.env.BASE_URL, location.origin))).then((response) => response.json()).then((payload) => setItems(Array.isArray(payload.items) ? payload.items : [])).catch(() => setStatus("图片索引读取失败，请稍后重试。")); }, []);
  const sources = useMemo(() => Array.from(new Set(items.map((item) => item.source))), [items]);
  const filtered = items.filter((item) => (source === "all" || item.source === source) && `${item.title} ${item.url} ${item.source}`.toLowerCase().includes(query.toLowerCase()));
  const save = () => { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); (config.rememberToken ? localStorage : sessionStorage).setItem(TOKEN_KEY, token); setStatus("配置已保存在当前浏览器。"); };
  const clear = () => { localStorage.removeItem(CONFIG_KEY); localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); setConfig(DEFAULT_CONFIG); setToken(""); setStatus("本地图床配置已清除。"); };
  const upload = async (file?: File) => { if (!file) return; if (file.size > 10 * 1024 * 1024) return setStatus("图片超过 10 MB 限制。"); if (!config.endpoint.startsWith("https://")) return setStatus("请先保存 HTTPS 上传接口。"); setStatus("正在上传…"); try { const body = new FormData(); body.append(config.fileField || "file", file); const headers: Record<string, string> = {}; if (token) headers[config.headerName] = token; const response = await fetch(config.endpoint, { method: "POST", headers, body }); if (!response.ok) throw new Error(`图床返回 HTTP ${response.status}`); const url = resolvePath(await response.json(), config.responsePath); if (typeof url !== "string" || !url.startsWith("https://")) throw new Error("响应中未找到有效 HTTPS 图片 URL"); const item = { url, title: file.name, source: "最近上传", count: 0 }; setItems((current) => [item, ...current]); setSelected(item); setStatus("上传成功，可立即复制或选择。"); } catch (error) { setStatus(error instanceof TypeError ? "上传失败：网络或 CORS 拒绝。" : `上传失败：${error instanceof Error ? error.message : "未知错误"}`); } };
  const choose = (url: string) => { if (picker?.select) { picker.select(url); onClose?.(); } else navigator.clipboard.writeText(url).then(() => setStatus("图片 URL 已复制。")); };
  return <div className="image-center-page">
    <div className="image-center-tools"><label><span>搜索图片</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="标题、URL 或来源" /></label><label><span>来源</span><select value={source} onChange={(event) => setSource(event.target.value)}><option value="all">全部来源</option>{sources.map((item) => <option key={item}>{item}</option>)}</select></label><label className="button button--primary image-upload">上传图片<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => upload(event.target.files?.[0])} /></label></div>
    <button className="image-settings-toggle" type="button" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)}>图床连接设置 <span>{settingsOpen ? "收起" : "展开"}</span></button>
    {settingsOpen && <div className="image-settings"><div className="image-settings__grid"><label>上传接口 URL<input type="url" value={config.endpoint} onChange={(event) => setConfig({ ...config, endpoint: event.target.value })} placeholder="https://…" /></label><label>文件字段名<input value={config.fileField} onChange={(event) => setConfig({ ...config, fileField: event.target.value })} /></label><label>认证 Header<input value={config.headerName} onChange={(event) => setConfig({ ...config, headerName: event.target.value })} /></label><label>响应 URL 路径<input value={config.responsePath} onChange={(event) => setConfig({ ...config, responsePath: event.target.value })} /></label><label>Token<input type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} /></label><label className="checkbox"><input type="checkbox" checked={config.rememberToken} onChange={(event) => setConfig({ ...config, rememberToken: event.target.checked })} />仅在这台私人设备长期记住 Token</label></div><div className="admin-inline-actions"><button className="button button--primary" type="button" onClick={save}>保存本机配置</button><button className="button button--danger" type="button" onClick={() => confirm("清除当前浏览器中的图床配置和 Token？") && clear()}>清除配置</button></div></div>}
    {status && <p className="admin-notice" role="status">{status}</p>}
    <div className="image-center-layout"><div><p className="image-count">{filtered.length} 张已发布图片</p><div className="image-grid">{filtered.map((item) => <button type="button" className={selected?.url === item.url ? "is-selected" : ""} onClick={() => setSelected(item)} key={`${item.url}-${item.source}`}><img src={item.url} alt="" loading="lazy" /><strong>{item.title}</strong><small>{item.source} · {item.count} 处引用</small></button>)}</div>{!filtered.length && <p className="admin-empty">没有匹配图片。</p>}</div><aside className="image-detail">{selected ? <><img src={selected.url} alt="所选图片预览" /><small>{selected.source}</small><h3>{selected.title}</h3><code>{selected.url}</code><p>{selected.count} 处已发布引用</p><button className="button button--primary" type="button" onClick={() => choose(selected.url)}>{picker ? "选择这张图片" : "复制图片 URL"}</button></> : <><strong>图片详情</strong><p>选择一张图片以查看 URL、来源和引用信息。</p></>}</aside></div>
  </div>;
}

function AppShell() {
  const [hash, setHash] = useState(location.hash || "#/manage/home"); const [data, setData] = useState<AdminIndex | null>(null); const [mobileOpen, setMobileOpen] = useState(false); const [picker, setPicker] = useState<PickerRequest | undefined>(); const menuButton = useRef<HTMLButtonElement>(null); const closeMenuButton = useRef<HTMLButtonElement>(null); const previousHash = useRef(hash);
  const route = routeFromHash(hash); const current = navItems.find(([key]) => key === route.page) ?? navItems[0];
  useEffect(() => { if (!location.hash) location.hash = "/manage/home"; const update = () => { window.scrollTo(0, 0); requestAnimationFrame(() => window.scrollTo(0, 0)); const nextHash = location.hash; const returnPage = returnPageForSettingsEntry(previousHash.current); if (nextHash === "#/collections/settings" && returnPage) { previousHash.current = `#/manage/${returnPage}`; location.hash = `/manage/${returnPage}`; return; } previousHash.current = nextHash; setHash(nextHash); setMobileOpen(false); }; addEventListener("hashchange", update); fetch(new URL("admin/content-index.json", new URL(import.meta.env.BASE_URL, location.origin))).then((response) => response.json()).then(setData); const openPicker = (event: Event) => setPicker((event as CustomEvent<PickerRequest>).detail ?? {}); addEventListener("ccf:image-center:open", openPicker); return () => { removeEventListener("hashchange", update); removeEventListener("ccf:image-center:open", openPicker); }; }, []);
  useEffect(() => { document.documentElement.dataset.adminCustomPage = String(route.custom); }, [route.custom]);
  useEffect(() => { if (!mobileOpen) return; closeMenuButton.current?.focus(); const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeMobile(); }; addEventListener("keydown", closeOnEscape); return () => removeEventListener("keydown", closeOnEscape); }, [mobileOpen]);
  const closeMobile = () => { setMobileOpen(false); requestAnimationFrame(() => menuButton.current?.focus()); };
  const descriptions: Record<string, string> = { home: "首页文案、公告、活动位和荣誉编排", activities: "活动内容、置顶、分类与归档", about: "分会信息、本届成员与历史记录", settings: "联系方式、页脚与低频全站配置", workflow: "逐条审核并发布暂存内容", images: "共享图片、上传与引用信息" };
  const content = data && route.custom ? route.page === "home" ? <HomePage data={data} /> : route.page === "activities" ? <ActivitiesPage data={data} /> : route.page === "about" ? <AboutPage data={data} /> : route.page === "settings" ? <SettingsPage data={data} /> : route.page === "workflow" ? <WorkflowPage /> : <ImageCenter /> : null;
  return <div className="admin-shell">
    <button ref={menuButton} className="admin-mobile-trigger" type="button" aria-expanded={mobileOpen} aria-controls="admin-navigation" onClick={() => setMobileOpen(true)}>菜单<span>{current[1]}</span></button>
    {mobileOpen && <button className="admin-nav-backdrop" type="button" aria-label="关闭导航遮罩" onClick={closeMobile} />}
    <aside id="admin-navigation" className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="后台主导航" aria-modal={mobileOpen ? "true" : undefined} role={mobileOpen ? "dialog" : undefined}><div className="admin-brand"><img src={new URL("images/brand/ccf-logo.png", new URL(import.meta.env.BASE_URL, location.origin)).href} alt="" /><div><strong>CCF@SCU</strong><small>内容管理后台</small></div><button ref={closeMenuButton} type="button" aria-label="关闭导航" onClick={closeMobile}>×</button></div><a className="admin-frontend-link" href={new URL(import.meta.env.BASE_URL, location.origin).href}>← 返回前台</a><nav>{navItems.map(([key, label], index) => <a href={`#/manage/${key}`} className={route.page === key ? "is-active" : ""} aria-current={route.page === key ? "page" : undefined} key={key}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}</nav><footer><small>静态站点 · Git 审核发布</small></footer></aside>
    <main className="admin-main"><header className="admin-page-header"><div><p>内容后台 / {current[1]}</p><h1>{route.custom ? current[1] : `编辑内容 · ${current[1]}`}</h1><span>{route.custom ? descriptions[route.page] : "完成后保存到待发布；取消可返回所属页面。"}</span></div>{route.custom && route.page === "activities" ? <a className="button button--primary" href="#/collections/activities/new">新建活动</a> : !route.custom ? <a className="button" href={`#/manage/${route.page}`}>返回{current[1]}</a> : null}</header>
      <div id="admin-custom-workspace" hidden={!route.custom}>{data ? content : <p className="admin-loading">正在读取内容索引…</p>}</div>
      <div id="decap-workspace-slot" />
    </main>
    {picker && <div className="image-picker" role="dialog" aria-modal="true" aria-label="从图片中心选择"><div className="image-picker__shell"><header><div><small>图片字段</small><h2>从图片中心选择</h2></div><button type="button" aria-label="关闭" onClick={() => setPicker(undefined)}>×</button></header><ImageCenter picker={picker} onClose={() => setPicker(undefined)} /></div></div>}
  </div>;
}

export function mountAdminShell() {
  const root = document.getElementById("admin-shell-root");
  if (!root) throw new Error("Missing #admin-shell-root");
  createRoot(root).render(<AppShell />);
}
