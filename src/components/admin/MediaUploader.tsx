"use client";

import imageCompression from "browser-image-compression";
import { ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";

import {
  abandonMediaUpload,
  beginMediaUpload,
  finalizeMediaUpload,
} from "@/app/admin/(protected)/media/actions";
import { mediaPolicy, validateMediaFile } from "@/domain/media/policy";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type UploadState = "idle" | "preparing" | "uploading" | "verifying";

async function prepareImage(file: File) {
  const compressed = await imageCompression(file, {
    fileType: "image/webp",
    maxSizeMB: 1.9,
    maxWidthOrHeight: mediaPolicy.maxDimension,
    useWebWorker: true,
    initialQuality: 0.86,
  });
  const image = await createImageBitmap(compressed);
  const prepared = new File([compressed], file.name, { type: "image/webp" });

  return { file: prepared, width: image.width, height: image.height };
}

export function MediaUploader({ disabled = false }: { disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const busy = state !== "idle";
  const stateLabel = {
    idle: "Choose image",
    preparing: "Preparing WebP…",
    uploading: "Uploading…",
    verifying: "Verifying…",
  }[state];

  async function upload(file: File) {
    setError(null);
    const validationError = validateMediaFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    let pendingId: string | null = null;
    try {
      setState("preparing");
      const prepared = await prepareImage(file);
      if (prepared.file.size > mediaPolicy.targetBytes) {
        throw new Error("The optimized image is still larger than 2 MB.");
      }

      const pending = await beginMediaUpload({
        originalName: file.name,
        mimeType: "image/webp",
        sizeBytes: prepared.file.size,
        width: prepared.width,
        height: prepared.height,
      });
      if (!pending.ok) throw new Error(pending.error);
      pendingId = pending.data.id;

      setState("uploading");
      const { error: storageError } = await getSupabaseBrowserClient()
        .storage.from(pending.data.bucket)
        .upload(pending.data.objectPath, prepared.file, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: false,
        });
      if (storageError) throw storageError;

      setState("verifying");
      const finalized = await finalizeMediaUpload(pendingId);
      if (!finalized.ok) throw new Error(finalized.error);

      inputRef.current?.form?.reset();
    } catch (uploadError) {
      if (pendingId) await abandonMediaUpload(pendingId).catch(() => undefined);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded.",
      );
    } finally {
      setState("idle");
    }
  }

  return (
    <section aria-labelledby="upload-heading" className="border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center bg-accent">
          <ImagePlus className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="upload-heading" className="text-sm font-bold uppercase tracking-[-0.01em]">
            Upload image
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, or WebP · 10 MB input · 2 MB target
          </p>
        </div>
      </div>

      <form className="mt-5">
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-background px-4 text-center transition-colors hover:bg-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || disabled}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          {busy ? (
            <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Upload className="size-5" aria-hidden="true" />
          )}
          <span className="mt-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
            {stateLabel}
          </span>
        </label>
      </form>

      {disabled && (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Uploads are disabled in this read-only deployment.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 border border-destructive/40 px-3 py-2 text-xs leading-5 text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
