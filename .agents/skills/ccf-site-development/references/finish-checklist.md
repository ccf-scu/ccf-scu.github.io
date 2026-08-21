# Finish Checklist

1. Inspect branch, status, unstaged diff, staged diff, and applicable instructions.
2. Run checks proportional to the changed behavior; record exact commands and outcomes.
3. For UI changes, complete the frontend validation reference.
4. Update `docs/PROGRESS.md`; update topic docs and ADRs when their contracts changed.
5. Review `.gitignore`: add only reproducible output/cache/local-secret rules; never ignore source, content, lockfiles, approved fixtures, manifests, or failure evidence.
6. Run `git diff --check` and inspect the complete diff for secrets, debug code, temporary URLs, accidental generated files, and unrelated user changes.
7. Stage only explicit task paths with `git add -- <paths>`. Never use dot, `-A`, or `--all`.
8. Inspect `git diff --cached` and create one self-contained conventional commit when validation passes.
9. Recheck status and the latest commit.
10. Report result, verification, commit hash, dirty/untracked files, risks, unverified items, and next step.

Do not claim completion or commit known-broken code when a required check fails. Do not push or deploy without authorization.
