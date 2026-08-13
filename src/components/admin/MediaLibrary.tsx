"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";

import { deleteMediaAsset } from "@/app/admin/(protected)/media/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatStorageBytes } from "@/data/admin/dashboard-state";

interface MediaAsset {
  id: string;
  originalName: string;
  sizeBytes: number;
  width: number;
  height: number;
  status: "pending" | "ready";
  publicUrl: string | null;
  referenceCount: number;
}

export function MediaLibrary({
  assets,
  readOnly = false,
}: {
  assets: MediaAsset[];
  readOnly?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(asset: MediaAsset) {
    const confirmed = window.confirm(
      `Delete ${asset.originalName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteMediaAsset(asset.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <section aria-labelledby="library-heading" className="min-w-0">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 id="library-heading" className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
          Media library / {String(assets.length).padStart(2, "0")}
        </h2>
        {isPending && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-label="Updating media library" />}
      </div>

      {error && (
        <p role="alert" className="mt-4 border border-destructive/40 bg-card px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <ul className="mt-5 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
        {assets.map((asset) => (
          <li key={asset.id} className="border border-border bg-card">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {asset.publicUrl && asset.status === "ready" ? (
                <Image
                  src={asset.publicUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1536px) 22vw, (min-width: 640px) 35vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Awaiting verification
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" title={asset.originalName}>
                    {asset.originalName}
                  </p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.11em] text-muted-foreground">
                    {asset.width} × {asset.height} · {formatStorageBytes(asset.sizeBytes)}
                  </p>
                </div>
                <StatusBadge tone={asset.status === "ready" ? "active" : "pending"}>
                  {asset.status}
                </StatusBadge>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">
                  {asset.referenceCount} {asset.referenceCount === 1 ? "use" : "uses"}
                </p>
                <button
                  type="button"
                  disabled={readOnly || isPending || asset.referenceCount > 0}
                  onClick={() => remove(asset)}
                  title={
                    readOnly
                      ? "Media changes are disabled in this deployment"
                      : asset.referenceCount > 0
                        ? "Remove content references before deleting"
                        : "Delete image"
                  }
                  className="grid size-9 place-items-center border border-border transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <span className="sr-only">Delete {asset.originalName}</span>
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
