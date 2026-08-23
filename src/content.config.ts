import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const safeLink = z.string().refine(
  (value) => value.startsWith("/") || value.startsWith("https://"),
  "链接必须是站内路径或 HTTPS 地址",
);

const imagePath = z.string().refine(
  (value) => value.startsWith("/") || value.startsWith("https://"),
  "图片必须是站内路径或 HTTPS 地址",
);

const activities = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/activities" }),
  schema: z
    .object({
      title: z.string().min(1),
      summary: z.string().min(1),
      cover: imagePath,
      coverAlt: z.string().min(1),
      category: z.enum(["academic", "competition", "tutoring", "career", "organization"]),
      startAt: z.coerce.date(),
      endAt: z.coerce.date(),
      pinned: z.boolean().default(false),
      archived: z.boolean().default(false),
      sourceUrl: safeLink.optional(),
    })
    .refine((entry) => entry.endAt >= entry.startAt, {
      message: "活动结束时间不得早于开始时间",
      path: ["endAt"],
    }),
});

const announcements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/announcements" }),
  schema: z
    .object({
      title: z.string().min(1),
      summary: z.string().min(1),
      publishedAt: z.coerce.date(),
      expiresAt: z.coerce.date().optional(),
      visible: z.boolean().default(true),
      link: safeLink.optional(),
    })
    .refine((entry) => !entry.expiresAt || entry.expiresAt >= entry.publishedAt, {
      message: "公告失效时间不得早于发布时间",
      path: ["expiresAt"],
    }),
});

const members = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/members" }),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    cohort: z.string().min(1),
    order: z.number().int().nonnegative().default(0),
    photo: imagePath.optional(),
    photoAlt: z.string().optional(),
    visible: z.boolean().default(true),
    profileConfirmed: z.boolean().default(false),
  }),
});

const honors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/honors" }),
  schema: z.object({
    title: z.string().min(1),
    year: z.number().int().min(2000).max(2100),
    image: imagePath.optional(),
    imageAlt: z.string().optional(),
    visible: z.boolean().default(true),
  }),
});

export const collections = { activities, announcements, members, honors };
