import test from "node:test";
import assert from "node:assert/strict";

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

test("featured activities sort before newer regular activities", () => {
  const entries = [
    { featured: false, startAt: new Date("2026-08-22") },
    { featured: true, startAt: new Date("2026-01-01") },
  ];
  entries.sort((a, b) => Number(b.featured) - Number(a.featured) || b.startAt - a.startAt);
  assert.equal(entries[0].featured, true);
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
