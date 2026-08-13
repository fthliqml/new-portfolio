import type { Metadata } from "next";

import { ArchiveActions } from "@/components/admin/ArchiveActions";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getArchivedContent } from "@/data/admin/archive";

export const metadata: Metadata = { title: "Archive" };

export default async function ArchivePage() {
  const items = await getArchivedContent();
  const readOnly = process.env.VERCEL_ENV === "preview" || process.env.CMS_MUTATIONS_ENABLED !== "true";
  return <div className="mx-auto max-w-[92rem]"><PageHeader eyebrow="Owner workspace / Lifecycle" title="Archive" description="Restore reversible content or permanently remove records only after reviewing their relationships." />{items.length === 0 ? <div className="mt-8"><EmptyState label="Archive empty" title="No content is waiting here." description="Archived records disappear from public queries but retain their nested data and reusable media." /></div> : <section className="mt-8 border border-border bg-card" aria-labelledby="archive-heading"><div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 id="archive-heading" className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">Archived records / {String(items.length).padStart(2, "0")}</h2>{readOnly && <StatusBadge tone="pending">Read only</StatusBadge>}</div><ul>{items.map((item) => <li key={`${item.entity}-${item.id}`} className="grid gap-5 border-b border-border px-5 py-5 last:border-b-0 lg:grid-cols-[8rem_minmax(12rem,0.8fr)_minmax(16rem,1.2fr)_auto] lg:items-center"><span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">{item.entity}</span><div className="min-w-0"><p className="truncate font-semibold">{item.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.subtitle}</p></div><p className="text-xs leading-5 text-muted-foreground">{item.impact}</p><ArchiveActions entity={item.entity} id={item.id} title={item.title} impact={item.impact} deletionBlocked={item.entity === "skill" && item.references > 0} readOnly={readOnly} /></li>)}</ul></section>}</div>;
}
