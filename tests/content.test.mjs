import test from "node:test";
import assert from "node:assert/strict";
import { formatDateRange, selectByIds, selectHomepageActivities, sortActivities } from "../src/lib/content.ts";
import { aggregateMedia, extractMarkdownImages } from "../src/lib/media.ts";

function status(startAt, endAt, now) {
  if (now < startAt) return "预告 / 报名中";
  if (now <= endAt) return "进行中";
  return "已结束";
}

test("activity status covers upcoming, ongoing, and ended", () => {
  const start = new Date("2026-08-22T02:00:00Z");
  const end = new Date("2026-08-22T04:00:00Z");
  assert.equal(status(start, end, new Date("2026-08-22T01:00:00Z")), "预告 / 报名中");
  assert.equal(status(start, end, new Date("2026-08-22T03:00:00Z")), "进行中");
  assert.equal(status(start, end, new Date("2026-08-22T05:00:00Z")), "已结束");
});

test("activity date range omits a repeated end date on the same Shanghai calendar day", () => {
  assert.equal(
    formatDateRange(new Date("2026-07-09T00:00:00+08:00"), new Date("2026-07-09T23:59:59+08:00")),
    "2026年7月9日",
  );
  assert.equal(
    formatDateRange(new Date("2026-07-09T23:30:00+08:00"), new Date("2026-07-10T01:00:00+08:00")),
    "2026年7月9日—2026年7月10日",
  );
});

test("pinned activities sort before newer regular activities", () => {
  const entries = [
    { id: "new", data: { pinned: false, archived: false, startAt: new Date("2026-08-22") } },
    { id: "priority", data: { pinned: true, archived: false, startAt: new Date("2026-01-01") } },
  ];
  assert.equal(sortActivities(entries)[0].id, "priority");
});

test("explicit homepage references preserve order and fail on missing entries", () => {
  const entries = [{ id: "a" }, { id: "b" }];
  assert.deepEqual(selectByIds(entries, ["b", "a"], "首页内容").map(({ id }) => id), ["b", "a"]);
  assert.throws(() => selectByIds(entries, ["missing"], "首页内容"), /首页内容引用不存在/);
});

test("homepage activity slots reject a wrong category and replace an archived entry", () => {
  const entry = (id, category, archived = false, startAt = new Date("2026-01-01")) => ({ id, data: { category, archived, startAt } });
  const ids = { academic: "a", competition: "b", tutoring: "c", career: "d" };
  const valid = [entry("a", "academic"), entry("b", "competition"), entry("c", "tutoring"), entry("d", "career")];
  assert.equal(selectHomepageActivities(valid, ids).length, 4);
  assert.throws(() => selectHomepageActivities([entry("a", "career"), ...valid.slice(1)], ids), /类别不匹配/);
  const replacement = entry("career-new", "career", false, new Date("2026-02-01"));
  assert.equal(selectHomepageActivities([...valid.slice(0, 3), entry("d", "career", true), replacement], ids)[3].id, "career-new");
  assert.throws(() => selectHomepageActivities([...valid.slice(0, 3), entry("d", "career", true)], ids), /没有可展示/);
});

test("media index ignores fenced code and aggregates duplicate URLs", () => {
  const markdown = '![封面](https://img.example/a.webp)\n```md\n![忽略](https://img.example/no.webp)\n```';
  assert.deepEqual(extractMarkdownImages(markdown), [{ alt: "封面", url: "https://img.example/a.webp" }]);
  assert.equal(aggregateMedia([
    { url: "/uploads/a.webp", source: "活动", id: "a", title: "A" },
    { url: "/uploads/a.webp", source: "成员", id: "b", title: "B" },
  ])[0].count, 2);
});

test("expired announcements are excluded", () => {
  const now = new Date("2026-08-22");
  const entries = [{ visible: true, publishedAt: new Date("2026-01-01"), expiresAt: new Date("2026-02-01") }];
  assert.equal(entries.filter((entry) => entry.visible && entry.publishedAt <= now && (!entry.expiresAt || entry.expiresAt > now)).length, 0);
});

test("committee cohorts sort by their starting year instead of Chinese label text", () => {
  const cohorts = ["第一届（2011–2012）", "第十五届（2025–2026）", "第九届（2019–2020）"];
  const year = (cohort) => Number(cohort.match(/(\d{4})\s*[–—-]/)?.[1] ?? Number.NEGATIVE_INFINITY);
  cohorts.sort((a, b) => year(b) - year(a));
  assert.deepEqual(cohorts, ["第十五届（2025–2026）", "第九届（2019–2020）", "第一届（2011–2012）"]);
});
