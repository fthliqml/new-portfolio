"use client";

import { GripVertical, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import {
  createExperience,
  type ExperienceActionState,
  updateExperience,
} from "@/app/admin/(protected)/experiences/actions";
import { createSlug } from "@/domain/content/format";

interface ExperienceFormProps {
  experience?: {
    id: string;
    slug: string;
    company: string;
    role: string;
    type: string;
    summary: string;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    durationLabel: string | null;
    monogram: string;
    coverMediaId: string | null;
    imageAlt: string | null;
    highlights: Array<{ id: string; text: string }>;
  };
  mediaOptions: Array<{
    id: string;
    originalName: string;
    width: number;
    height: number;
  }>;
  readOnly?: boolean;
}

const initialState: ExperienceActionState = {};

export function ExperienceForm({
  experience,
  mediaOptions,
  readOnly = false,
}: ExperienceFormProps) {
  const action = experience
    ? updateExperience.bind(null, experience.id)
    : createExperience;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [company, setCompany] = useState(experience?.company ?? "");
  const [isCurrent, setIsCurrent] = useState(experience?.isCurrent ?? false);
  const [highlights, setHighlights] = useState(
    experience?.highlights.map((item) => ({ id: item.id, text: item.text })) ?? [
      { id: crypto.randomUUID(), text: "" },
    ],
  );
  const slug = experience?.slug ?? createSlug(company);

  function moveHighlight(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= highlights.length) return;
    setHighlights((items) => {
      const copy = [...items];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <p role="alert" className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Company" error={state.fieldErrors?.company?.[0]}>
          <input
            required
            name="company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            disabled={readOnly}
            className="admin-input"
          />
        </Field>
        <Field label="Role" error={state.fieldErrors?.role?.[0]}>
          <input required name="role" defaultValue={experience?.role} disabled={readOnly} className="admin-input" />
        </Field>
        <Field label="Type" error={state.fieldErrors?.type?.[0]}>
          <input required name="type" defaultValue={experience?.type} placeholder="Work, Intern, Trainee" disabled={readOnly} className="admin-input" />
        </Field>
        <Field label="Monogram" error={state.fieldErrors?.monogram?.[0]}>
          <input required name="monogram" maxLength={8} defaultValue={experience?.monogram} placeholder="KRA" disabled={readOnly} className="admin-input uppercase" />
        </Field>
      </div>

      <input type="hidden" name="slug" value={slug} />
      <div>
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Stable anchor</p>
        <output className="mt-2 block min-h-12 border border-border bg-muted px-3 py-3 font-mono text-xs text-muted-foreground">{slug || "generated-from-company"}</output>
      </div>

      <Field label="Summary" error={state.fieldErrors?.summary?.[0]}>
        <textarea required name="summary" rows={5} maxLength={2000} defaultValue={experience?.summary} disabled={readOnly} className="admin-input min-h-32 py-3" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Start month" error={state.fieldErrors?.startMonth?.[0]}>
          <input required type="month" name="startMonth" defaultValue={experience?.startDate.toISOString().slice(0, 7)} disabled={readOnly} className="admin-input" />
        </Field>
        <Field label="End month" error={state.fieldErrors?.endMonth?.[0]}>
          <input required={!isCurrent} type="month" name="endMonth" defaultValue={experience?.endDate?.toISOString().slice(0, 7)} disabled={readOnly || isCurrent} className="admin-input" />
        </Field>
        <Field label="Duration override" error={state.fieldErrors?.durationLabel?.[0]}>
          <input name="durationLabel" maxLength={80} defaultValue={experience?.durationLabel ?? ""} placeholder="Calculated when empty" disabled={readOnly} className="admin-input" />
        </Field>
      </div>

      <label className="flex items-start gap-3 border-y border-border py-4">
        <input type="checkbox" name="isCurrent" checked={isCurrent} onChange={(event) => setIsCurrent(event.target.checked)} disabled={readOnly} className="mt-0.5 size-4 accent-foreground" />
        <span><span className="block text-sm font-semibold">Current role</span><span className="mt-1 block text-xs text-muted-foreground">Displays “Present” and removes the end month.</span></span>
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Cover image">
          <select name="coverMediaId" defaultValue={experience?.coverMediaId ?? ""} disabled={readOnly} className="admin-input">
            <option value="">Monogram fallback</option>
            {mediaOptions.map((media) => <option key={media.id} value={media.id}>{media.originalName} ({media.width}×{media.height})</option>)}
          </select>
        </Field>
        <Field label="Cover alt text" error={state.fieldErrors?.imageAlt?.[0]}>
          <input name="imageAlt" maxLength={320} defaultValue={experience?.imageAlt ?? ""} disabled={readOnly} className="admin-input" />
        </Field>
      </div>

      <fieldset>
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div><legend className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Ordered highlights</legend><p className="mt-1 text-xs text-muted-foreground">Short scannable outcomes shown on the public card.</p></div>
          <button type="button" disabled={readOnly} onClick={() => setHighlights((items) => [...items, { id: crypto.randomUUID(), text: "" }])} className="inline-flex min-h-9 items-center gap-2 border border-border px-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] hover:bg-accent disabled:opacity-40"><Plus className="size-3.5" /> Add</button>
        </div>
        <div className="mt-4 space-y-3">
          {highlights.map((highlight, index) => (
            <div key={highlight.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
              <input required name="highlights" value={highlight.text} onChange={(event) => setHighlights((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item))} disabled={readOnly} className="admin-input" aria-label={`Highlight ${index + 1}`} />
              <div className="flex">
                <button type="button" disabled={readOnly || index === 0} onClick={() => moveHighlight(index, -1)} className="size-9 border border-border text-xs disabled:opacity-30" aria-label={`Move highlight ${index + 1} up`}>↑</button>
                <button type="button" disabled={readOnly || index === highlights.length - 1} onClick={() => moveHighlight(index, 1)} className="size-9 border border-border text-xs disabled:opacity-30" aria-label={`Move highlight ${index + 1} down`}>↓</button>
                <button type="button" disabled={readOnly || highlights.length === 1} onClick={() => setHighlights((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="grid size-9 place-items-center border border-border disabled:opacity-30" aria-label={`Remove highlight ${index + 1}`}><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={pending || readOnly} className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-40">
        {pending && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />}
        {experience ? "Save experience" : "Create experience"}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">{label}</span>{children}{error && <span className="mt-1 block text-xs text-destructive">{error}</span>}</label>;
}
