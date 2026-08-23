import CMS from "decap-cms-app";
import React from "react";
import "./admin.css";
import previewStyles from "../styles/global.css?inline";
import { mountAdminShell } from "./app-shell";

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
  React.createElement("div", { className: "cms-external-image-actions" },
    React.createElement("small", null, "可直接粘贴 HTTPS 图片 URL，或复用已发布图片。"),
    React.createElement("button", { type: "button", onClick: () => window.dispatchEvent(new CustomEvent("ccf:image-center:open", { detail: { select: onChange } })) }, "从图片中心选择"),
  ),
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

const initialHash = location.hash;
let shellMounted = false;
document.documentElement.dataset.adminAuthenticated = "false";
document.documentElement.dataset.adminCustomPage = "false";
const syncAdminShell = (event: Event) => {
  const authenticated = Boolean((event as CustomEvent<{ authenticated?: boolean }>).detail?.authenticated);
  document.documentElement.dataset.adminAuthenticated = String(authenticated);
  if (!authenticated) {
    document.documentElement.dataset.adminCustomPage = "false";
    return;
  }
  if (shellMounted) {
    document.documentElement.dataset.adminCustomPage = String(location.hash.startsWith("#/manage/"));
    return;
  }

  shellMounted = true;
  if (!initialHash) location.hash = "/manage/home";
  mountAdminShell();
};

addEventListener("ccf:decap-auth-change", syncAdminShell);
CMS.init();
