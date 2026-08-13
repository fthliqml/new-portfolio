"use client";

export function ProjectSkillSelector({
  options,
  selected,
  onChange,
  readOnly = false,
}: {
  options: Array<{ id: string; name: string; category: string }>;
  selected: string[];
  onChange: (ids: string[]) => void;
  readOnly?: boolean;
}) {
  function move(id: string, offset: number) {
    const index = selected.indexOf(id);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= selected.length) return;
    const copy = [...selected];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <fieldset>
      <legend className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Technology stack</legend>
      <p className="mt-1 text-xs text-muted-foreground">Selection order becomes the public project stack order.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map((skill) => {
          const index = selected.indexOf(skill.id);
          const checked = index >= 0;
          return <div key={skill.id} className="flex min-h-12 items-center gap-3 border border-border bg-background px-3"><input type="checkbox" checked={checked} disabled={readOnly} onChange={(event) => onChange(event.target.checked ? [...selected, skill.id] : selected.filter((id) => id !== skill.id))} className="size-4 accent-foreground" aria-label={`Select ${skill.name}`} /><span className="min-w-0 flex-1 truncate text-sm font-semibold">{skill.name}</span><span className="font-mono text-[0.52rem] uppercase text-muted-foreground">{skill.category.toLowerCase()}</span>{checked && <div className="flex"><button type="button" disabled={readOnly || index === 0} onClick={() => move(skill.id, -1)} className="size-7 border border-border text-xs disabled:opacity-30" aria-label={`Move ${skill.name} up`}>↑</button><button type="button" disabled={readOnly || index === selected.length - 1} onClick={() => move(skill.id, 1)} className="size-7 border border-border text-xs disabled:opacity-30" aria-label={`Move ${skill.name} down`}>↓</button></div>}</div>;
        })}
      </div>
    </fieldset>
  );
}
