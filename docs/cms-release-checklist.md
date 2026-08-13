# CMS release checklist

Use this checklist for the first Supabase cutover and every later production release. The commands assume PowerShell, pnpm, and Node.js 22. Never paste credentials into GitHub issues, pull requests, CI logs, or screenshots.

## Current readiness

Verified locally on 13 August 2026:

- [x] Prisma schema formats, validates, and generates.
- [x] Repository guard rejects tracked secrets, local agent instructions, backups, generated Prisma output, client-side server secrets, and unguarded protected actions.
- [x] Dependency audit reports zero known vulnerabilities.
- [x] Unit tests, TypeScript, ESLint, and production build pass.
- [x] Public pages remain backed by fixtures while `CONTENT_SOURCE=fixture`.
- [x] GitHub Actions runs the same `pnpm verify` gate for pull requests and `main`.
- [ ] Production migration status is clean. Requires Supabase credentials.
- [ ] Legacy import and object verification pass twice. Requires Supabase credentials.
- [ ] Authenticated admin and database-backed public smoke tests pass. Requires Supabase and deployment credentials.

## Required production environment

Configure these values in Vercel Production. Keep Preview mutations disabled.

| Variable | Scope | Initial value or source |
| --- | --- | --- |
| `DATABASE_URL` | Production | Supabase transaction pooler, port 6543, SSL required |
| `DIRECT_URL` | Production and migration shell | Supabase direct/session connection, port 5432, SSL required |
| `NEXT_PUBLIC_SUPABASE_URL` | Production and Preview | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production and Preview | Supabase publishable key; safe for browser use |
| `SUPABASE_SECRET_KEY` | Production only | Supabase secret key; server only |
| `ADMIN_USER_ID` | Production only | UUID of the single Supabase Auth owner |
| `ADMIN_EMAIL` | Production only | Normalized owner email |
| `CRON_SECRET` | Production only | Random value of at least 32 characters |
| `CONTENT_SOURCE` | Production | Start with `fixture`; change to `database` after verification |
| `CMS_MUTATIONS_ENABLED` | Production | Start with `false`; change to `true` after verification |

## Pre-deploy gate

1. Rebase the release branch on `main` and confirm the worktree is clean.
2. Run the complete local gate:

   ```powershell
   pnpm install --frozen-lockfile
   pnpm verify
   ```

3. Confirm `git ls-files .env.local AGENTS.md backups src/generated/prisma` returns nothing.
4. Review the dependency update diff and verify `pnpm security:audit` still reports zero vulnerabilities.
5. Export the current CMS before any later production migration with `pnpm cms:export`.

## Provision and migrate

1. Create one Supabase Free project and disable public Auth sign-up.
2. Create the owner with email/password in Supabase Auth. Copy its UUID into `ADMIN_USER_ID` and its normalized email into `ADMIN_EMAIL`.
3. Copy `.env.example` to `.env.local`, replace every placeholder, and leave both cutover switches disabled.
4. Apply and inspect migrations:

   ```powershell
   pnpm db:deploy
   pnpm exec prisma migrate status
   ```

5. Confirm all three migrations are applied and the `cms` schema plus private `portfolio-media` bucket exist.
6. Run the importer without writes and save the counts shown in the terminal:

   ```powershell
   pnpm import:legacy
   ```

7. Apply the import twice:

   ```powershell
   pnpm import:legacy -- --apply
   pnpm import:legacy -- --apply
   ```

8. Both apply runs must report identical source checksum, database counts, and verified Storage object count. Stop if the second run creates duplicates or changes counts.

## Deploy and cut over

1. Deploy with `CONTENT_SOURCE=fixture` and `CMS_MUTATIONS_ENABLED=false`.
2. Verify `/`, `/projects`, every known project detail route, `/sitemap.xml`, and static media return successful responses.
3. Verify `/admin` redirects an anonymous visitor to `/admin/login`; invalid credentials show a generic error; the configured owner can sign in; a different Auth user cannot enter.
4. Change only `CONTENT_SOURCE` to `database`, redeploy, and compare public content, ordering, media, metadata, and sitemap with the fixture-backed deployment.
5. Change `CMS_MUTATIONS_ENABLED` to `true` in Production and redeploy. Keep it `false` in Preview.
6. In admin, create a temporary skill, edit it, reorder it, archive it, restore it, and permanently delete it. Confirm every step changes the public result only when expected.
7. Upload a small WebP through Media, verify dimensions and alt metadata, attach it to a temporary project, confirm referenced deletion is blocked, detach it, then delete it.
8. Call `/api/maintenance` once with `Authorization: Bearer $CRON_SECRET`. Confirm `200`, database connectivity, pending-upload cleanup, and storage usage fields without logging the secret.
9. Run `pnpm cms:export`, inspect `manifest.json`, and copy the completed backup to storage outside this machine.

## Rollback

If database content, Storage, or admin behavior is wrong:

1. Set `CMS_MUTATIONS_ENABLED=false` immediately.
2. Set `CONTENT_SOURCE=fixture` and redeploy to restore the known public experience without deleting production data.
3. Preserve logs, importer output, and the latest export. Do not rerun destructive SQL manually.
4. Fix forward with a reviewed Prisma migration or restore into an empty replacement project using the procedure in `docs/cms-operations.md`.

## Release record

Record the release commit, deployment URL, operator, migration status, importer checksum/counts, smoke-test result, backup location, and rollback decision in the corresponding GitHub issue. Record only identifiers and outcomes—never secret values.
