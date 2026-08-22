import CMS from "decap-cms-app";
import React from "react";
import "./admin.css";
import previewStyles from "../styles/global.css?inline";

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
for (const collection of ["activities", "announcements", "members", "honors"]) CMS.registerPreviewTemplate(collection, ContentPreview);
CMS.init();

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
