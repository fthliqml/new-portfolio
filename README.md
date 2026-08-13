# Dynamic portfolio

A Next.js portfolio with a single-owner CMS built on Prisma, Supabase Postgres, Auth, and Storage. Prisma is the authoritative public content source; versioned fixtures are retained only for repeatable bootstrap imports.

## Stack

- Next.js 16, React 19, TypeScript, and Tailwind CSS
- Prisma 7 with Supabase PostgreSQL
- Supabase SSR Auth and private Storage
- Vitest, ESLint, and repository security checks
- Vercel Hobby-compatible daily maintenance

The architecture targets Supabase Free and Vercel Hobby. No paid service is required for the expected personal-portfolio workload; quota monitoring and manual export/restore are included.

## Local development

Node.js 20.19 or newer and pnpm 11.9 are required.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Copy `.env.example` to `.env.local` and fill it with a Supabase project you control. Apply migrations and run the legacy importer before starting the site. `.env.local`, `AGENTS.md`, generated Prisma output, and local backups are ignored by Git.

## Quality gate

Run the complete release gate before opening or merging a pull request:

```powershell
pnpm verify
```

It validates Prisma, checks repository and secret boundaries, audits dependencies, runs tests and type checking, lints, and creates a production build.

## CMS workflow

The admin workspace is available at `/admin`. It manages reusable media, skills, experiences, projects, ordering, archive/restore, and guarded permanent deletion. Production mutations require both an allowlisted Supabase Auth owner and `CMS_MUTATIONS_ENABLED=true`; preview deployments remain read-only.

Start with these documents:

- [CMS operations](docs/cms-operations.md) — provisioning, maintenance, export, restore, and free-plan routine
- [Release checklist](docs/cms-release-checklist.md) — migration, import, cutover, smoke tests, and rollback
- [.env.example](.env.example) — required environment variable names and connection roles

The release checklist is the source of truth for provisioning, import verification, deployment, and rollback.
