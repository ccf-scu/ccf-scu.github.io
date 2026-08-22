import type { CollectionEntry } from "astro:content";
import { categories, withBase } from "./content";

export interface SearchIndexEntry {
  title: string;
  summary: string;
  url: string;
  keywords: string;
}

export function buildSearchIndex(
  activities: CollectionEntry<"activities">[],
  members: CollectionEntry<"members">[],
): SearchIndexEntry[] {
  return [
    ...activities
      .filter((entry) => !entry.data.archived)
      .map((entry) => ({
        title: entry.data.title,
        summary: `${categories[entry.data.category]} · ${entry.data.summary}`,
        url: withBase(`/activities/${entry.id}/`),
        keywords: `${entry.data.title} ${entry.data.summary} ${categories[entry.data.category]} ${entry.body ?? ""}`,
      })),
    ...members
      .filter((entry) => entry.data.visible)
      .map((entry) => ({
        title: entry.data.name,
        summary: `${entry.data.cohort} · ${entry.data.role}`,
        url: withBase("/archive/"),
        keywords: `${entry.data.name} ${entry.data.role} ${entry.data.cohort}`,
      })),
  ];
}
