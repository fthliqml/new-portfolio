"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export interface ProjectMediaItem {
  id: string;
  mediaAssetId: string;
  altText: string;
  label: string;
  description: string;
  isCover: boolean;
}

export function ProjectGalleryEditor({ options, items, onChange, readOnly = false }: { options: Array<{ id: string; originalName: string; width: number; height: number }>; items: ProjectMediaItem[]; onChange: (items: ProjectMediaItem[]) => void; readOnly?: boolean }) {
  const [assetId, setAssetId] = useState("");
  function move(index: number, offset: number) { const target = index + offset; if (target < 0 || target >= items.length) return; const copy = [...items]; [copy[index], copy[target]] = [copy[target], copy[index]]; onChange(copy); }
  function update(id: string, patch: Partial<ProjectMediaItem>) { onChange(items.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  const available = options.filter((option) => !items.some((item) => item.mediaAssetId === option.id));

  return <fieldset><legend className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Project gallery</legend><p className="mt-1 text-xs text-muted-foreground">Every active project needs media metadata and exactly one cover.</p><div className="mt-4 flex gap-2"><select value={assetId} onChange={(event) => setAssetId(event.target.value)} disabled={readOnly} className="admin-input mt-0"><option value="">Choose verified media…</option>{available.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName} ({asset.width}×{asset.height})</option>)}</select><button type="button" disabled={readOnly || !assetId} onClick={() => { const asset = options.find((option) => option.id === assetId); if (!asset) return; onChange([...items, { id: crypto.randomUUID(), mediaAssetId: asset.id, altText: "", label: asset.originalName.replace(/\.[^.]+$/, ""), description: "", isCover: items.length === 0 }]); setAssetId(""); }} className="inline-flex min-h-12 items-center gap-2 border border-border px-4 font-mono text-[0.58rem] uppercase"><Plus className="size-3.5" /> Add</button></div><div className="mt-5 space-y-5">{items.map((item, index) => { const asset = options.find((option) => option.id === item.mediaAssetId); return <article key={item.id} className="border border-border bg-background p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{asset?.originalName ?? "Missing media"}</p><label className="mt-2 flex items-center gap-2 text-xs"><input type="radio" name="project-cover" checked={item.isCover} disabled={readOnly} onChange={() => onChange(items.map((current) => ({ ...current, isCover: current.id === item.id })))} /> Cover image</label></div><div className="flex"><button type="button" disabled={readOnly || index === 0} onClick={() => move(index, -1)} className="size-9 border border-border disabled:opacity-30" aria-label={`Move image ${index + 1} up`}>↑</button><button type="button" disabled={readOnly || index === items.length - 1} onClick={() => move(index, 1)} className="size-9 border border-border disabled:opacity-30" aria-label={`Move image ${index + 1} down`}>↓</button><button type="button" disabled={readOnly} onClick={() => { const remaining = items.filter((current) => current.id !== item.id); if (item.isCover && remaining[0]) remaining[0] = { ...remaining[0], isCover: true }; onChange(remaining); }} className="grid size-9 place-items-center border border-border"><Trash2 className="size-3.5" /></button></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Label<input value={item.label} onChange={(event) => update(item.id, { label: event.target.value })} disabled={readOnly} className="admin-input" /></label><label className="text-xs font-semibold">Alt text<input value={item.altText} onChange={(event) => update(item.id, { altText: event.target.value })} disabled={readOnly} className="admin-input" /></label></div><label className="mt-4 block text-xs font-semibold">Description<textarea value={item.description} onChange={(event) => update(item.id, { description: event.target.value })} disabled={readOnly} rows={2} className="admin-input py-3" /></label></article>; })}</div></fieldset>;
}
