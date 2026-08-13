"use client";

import { Archive, ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import { useTransition } from "react";

import {
  moveExperience,
  setExperienceArchived,
} from "@/app/admin/(protected)/experiences/actions";

export function ExperienceActions({
  id,
  company,
  archived,
  readOnly = false,
}: {
  id: string;
  company: string;
  archived: boolean;
  readOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const disabled = pending || readOnly;

  return (
    <div className="flex items-center gap-1">
      {!archived && (
        <>
          <button type="button" disabled={disabled} onClick={() => startTransition(() => moveExperience(id, "up"))} className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"><span className="sr-only">Move {company} up</span><ArrowUp className="size-3.5" /></button>
          <button type="button" disabled={disabled} onClick={() => startTransition(() => moveExperience(id, "down"))} className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"><span className="sr-only">Move {company} down</span><ArrowDown className="size-3.5" /></button>
        </>
      )}
      <button type="button" disabled={disabled} onClick={() => startTransition(() => setExperienceArchived(id, !archived))} className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"><span className="sr-only">{archived ? "Restore" : "Archive"} {company}</span>{archived ? <RotateCcw className="size-3.5" /> : <Archive className="size-3.5" />}</button>
    </div>
  );
}
