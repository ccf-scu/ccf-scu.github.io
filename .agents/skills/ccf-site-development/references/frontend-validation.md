# Frontend Validation

State the target flow in one sentence. Prefer an available in-app Browser tool; otherwise use the repository Playwright flow and record the fallback.

Verify:

1. intended URL and title;
2. meaningful rendered content and no framework error overlay;
3. relevant console errors and warnings;
4. at least one real target interaction followed by an observable state check;
5. screenshot evidence for visual claims;
6. desktop and at least one mobile viewport;
7. clipping, overlap, overflow, focus, touch target, long content, missing assets and reduced motion;
8. public pages do not download CMS/editor bundles.

For release gates, cover 360, 390 and 430 px and record device/browser evidence. A successful static build alone is not frontend validation. Keep temporary screenshots, traces, and scripts out of the repository unless approved as fixtures.
