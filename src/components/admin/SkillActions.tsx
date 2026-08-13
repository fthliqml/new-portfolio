"use client";

import { Archive, ArrowDown, ArrowUp, RotateCcw, Trash2 } from "lucide-react";
import { useTransition } from "react";

import {
  deleteUnusedSkill,
  moveSkill,
  setSkillArchived,
} from "@/app/admin/(protected)/skills/actions";

interface SkillActionsProps {
  id: string;
  name: string;
  archived: boolean;
  referenceCount: number;
  readOnly?: boolean;
}

export function SkillActions({
  id,
  name,
  archived,
  referenceCount,
  readOnly = false,
}: SkillActionsProps) {
  const [pending, startTransition] = useTransition();
  const disabled = pending || readOnly;

  return (
    <div className="flex items-center gap-1">
      {!archived && (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => startTransition(() => moveSkill(id, "up"))}
            className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"
          >
            <span className="sr-only">Move {name} up</span>
            <ArrowUp className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => startTransition(() => moveSkill(id, "down"))}
            className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"
          >
            <span className="sr-only">Move {name} down</span>
            <ArrowDown className="size-3.5" aria-hidden="true" />
          </button>
        </>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => startTransition(() => setSkillArchived(id, !archived))}
        className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"
      >
        <span className="sr-only">{archived ? "Restore" : "Archive"} {name}</span>
        {archived ? <RotateCcw className="size-3.5" aria-hidden="true" /> : <Archive className="size-3.5" aria-hidden="true" />}
      </button>
      {archived && (
        <button
          type="button"
          disabled={disabled || referenceCount > 0}
          title={referenceCount > 0 ? "Referenced skills cannot be deleted" : "Delete permanently"}
          onClick={() => {
            if (window.confirm(`Permanently delete ${name}?`)) {
              startTransition(() => deleteUnusedSkill(id));
            }
          }}
          className="grid size-9 place-items-center border border-border hover:border-destructive hover:text-destructive disabled:opacity-35"
        >
          <span className="sr-only">Delete {name} permanently</span>
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
