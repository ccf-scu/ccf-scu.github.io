---
name: ccf-site-development
description: Develop, review, test, document, or finish changes in the CCF Sichuan University student chapter Astro and Decap CMS website repository. Use for site code, content schema, CMS, responsive UI, migration, CI, deployment, or repository maintenance tasks; do not use for unrelated repositories.
---

# CCF Site Development

Preserve the project's static-only production boundary, Decap CMS choice, Git history, mobile-first requirements, and current production site.

Before changing files, read the repository `AGENTS.md`, `docs/PROGRESS.md`, and the topic document relevant to the task. For complex work, follow `.agent/PLANS.md`.

Implement the smallest complete slice. Keep content schema, CMS fields, pages, validation, migration behavior, and documentation consistent. Do not load Decap or Vditor in public pages. Do not deploy a development branch to the current production Pages site.

For every task that changes files, read and execute [`references/finish-checklist.md`](references/finish-checklist.md) before reporting completion. For rendered frontend changes, also read [`references/frontend-validation.md`](references/frontend-validation.md).

Do not push, create a PR, deploy, change branch protection, or mutate external services unless the user authorized that action. A local self-contained commit is required after successful validation unless the user explicitly says not to commit or a documented blocking condition applies.
