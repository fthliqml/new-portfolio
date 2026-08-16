# Portfolio CMS operations

This CMS is designed to run on Supabase Free and Vercel Hobby without a paid subscription. Keep the workload small, export regularly, and treat the local backup as the recovery source because automatic database backups are not included on Supabase Free.

## Current free-tier envelope

As checked on 13 August 2026, Supabase Free includes a 500 MB database quota, 1 GB file storage, and 5 GB egress. Free projects can pause after one week without activity. The admin dashboard warns when tracked media crosses 80% of the 1 GB allowance. Confirm limits on the [official Supabase pricing page](https://supabase.com/pricing) before making capacity decisions.

Vercel Hobby permits daily cron execution but not a more frequent schedule, and invocation can occur at any point in the configured UTC hour. The project therefore runs one idempotent maintenance request at `03:00 UTC` each day. See [Vercel cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing).

## Initial provisioning and cutover

1. Create one Supabase project on the Free plan.
2. Disable public sign-up in Supabase Auth and create the single owner email/password user.
3. Copy `.env.example` to `.env.local` and replace every placeholder. Never commit this file.
4. Set `ADMIN_USER_ID` to the Auth user's UUID and `ADMIN_EMAIL` to the same normalized email.
5. Generate a random `CRON_SECRET` with at least 32 characters.
6. Run `pnpm db:deploy` using the direct/session database URL.
7. Run `pnpm import:legacy` and inspect the dry-run counts.
8. Run `pnpm import:legacy -- --apply` twice. Both runs must report the same database counts, source checksum, and verified object count.
9. Sign in to `/admin`, inspect every content section, and compare all public routes.
10. Set `CMS_MUTATIONS_ENABLED=true` only in the production environment. Preview deployments remain read-only by policy.

## Daily maintenance

`vercel.json` calls `GET /api/maintenance` once per day. Vercel sends `Authorization: Bearer $CRON_SECRET`. Unauthorized calls return `401`.

The route:

- checks database connectivity;
- deletes Storage objects and rows left `PENDING` for more than one hour;
- reports tracked media and resume bytes plus the free-tier warning state;
- is safe to retry because cleanup selects only still-pending rows.

For a manual production check, send the same bearer header. Do not place the secret in a URL or log it.

## Export

Run:

```powershell
pnpm cms:export
```

The command loads `.env.local`, creates a new timestamped directory under `backups/`, exports all managed metadata, downloads every referenced ready media object and the active resume, records SHA-256 checksums, and writes `manifest.json`. The entire `backups/` directory is ignored by Git.

Copy completed backup directories to storage you already control. A local disk copy is not a backup if it stays on the same machine.

## Restore

Restore only into an empty database or the same database lineage represented by the backup:

```powershell
pnpm cms:restore -- --input=backups/cms-YYYY-MM-DDTHH-MM-SS
```

The command rejects paths outside `backups/`, validates the manifest checksum and every media or resume checksum before writing, uploads objects with their original paths, and upserts records with their original IDs. Re-running the same restore is idempotent. Backups created before managed resumes were introduced remain valid.

After restore, verify:

1. the reported counts match the export;
2. `/admin/media` has no missing referenced objects;
3. project and experience relations are intact;
4. archived records remain absent from public pages and sitemap;
5. the restored database is connected only after those checks pass.

## Resume replacement

Open `/admin/resume` to inspect or replace the public resume. Uploads must be non-empty PDF files no larger than 5 MB. The browser uploads the candidate directly to the `portfolio-files` bucket, then the server verifies the stored MIME type and size before switching the singleton resume record. The previously active object is removed only after the database switch succeeds.

All public resume buttons link to `/resume`, so replacing the object does not require editing page content. Until the first managed upload succeeds, `/resume` redirects to the bundled `public/resume.pdf`. Keep that file in the repository as a deploy-safe fallback.

The `portfolio-files` bucket is public for document delivery, while insert, update, and delete policies restrict browser writes to the authenticated owner's UUID folder. The secret key remains server-only.

## Monthly free-plan routine

- Export and copy the backup off the development machine.
- Review Supabase database and Storage usage dashboards, including the active resume.
- Delete unused media through the admin library; referenced media is protected.
- Review maintenance failures in Vercel logs before the Hobby one-hour log window expires.
- Open the public site and admin at least weekly if you want to reduce the chance of inactivity pausing.
