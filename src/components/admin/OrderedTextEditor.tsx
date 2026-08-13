"use client";

import { Plus, Trash2 } from "lucide-react";

export interface OrderedTextItem {
  id: string;
  text: string;
}

export function OrderedTextEditor({
  label,
  description,
  items,
  onChange,
  readOnly = false,
  required = false,
}: {
  label: string;
  description: string;
  items: OrderedTextItem[];
  onChange: (items: OrderedTextItem[]) => void;
  readOnly?: boolean;
  required?: boolean;
}) {
  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <fieldset>
      <div className="flex items-end justify-between border-b border-border pb-3">
        <div>
          <legend className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">{label}</legend>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <button type="button" disabled={readOnly} onClick={() => onChange([...items, { id: crypto.randomUUID(), text: "" }])} className="inline-flex min-h-9 items-center gap-2 border border-border px-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] hover:bg-accent disabled:opacity-40"><Plus className="size-3.5" aria-hidden="true" /> Add</button>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <textarea required={required} value={item.text} rows={2} onChange={(event) => onChange(items.map((current) => current.id === item.id ? { ...current, text: event.target.value } : current))} disabled={readOnly} className="admin-input py-3" aria-label={`${label} ${index + 1}`} />
            <div className="flex self-start"><button type="button" disabled={readOnly || index === 0} onClick={() => move(index, -1)} className="size-9 border border-border disabled:opacity-30" aria-label={`Move ${label} ${index + 1} up`}>↑</button><button type="button" disabled={readOnly || index === items.length - 1} onClick={() => move(index, 1)} className="size-9 border border-border disabled:opacity-30" aria-label={`Move ${label} ${index + 1} down`}>↓</button><button type="button" disabled={readOnly || (required && items.length === 1)} onClick={() => onChange(items.filter((current) => current.id !== item.id))} className="grid size-9 place-items-center border border-border disabled:opacity-30" aria-label={`Remove ${label} ${index + 1}`}><Trash2 className="size-3.5" aria-hidden="true" /></button></div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
