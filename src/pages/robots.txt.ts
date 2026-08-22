import { withBase } from "../lib/content";

export function GET({ site }: { site?: URL }) {
  const origin = site?.origin ?? "https://ccf-scu.github.io";
  return new Response(`User-agent: *\nAllow: ${withBase("/")}\nDisallow: ${withBase("/admin/")}\nSitemap: ${new URL(withBase("/sitemap.xml"), origin)}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
