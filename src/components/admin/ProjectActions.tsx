"use client";

import { Archive, ArrowDown, ArrowUp } from "lucide-react";
import { useTransition } from "react";

import { moveProject } from "@/app/admin/(protected)/projects/actions";
import { archiveContent } from "@/app/admin/(protected)/archive/actions";

export function ProjectActions({ id, title, readOnly = false }: { id: string; title: string; readOnly?: boolean }) {
  const [pending, startTransition] = useTransition();
  return <div className="flex"><button type="button" disabled={pending || readOnly} onClick={() => startTransition(() => moveProject(id, "up"))} className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"><span className="sr-only">Move {title} up</span><ArrowUp className="size-3.5" /></button><button type="button" disabled={pending || readOnly} onClick={() => startTransition(() => moveProject(id, "down"))} className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"><span className="sr-only">Move {title} down</span><ArrowDown className="size-3.5" /></button><button type="button" disabled={pending || readOnly} onClick={() => startTransition(() => archiveContent("project", id))} className="grid size-9 place-items-center border border-border hover:bg-accent disabled:opacity-35"><span className="sr-only">Archive {title}</span><Archive className="size-3.5" /></button></div>;
}
