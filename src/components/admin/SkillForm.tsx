"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useState } from "react";

import {
  createSkill,
  type SkillActionState,
  updateSkill,
} from "@/app/admin/(protected)/skills/actions";
import { createSlug } from "@/domain/content/format";

interface SkillFormProps {
  skill?: {
    id: string;
    slug: string;
    name: string;
    category: string;
    showOnHome: boolean;
  };
  readOnly?: boolean;
}

const initialState: SkillActionState = {};
const categories = [
  "frontend",
  "backend",
  "database",
  "devops",
  "tools",
  "other",
] as const;

export function SkillForm({ skill, readOnly = false }: SkillFormProps) {
  const action = skill ? updateSkill.bind(null, skill.id) : createSkill;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(skill?.name ?? "");
  const slug = skill?.slug ?? createSlug(name);

  return (
    <form action={formAction} className="space-y-7">
      {state.error && (
        <p role="alert" className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
            Name
          </span>
          <input
            required
            maxLength={80}
            name="name"
            value={name}
            disabled={readOnly}
            onChange={(event) => setName(event.target.value)}
            aria-describedby={state.fieldErrors?.name ? "skill-name-error" : undefined}
            className="mt-2 h-12 w-full border border-input bg-background px-3 outline-none focus:border-foreground focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />
          {state.fieldErrors?.name && (
            <span id="skill-name-error" className="mt-1 block text-xs text-destructive">
              {state.fieldErrors.name[0]}
            </span>
          )}
        </label>

        <label className="block">
          <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
            Category
          </span>
          <select
            name="category"
            defaultValue={skill?.category.toLowerCase() ?? "frontend"}
            disabled={readOnly}
            className="mt-2 h-12 w-full border border-input bg-background px-3 capitalize outline-none focus:border-foreground focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
          Stable slug
        </span>
        <input type="hidden" name="slug" value={slug} />
        <output className="mt-2 block min-h-12 border border-border bg-muted px-3 py-3 font-mono text-xs text-muted-foreground">
          {slug || "generated-from-name"}
        </output>
        <span className="mt-2 block text-xs leading-5 text-muted-foreground">
          The slug is generated when creating a skill and remains immutable.
        </span>
      </label>

      <label className="flex items-start gap-3 border-y border-border py-4">
        <input
          type="checkbox"
          name="showOnHome"
          defaultChecked={skill?.showOnHome ?? false}
          disabled={readOnly}
          className="mt-0.5 size-4 accent-foreground"
        />
        <span>
          <span className="block text-sm font-semibold">Show on homepage</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Uses the master list order in the public skills marquee.
          </span>
        </span>
      </label>

      <input type="hidden" name="status" value="active" />
      <button
        type="submit"
        disabled={pending || readOnly}
        className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
        {skill ? "Save changes" : "Create skill"}
      </button>
    </form>
  );
}
