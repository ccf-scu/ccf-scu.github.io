import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { aggregateMedia, extractMarkdownImages, type MediaReference } from "../lib/media";
import { teachers } from "../lib/site";

export const GET: APIRoute = async () => {
  const references: MediaReference[] = [];
  const add = (url: string | undefined, source: string, id: string, title: string, alt?: string) => url && references.push({ url, source, id, title, alt });
  for (const entry of await getCollection("activities")) {
    add(entry.data.cover, "活动", entry.id, entry.data.title, entry.data.coverAlt);
    for (const image of extractMarkdownImages(entry.body ?? "")) add(image.url, "活动正文", entry.id, entry.data.title, image.alt);
  }
  for (const entry of await getCollection("members")) {
    add(entry.data.photo, "成员", entry.id, entry.data.name, entry.data.photoAlt);
    for (const image of extractMarkdownImages(entry.body ?? "")) add(image.url, "成员正文", entry.id, entry.data.name, image.alt);
  }
  for (const entry of await getCollection("honors")) add(entry.data.image, "荣誉", entry.id, entry.data.title, entry.data.imageAlt);
  teachers.forEach((teacher, index) => add(teacher.photo, "指导老师", `teacher-${index + 1}`, teacher.name, teacher.photoAlt));
  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), items: aggregateMedia(references) }), { headers: { "content-type": "application/json; charset=utf-8" } });
};
