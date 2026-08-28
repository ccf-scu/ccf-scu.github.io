import type { CollectionEntry } from "astro:content";

export const categories = {
  academic: "学术引领",
  competition: "竞赛训练",
  tutoring: "学业帮扶",
  career: "生涯发展",
  organization: "组织建设",
} as const;

export type Activity = CollectionEntry<"activities">;

export function activityStatus(startAt: Date, endAt: Date, now = new Date()) {
  if (now < startAt) return "预告 / 报名中";
  if (now <= endAt) return "进行中";
  return "已结束";
}

export function sortActivities(entries: Activity[]) {
  return [...entries]
    .filter((entry) => !entry.data.archived)
    .sort((a, b) => Number(b.data.pinned) - Number(a.data.pinned) || b.data.startAt.getTime() - a.data.startAt.getTime());
}

export function cohortStartYear(cohort: string) {
  const match = cohort.match(/(\d{4})\s*[–—-]/);
  return match ? Number(match[1]) : Number.NEGATIVE_INFINITY;
}

export function sortMembersByCohort<T extends { data: { cohort: string; order: number } }>(entries: T[]) {
  return [...entries].sort((a, b) => cohortStartYear(b.data.cohort) - cohortStartYear(a.data.cohort) || a.data.order - b.data.order);
}

export function visibleAnnouncements<T extends { data: { visible: boolean; publishedAt: Date; expiresAt?: Date } }>(entries: T[], now = new Date()) {
  return [...entries]
    .filter((entry) => entry.data.visible && entry.data.publishedAt <= now && (!entry.data.expiresAt || entry.data.expiresAt > now))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function selectByIds<T extends { id: string }>(entries: T[], ids: string[], label: string): T[] {
  const index = new Map(entries.map((entry) => [entry.id, entry]));
  return ids.map((id) => {
    const entry = index.get(id);
    if (!entry) throw new Error(`${label}引用不存在：${id}`);
    return entry;
  });
}

export function selectHomepageActivities(entries: Activity[], ids: Record<"academic" | "competition" | "tutoring" | "career", string>) {
  return (Object.keys(ids) as Array<keyof typeof ids>).map((category) => {
    const entry = entries.find((candidate) => candidate.id === ids[category]);
    if (!entry) throw new Error(`首页${categories[category]}活动引用不存在：${ids[category]}`);
    if (entry.data.category !== category) throw new Error(`首页${categories[category]}活动类别不匹配：${entry.id}`);
    if (entry.data.archived) {
      const fallback = entries
        .filter((candidate) => candidate.data.category === category && !candidate.data.archived)
        .sort((a, b) => b.data.startAt.getTime() - a.data.startAt.getTime())[0];
      if (!fallback) throw new Error(`首页${categories[category]}没有可展示的未归档活动`);
      return fallback;
    }
    return entry;
  });
}

export function withBase(path: string, base = import.meta.env.BASE_URL) {
  if (/^https:\/\//.test(path)) return path;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric" });

export const formatDate = (date: Date) => dateFormatter.format(date);

export function formatDateRange(startAt: Date, endAt: Date) {
  const start = formatDate(startAt);
  const end = formatDate(endAt);
  return start === end ? start : `${start}—${end}`;
}
