export type MediaReference = { url: string; source: string; id: string; title: string; alt?: string };

export function extractMarkdownImages(markdown: string): Array<{ url: string; alt: string }> {
  const results: Array<{ url: string; alt: string }> = [];
  let fenced = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const pattern = /!\[([^\]]*)\]\((<?)([^\s)>]+)\2(?:\s+["'][^"']*["'])?\)/g;
    for (const match of line.matchAll(pattern)) results.push({ alt: match[1], url: match[3] });
  }
  return results;
}

export function aggregateMedia(references: MediaReference[]) {
  const byUrl = new Map<string, MediaReference & { references: Omit<MediaReference, "url">[]; count: number }>();
  for (const reference of references) {
    if (!(reference.url.startsWith("/") || reference.url.startsWith("https://"))) continue;
    const location = { source: reference.source, id: reference.id, title: reference.title, alt: reference.alt };
    const existing = byUrl.get(reference.url);
    if (existing) { existing.references.push(location); existing.count += 1; }
    else byUrl.set(reference.url, { ...reference, references: [location], count: 1 });
  }
  return [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
}
