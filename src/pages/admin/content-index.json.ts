import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { homepage, homepageFeatured, organization, teachers, links, contacts, repository, footerLinks } from "../../lib/site";

export const GET: APIRoute = async () => {
  const [activities, announcements, members, honors] = await Promise.all([
    getCollection("activities"),
    getCollection("announcements"),
    getCollection("members"),
    getCollection("honors"),
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    homepage: {
      announcements: homepageFeatured.announcements,
      activities: homepage.activities.directions.map(({ category, activity }) => ({ category, id: activity })),
      timelineCount: homepage.achievements.timeline.length,
      honors: homepageFeatured.honors,
    },
    organization: {
      name: organization.name,
      currentCohort: organization.currentCohort,
      teacherCount: teachers.length,
      linkCount: links.length,
      contactCount: contacts.length,
      footerLinkCount: footerLinks.length,
      repositoryVisible: repository.visible,
    },
    activities: activities
      .map(({ id, data }) => ({ id, title: data.title, category: data.category, startAt: data.startAt, endAt: data.endAt, pinned: data.pinned, archived: data.archived }))
      .sort((a, b) => b.startAt.getTime() - a.startAt.getTime()),
    announcements: announcements
      .map(({ id, data }) => ({ id, title: data.title, publishedAt: data.publishedAt, visible: data.visible }))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()),
    members: members.map(({ id, data }) => ({ id, name: data.name, role: data.role, cohort: data.cohort, visible: data.visible })),
    honors: honors.map(({ id, data }) => ({ id, title: data.title, year: data.year, visible: data.visible })).sort((a, b) => b.year - a.year),
  };

  return new Response(JSON.stringify(payload), { headers: { "content-type": "application/json; charset=utf-8" } });
};
