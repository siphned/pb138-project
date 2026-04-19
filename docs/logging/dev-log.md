# Development Log — Migration & Setup

Date: 2026-04-12

Summary
- Migrated repository from GitLab (gitlab.fi.muni.cz/xsinogl/pb138-project) to GitHub (github.com/siphned/pb138-project).
- Preserved full commit history and branches.
- Recreated merge requests as GitHub pull requests and adjusted bases for `feature/docs-*` branches to target `feature/docs`.
- Added a GitHub Actions CI workflow that mirrors the original `.gitlab-ci.yml` pipeline.

Actions performed
1. Created a WIP commit to capture local changes: `chore(migration): save WIP before GitHub migration`.
2. Created private GitHub repository `siphned/pb138-project` and added it as `origin`.
3. Pushed all local branches and tags to GitHub over HTTPS (SSH keys for GitHub were not used).
4. Added `.github/workflows/ci.yml` implementing install → lint → typecheck → build → test jobs using Bun.
5. Created GitHub PRs for feature branches and retargeted `feature/docs-*` PRs to base `feature/docs`.
6. Removed local `gitlab` remote to avoid accidental pushes to the old upstream.

Notes & issues encountered
- SSH to `gitlab.fi.muni.cz` failed (permission denied); used HTTPS to push to GitHub instead.
- Two `feature/docs-*` branches had no new commits relative to `feature/docs`, so GitHub refused to retarget their PRs; they should be merged locally into `feature/docs` if needed before closing.

Next steps
- Recreate CI secrets and protected branch rules on GitHub (tokens, registry auth, etc.).
- Confirm the `feature/docs -> dev` PR (#1) and merge flow with the team.
- Replace remaining GitLab repository links in docs (this repo has been updated where possible).
- Keep this log up to date with any further migration steps or issues.

Entries
- 2026-04-12: Migration performed. See Actions performed above.

Maintainer: siphned (repo owner) — update this file when additional migration changes occur.
