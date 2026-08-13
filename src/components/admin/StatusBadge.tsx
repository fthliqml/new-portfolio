import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: "active" | "archived" | "pending";
}

export function StatusBadge({ children, tone = "active" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em]",
        tone === "active" && "border-[#78917b]/50 bg-[#78917b]/10",
        tone === "archived" && "border-border bg-muted text-muted-foreground",
        tone === "pending" && "border-[#b2864c]/50 bg-[#b2864c]/10",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          tone === "active" && "bg-[#78917b]",
          tone === "archived" && "bg-muted-foreground",
          tone === "pending" && "bg-[#b2864c]",
        )}
      />
      {children}
    </span>
  );
}
