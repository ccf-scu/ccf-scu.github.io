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
    .sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || b.data.startAt.getTime() - a.data.startAt.getTime());
}

export function cohortStartYear(cohort: string) {
  const match = cohort.match(/(\d{4})\s*[–—-]/);
  return match ? Number(match[1]) : Number.NEGATIVE_INFINITY;
}

export function sortMembersByCohort<T extends { data: { cohort: string; order: number } }>(entries: T[]) {
  return [...entries].sort((a, b) => cohortStartYear(b.data.cohort) - cohortStartYear(a.data.cohort) || a.data.order - b.data.order);
}

export function visibleAnnouncements<T extends { data: { visible: boolean; featured: boolean; publishedAt: Date; expiresAt?: Date } }>(entries: T[], now = new Date()) {
  return [...entries]
    .filter((entry) => entry.data.visible && entry.data.publishedAt <= now && (!entry.data.expiresAt || entry.data.expiresAt > now))
    .sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function withBase(path: string, base = import.meta.env.BASE_URL) {
  if (/^https:\/\//.test(path)) return path;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

export const formatDate = (date: Date) => new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric" }).format(date);
