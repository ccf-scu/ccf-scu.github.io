import { z, type ZodType } from "astro/zod";
import YAML from "yaml";
import homepageSource from "../data/homepage.yml?raw";
import organizationSource from "../data/organization.yml?raw";
import teachersSource from "../data/teachers.yml?raw";
import linksSource from "../data/links.yml?raw";
import contactSource from "../data/contact.yml?raw";

const linkSchema = z.string().refine((value) => value.startsWith("/") || value.startsWith("https://"));
const optionalImage = z.string().refine((value) => value.startsWith("/") || value.startsWith("https://")).optional();

const homepageSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    primaryLabel: z.string(),
    primaryLink: linkSchema,
    secondaryLabel: z.string(),
    secondaryLink: linkSchema,
  }),
  introduction: z.object({ title: z.string(), summary: z.string() }),
  recruitment: z.object({ status: z.enum(["open", "closed", "preparing"]), title: z.string(), summary: z.string() }),
  featuredActivityLimit: z.number().int().min(1).max(12),
  announcementLimit: z.number().int().min(1).max(10),
});

const organizationSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  description: z.string(),
  founded: z.string(),
  chapterNumber: z.string(),
});

const teachersSchema = z.object({ teachers: z.array(z.object({ name: z.string(), title: z.string(), summary: z.string(), photo: optionalImage, photoAlt: z.string().optional(), order: z.number(), visible: z.boolean() })) });
const linksSchema = z.object({ links: z.array(z.object({ name: z.string(), url: z.string().refine((value) => value.startsWith("https://")), category: z.enum(["official", "partner", "community"]), order: z.number(), visible: z.boolean() })) });
const contactSchema = z.object({ contacts: z.array(z.object({ label: z.string(), value: z.string(), link: linkSchema.optional(), order: z.number(), visible: z.boolean() })) });

function parse<T>(source: string, schema: ZodType<T>): T {
  return schema.parse(YAML.parse(source));
}

export const homepage = parse(homepageSource, homepageSchema);
export const organization = parse(organizationSource, organizationSchema);
export const teachers = parse(teachersSource, teachersSchema).teachers.filter((entry) => entry.visible).sort((a, b) => a.order - b.order);
export const links = parse(linksSource, linksSchema).links.filter((entry) => entry.visible).sort((a, b) => a.order - b.order);
export const contacts = parse(contactSource, contactSchema).contacts.filter((entry) => entry.visible).sort((a, b) => a.order - b.order);
