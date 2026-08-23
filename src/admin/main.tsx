import CMS from "decap-cms-app";
import React from "react";
import "./admin.css";
import previewStyles from "../styles/global.css?inline";

const IMAGE_PROTOCOL = /^(https:\/\/|\/)/i;
const ExternalImageControl = ({ value, onChange, forID, classNameWrapper }: { value?: string; onChange(value: string): void; forID?: string; classNameWrapper?: string }) => React.createElement("div", { className: classNameWrapper },
  React.createElement("input", {
    id: forID,
    type: "url",
    value: value ?? "",
    placeholder: "https://images.example.com/photo.webp 或 /uploads/...",
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value.trim()),
    pattern: "https://.*|/.*",
  }),
  React.createElement("small", null, "可直接粘贴 HTTPS 图片 URL；也可从右上角“图片中心”复制共享图片 URL。"),
  value && IMAGE_PROTOCOL.test(value) ? React.createElement("img", { src: value, alt: "图片预览", className: "cms-external-image-preview" }) : null,
);

const ExternalImagePreview = ({ value }: { value?: string }) => value && IMAGE_PROTOCOL.test(value)
  ? React.createElement("img", { src: value, alt: "所选图片预览", className: "cms-external-image-preview" })
  : null;

CMS.registerWidget("external-image", ExternalImageControl, ExternalImagePreview);

const ContentPreview = ({ entry, widgetFor }: { entry: { getIn(path: string[]): unknown }; widgetFor(name: string): React.ReactNode }) => {
  const title = entry.getIn(["data", "title"]) ?? entry.getIn(["data", "name"]) ?? "内容预览";
  const summary = entry.getIn(["data", "summary"]);
  return React.createElement("main", { className: "cms-content-preview" },
    React.createElement("p", { className: "eyebrow" }, "CCF@SCU · 内容预览"),
    React.createElement("h1", null, String(title)),
    summary ? React.createElement("p", { className: "cms-preview-summary" }, String(summary)) : null,
    React.createElement("article", { className: "prose" }, widgetFor("body")),
  );
};

CMS.registerPreviewStyle(previewStyles, { raw: true });
CMS.registerPreviewStyle(".cms-content-preview{max-width:860px;margin:0 auto;padding:48px 32px}.cms-content-preview h1{font-size:clamp(2rem,6vw,4.5rem);margin:.25em 0}.cms-preview-summary{font-size:1.1rem;color:#667085;margin-bottom:2rem}", { raw: true });
for (const collection of ["activities", "announcements", "members"]) CMS.registerPreviewTemplate(collection, ContentPreview);
CMS.init();

type ImageHostConfig = { endpoint: string; fileField: string; headerName: string; responsePath: string; rememberToken: boolean };
const configKey = "ccf-image-host-config";
const tokenKey = "ccf-image-host-token";
const getConfig = (): ImageHostConfig => {
  try { return { endpoint: "", fileField: "file", headerName: "Authorization", responsePath: "data.url", rememberToken: false, ...JSON.parse(localStorage.getItem(configKey) ?? "{}") }; }
  catch { return { endpoint: "", fileField: "file", headerName: "Authorization", responsePath: "data.url", rememberToken: false }; }
};
const getToken = () => sessionStorage.getItem(tokenKey) ?? localStorage.getItem(tokenKey) ?? "";
const resolvePath = (value: unknown, path: string) => path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, value);
const escapeHtml = (value: unknown) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

const openImageCenter = async () => {
  document.querySelector(".cms-image-center")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = "cms-image-center";
  dialog.innerHTML = `<form method="dialog" class="cms-image-center__shell"><header><div><small>全站设置</small><h2>图片中心</h2></div><button value="close" aria-label="关闭">×</button></header><section class="cms-image-host"><h3>本地图床配置</h3><div class="cms-image-host__grid"><label>上传接口 URL<input name="endpoint" type="url" placeholder="https://..." /></label><label>文件字段名<input name="fileField" value="file" /></label><label>认证 Header<input name="headerName" value="Authorization" /></label><label>响应 URL 路径<input name="responsePath" value="data.url" /></label><label>Token<input name="token" type="password" autocomplete="off" /></label><label class="cms-image-host__remember"><input name="rememberToken" type="checkbox" />仅在这台私人设备长期记住 Token</label></div><div><button type="button" data-save-config>保存本机配置</button><button type="button" data-clear-config>清除配置</button><label class="cms-upload">上传新图片<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-upload /></label><span data-upload-status></span></div></section><section><div class="cms-image-search"><input type="search" placeholder="搜索标题、URL 或来源" data-media-search /><span data-media-count></span></div><div class="cms-media-grid" data-media-grid><p>正在读取已发布图片…</p></div></section></form>`;
  document.body.append(dialog);
  const config = getConfig();
  const form = dialog.querySelector<HTMLFormElement>("form")!;
  for (const key of ["endpoint", "fileField", "headerName", "responsePath"] as const) (form.elements.namedItem(key) as HTMLInputElement).value = config[key];
  (form.elements.namedItem("rememberToken") as HTMLInputElement).checked = config.rememberToken;
  (form.elements.namedItem("token") as HTMLInputElement).value = getToken();
  const status = dialog.querySelector<HTMLElement>("[data-upload-status]")!;
  dialog.querySelector("[data-save-config]")?.addEventListener("click", () => {
    const next = Object.fromEntries(new FormData(form)) as unknown as ImageHostConfig;
    next.rememberToken = (form.elements.namedItem("rememberToken") as HTMLInputElement).checked;
    const token = (form.elements.namedItem("token") as HTMLInputElement).value;
    localStorage.setItem(configKey, JSON.stringify({ endpoint: next.endpoint, fileField: next.fileField || "file", headerName: next.headerName || "Authorization", responsePath: next.responsePath || "data.url", rememberToken: next.rememberToken }));
    sessionStorage.removeItem(tokenKey); localStorage.removeItem(tokenKey);
    (next.rememberToken ? localStorage : sessionStorage).setItem(tokenKey, token);
    status.textContent = "配置已保存在当前浏览器。";
  });
  dialog.querySelector("[data-clear-config]")?.addEventListener("click", () => { localStorage.removeItem(configKey); localStorage.removeItem(tokenKey); sessionStorage.removeItem(tokenKey); status.textContent = "本地图床配置已清除。"; });
  dialog.querySelector<HTMLInputElement>("[data-upload]")?.addEventListener("change", async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { status.textContent = "图片超过 10 MB 限制。"; return; }
    const current = getConfig();
    if (!current.endpoint.startsWith("https://")) { status.textContent = "请先保存 HTTPS 上传接口。"; return; }
    status.textContent = "正在上传…";
    try {
      const body = new FormData(); body.append(current.fileField || "file", file);
      const headers: Record<string, string> = {}; if (getToken()) headers[current.headerName] = getToken();
      const response = await fetch(current.endpoint, { method: "POST", headers, body });
      if (!response.ok) throw new Error(`图床返回 HTTP ${response.status}`);
      const url = resolvePath(await response.json(), current.responsePath);
      if (typeof url !== "string" || !url.startsWith("https://")) throw new Error("响应中未找到有效 HTTPS 图片 URL");
      await navigator.clipboard.writeText(url); status.textContent = "上传成功，图片 URL 已复制。";
    } catch (error) { status.textContent = error instanceof TypeError ? "上传失败：网络或 CORS 拒绝。" : `上传失败：${error instanceof Error ? error.message : "未知错误"}`; }
  });
  const indexUrl = new URL("media-index.json", new URL(import.meta.env.BASE_URL, location.origin)).href;
  const payload = await fetch(indexUrl).then((response) => response.json()).catch(() => ({ items: [] }));
  const items = Array.isArray(payload.items) ? payload.items : [];
  const grid = dialog.querySelector<HTMLElement>("[data-media-grid]")!;
  const count = dialog.querySelector<HTMLElement>("[data-media-count]")!;
  const render = (query = "") => {
    const filtered = items.filter((item: { url: string; title: string; source: string }) => `${item.url} ${item.title} ${item.source}`.toLowerCase().includes(query.toLowerCase()));
    count.textContent = `${filtered.length} 张已发布图片`;
    grid.innerHTML = filtered.map((item: { url: string; title: string; source: string; count: number }) => `<article><img src="${escapeHtml(item.url)}" alt="" loading="lazy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.source)} · ${Number(item.count)} 处引用</small><button type="button" data-copy-url="${escapeHtml(item.url)}">复制 URL</button></article>`).join("") || "<p>没有匹配图片。</p>";
  };
  render();
  dialog.querySelector<HTMLInputElement>("[data-media-search]")?.addEventListener("input", (event) => render((event.currentTarget as HTMLInputElement).value));
  grid.addEventListener("click", async (event) => { const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-copy-url]"); if (button?.dataset.copyUrl) { await navigator.clipboard.writeText(button.dataset.copyUrl); button.textContent = "已复制"; } });
  dialog.showModal();
};

const imageCenterButton = document.createElement("button");
imageCenterButton.type = "button"; imageCenterButton.className = "cms-image-center-button"; imageCenterButton.textContent = "图片中心";
imageCenterButton.addEventListener("click", openImageCenter);
document.body.append(imageCenterButton);

const labelFrontendLink = () => {
  const frontendUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')) {
    if (link.href !== frontendUrl) continue;
    if (link.textContent !== "返回前台") link.textContent = "返回前台";
    if (link.getAttribute("aria-label") !== "返回前台") link.setAttribute("aria-label", "返回前台");
  }
};

labelFrontendLink();
new MutationObserver(labelFrontendLink).observe(document.body, { childList: true, subtree: true });
