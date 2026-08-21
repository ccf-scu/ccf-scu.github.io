import { getCollection } from "astro:content";
import { withBase } from "../lib/content";
export async function GET({ site }: { site?: URL }) {
  const base = site ?? new URL("https://ccf-scu.github.io");
  const fixed = ["/", "/activities/", "/about/", "/archive/", "/search/", "/privacy/"];
  const activities = await getCollection("activities", ({ data }) => !data.archived);
  const paths = [...fixed, ...activities.map((entry) => `/activities/${entry.id}/`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${new URL(withBase(path), base)}</loc></url>`).join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
