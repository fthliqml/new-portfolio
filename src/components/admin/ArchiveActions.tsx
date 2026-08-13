"use client";

import { LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  permanentlyDeleteArchivedContent,
  restoreContent,
} from "@/app/admin/(protected)/archive/actions";
import type { ContentEntity } from "@/domain/content/lifecycle";

export function ArchiveActions({
  entity,
  id,
  title,
  impact,
  deletionBlocked,
  readOnly = false,
}: {
  entity: ContentEntity;
  id: string;
  title: string;
  impact: string;
  deletionBlocked: boolean;
  readOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const disabled = pending || readOnly;

  function remove() {
    const expected = `delete ${title}`.toLowerCase();
    const confirmation = window.prompt(
      `${impact}\n\nType “${expected}” to confirm permanent deletion.`,
    );
    if (confirmation?.trim().toLowerCase() !== expected) return;
    setError(null);
    startTransition(async () => {
      try {
        await permanentlyDeleteArchivedContent(entity, id);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Permanent deletion failed.",
        );
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => startTransition(() => restoreContent(entity, id))}
          className="inline-flex min-h-10 items-center gap-2 border border-border px-3 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] hover:bg-accent disabled:opacity-35"
        >
          {pending ? <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RotateCcw className="size-3.5" aria-hidden="true" />}
          Restore
        </button>
        <button
          type="button"
          disabled={disabled || deletionBlocked}
          title={deletionBlocked ? impact : "Delete permanently"}
          onClick={remove}
          className="inline-flex min-h-10 items-center gap-2 border border-destructive/40 px-3 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-destructive hover:bg-destructive/5 disabled:opacity-35"
        >
          <Trash2 className="size-3.5" aria-hidden="true" /> Delete
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-right text-xs text-destructive">{error}</p>}
    </div>
  );
}
