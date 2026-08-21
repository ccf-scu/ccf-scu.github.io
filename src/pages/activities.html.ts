import { withBase } from "../lib/content";
export function GET() {
  const target = withBase("/activities/");
  return new Response(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>正在前往活动中心</title></head><body><p><a href="${target}">前往新版活动中心</a></p></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
