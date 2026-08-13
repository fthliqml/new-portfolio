"use client";

import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import {
  createProject,
  type ProjectActionState,
  updateProject,
} from "@/app/admin/(protected)/projects/actions";
import { OrderedTextEditor, type OrderedTextItem } from "@/components/admin/OrderedTextEditor";
import { ProjectGalleryEditor, type ProjectMediaItem } from "@/components/admin/ProjectGalleryEditor";
import { ProjectSkillSelector } from "@/components/admin/ProjectSkillSelector";
import { createSlug } from "@/domain/content/format";

interface ProjectFormProps {
  project?: {
    id: string; slug: string; title: string; role: string; category: string;
    summary: string; liveUrl: string | null; featured: boolean;
    relatedExperienceId: string | null; impactSummary: string | null;
    highlights: Array<{ id: string; text: string }>;
    contributions: Array<{ id: string; text: string }>;
    impacts: Array<{ id: string; text: string }>;
    impactStats: Array<{ id: string; value: string; label: string }>;
    skills: Array<{ skillId: string }>;
    media: Array<{ id: string; mediaAssetId: string; altText: string; label: string; description: string; isCover: boolean }>;
  };
  options: {
    experiences: Array<{ id: string; company: string; role: string }>;
    skills: Array<{ id: string; name: string; category: string }>;
    media: Array<{ id: string; originalName: string; width: number; height: number }>;
  };
  readOnly?: boolean;
}

interface ImpactStat { id: string; value: string; label: string }
const initialState: ProjectActionState = {};
const textItems = (items: Array<{ id: string; text: string }> | undefined, required = false): OrderedTextItem[] => items?.map((item) => ({ ...item })) ?? (required ? [{ id: crypto.randomUUID(), text: "" }] : []);

export function ProjectForm({ project, options, readOnly = false }: ProjectFormProps) {
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(project?.title ?? "");
  const [highlights, setHighlights] = useState(() => textItems(project?.highlights, true));
  const [contributions, setContributions] = useState(() => textItems(project?.contributions));
  const [impacts, setImpacts] = useState(() => textItems(project?.impacts));
  const [stats, setStats] = useState<ImpactStat[]>(() => project?.impactStats.map((item) => ({ ...item })) ?? []);
  const [skillIds, setSkillIds] = useState(() => project?.skills.map((item) => item.skillId) ?? []);
  const [media, setMedia] = useState<ProjectMediaItem[]>(() => project?.media.map((item) => ({ ...item })) ?? []);
  const slug = project?.slug ?? createSlug(title);

  return <form action={formAction} className="space-y-10">
    {state.error && <p role="alert" className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{state.error}</p>}
    <section className="space-y-6"><SectionTitle index="01" title="Project basics" description="Core metadata used by project cards, filters, and case-study headers." /><div className="grid gap-6 sm:grid-cols-2"><Field label="Title"><input required name="title" maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} disabled={readOnly} className="admin-input" /></Field><Field label="Role"><input required name="role" maxLength={120} defaultValue={project?.role} disabled={readOnly} className="admin-input" /></Field><Field label="Category"><select name="category" defaultValue={project?.category.toLowerCase() ?? "fullstack"} disabled={readOnly} className="admin-input"><option value="frontend">Frontend</option><option value="backend">Backend</option><option value="fullstack">Fullstack</option></select></Field><Field label="Related experience"><select name="relatedExperienceId" defaultValue={project?.relatedExperienceId ?? ""} disabled={readOnly} className="admin-input"><option value="">No relationship</option>{options.experiences.map((item) => <option key={item.id} value={item.id}>{item.company} — {item.role}</option>)}</select></Field></div><input type="hidden" name="slug" value={slug} /><div><p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Stable URL slug</p><output className="mt-2 block min-h-12 border border-border bg-muted px-3 py-3 font-mono text-xs text-muted-foreground">{slug || "generated-from-title"}</output></div><Field label="Summary"><textarea required name="summary" rows={5} defaultValue={project?.summary} disabled={readOnly} className="admin-input min-h-32 py-3" /></Field><div className="grid gap-6 sm:grid-cols-2"><Field label="Live URL"><input type="url" name="liveUrl" defaultValue={project?.liveUrl ?? ""} disabled={readOnly} className="admin-input" /></Field><label className="flex items-start gap-3 border-y border-border py-4 sm:self-end"><input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} disabled={readOnly} className="mt-0.5 size-4 accent-foreground" /><span><span className="block text-sm font-semibold">Featured project</span><span className="mt-1 block text-xs text-muted-foreground">Include on the homepage.</span></span></label></div></section>

    <section className="space-y-8"><SectionTitle index="02" title="Editorial structure" description="Ordered evidence for the public project story." /><OrderedTextEditor label="Highlights" description="At least one concise capability is required." items={highlights} onChange={setHighlights} readOnly={readOnly} required /><OrderedTextEditor label="Contributions" description="What you personally delivered." items={contributions} onChange={setContributions} readOnly={readOnly} /><Field label="Impact summary"><textarea name="impactSummary" rows={4} defaultValue={project?.impactSummary ?? ""} disabled={readOnly} className="admin-input py-3" /></Field><OrderedTextEditor label="Impacts" description="Outcomes paired with contributions." items={impacts} onChange={setImpacts} readOnly={readOnly} /><fieldset><div className="flex items-end justify-between border-b border-border pb-3"><div><legend className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Impact stats</legend><p className="mt-1 text-xs text-muted-foreground">Optional measurable values and labels.</p></div><button type="button" disabled={readOnly} onClick={() => setStats((items) => [...items, { id: crypto.randomUUID(), value: "", label: "" }])} className="inline-flex min-h-9 items-center gap-2 border border-border px-3 font-mono text-[0.58rem] uppercase"><Plus className="size-3.5" /> Add</button></div><div className="mt-4 space-y-3">{stats.map((stat, index) => <div key={stat.id} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"><input value={stat.value} onChange={(event) => setStats((items) => items.map((item) => item.id === stat.id ? { ...item, value: event.target.value } : item))} placeholder="300" disabled={readOnly} className="admin-input mt-0" aria-label={`Impact value ${index + 1}`} /><input value={stat.label} onChange={(event) => setStats((items) => items.map((item) => item.id === stat.id ? { ...item, label: event.target.value } : item))} placeholder="Employees" disabled={readOnly} className="admin-input mt-0" aria-label={`Impact label ${index + 1}`} /><button type="button" disabled={readOnly} onClick={() => setStats((items) => items.filter((item) => item.id !== stat.id))} className="grid size-12 place-items-center border border-border"><Trash2 className="size-4" /></button></div>)}</div></fieldset></section>

    <section className="space-y-8"><SectionTitle index="03" title="Stack and gallery" description="Reusable skills and verified media complete the publishable record." /><ProjectSkillSelector options={options.skills} selected={skillIds} onChange={setSkillIds} readOnly={readOnly} /><ProjectGalleryEditor options={options.media} items={media} onChange={setMedia} readOnly={readOnly} /></section>

    <input type="hidden" name="highlights" value={JSON.stringify(highlights.map((item) => item.text))} /><input type="hidden" name="contributions" value={JSON.stringify(contributions.map((item) => item.text))} /><input type="hidden" name="impacts" value={JSON.stringify(impacts.map((item) => item.text))} /><input type="hidden" name="impactStats" value={JSON.stringify(stats.map((item, position) => ({ value: item.value, label: item.label, position })))} /><input type="hidden" name="skillIds" value={JSON.stringify(skillIds)} /><input type="hidden" name="media" value={JSON.stringify(media.map((item, position) => ({ mediaAssetId: item.mediaAssetId, altText: item.altText, label: item.label, description: item.description, isCover: item.isCover, position })))} />
    <div className="sticky bottom-4 z-10 flex items-center justify-between border border-border bg-card/95 p-4 shadow-xl backdrop-blur"><p className="hidden text-xs text-muted-foreground sm:block">Saving publishes the active record immediately.</p><button type="submit" disabled={pending || readOnly} className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-40">{pending && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />}{project ? "Save project" : "Create project"}</button></div>
  </form>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">{label}</span>{children}</label>; }
function SectionTitle({ index, title, description }: { index: string; title: string; description: string }) { return <header className="grid gap-2 border-b border-border pb-4 sm:grid-cols-[3rem_minmax(0,1fr)]"><span className="font-mono text-[0.6rem] text-muted-foreground">{index}</span><div><h2 className="text-xl font-bold uppercase tracking-[-0.035em]">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></header>; }
