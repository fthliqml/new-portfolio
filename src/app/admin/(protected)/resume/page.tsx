import { Download, ExternalLink, FileText } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/PageHeader";
import { ResumeUploader } from "@/components/admin/ResumeUploader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdminResume } from "@/data/admin/resume";
import { formatStorageBytes } from "@/data/admin/dashboard-state";

export const metadata: Metadata = { title: "Resume" };

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default async function ResumeAdminPage() {
  const resume = await getAdminResume();
  const readOnly =
    process.env.VERCEL_ENV === "preview" ||
    process.env.CMS_MUTATIONS_ENABLED !== "true";

  return (
    <div className="mx-auto max-w-[92rem]">
      <PageHeader
        eyebrow="Owner workspace / Public document"
        title="Resume"
        description="Replace the public CV without a code change or redeploy. Visitors always use the same /resume address."
      />

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="current-resume-heading" className="overflow-hidden border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
            <h2 id="current-resume-heading" className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
              Public document
            </h2>
            <StatusBadge tone={resume ? "active" : "pending"}>
              {resume ? "Managed" : "Bundled fallback"}
            </StatusBadge>
          </div>

          <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center bg-[#111114] text-[#f4f4f1]">
                <FileText className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold tracking-[-0.02em]">
                  {resume?.originalName ?? "resume.pdf"}
                </p>
                <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {resume
                    ? `${formatStorageBytes(resume.sizeBytes)} · Updated ${formatUpdatedAt(resume.updatedAt)}`
                    : "Shipped with the current deployment"}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {resume
                    ? "This Supabase PDF is live across the hero, contact section, and structured profile data."
                    : "The original bundled PDF remains live until you publish the first managed replacement."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-border px-4 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.13em] transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ExternalLink className="size-4" aria-hidden="true" /> Preview
              </a>
              <a
                href="/resume?download=1"
                className="inline-flex min-h-11 items-center gap-2 bg-primary px-4 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Download className="size-4" aria-hidden="true" /> Download
              </a>
            </div>
          </div>
        </section>

        <ResumeUploader disabled={readOnly} hasManagedResume={Boolean(resume)} />
      </div>
    </div>
  );
}
