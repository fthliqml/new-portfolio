"use client";

import { FileUp, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  abandonResumeUpload,
  beginResumeUpload,
  finalizeResumeUpload,
} from "@/app/admin/(protected)/resume/actions";
import { validateResumeFile } from "@/domain/resume/policy";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type UploadState = "idle" | "uploading" | "verifying";

export function ResumeUploader({
  disabled = false,
  hasManagedResume = false,
}: {
  disabled?: boolean;
  hasManagedResume?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const busy = state !== "idle";
  const stateLabel = {
    idle: hasManagedResume ? "Choose replacement PDF" : "Choose PDF",
    uploading: "Uploading PDF…",
    verifying: "Publishing resume…",
  }[state];

  async function upload(file: File) {
    setMessage(null);
    const validationError = validateResumeFile(file);
    if (validationError) {
      setMessage({ tone: "error", text: validationError });
      return;
    }

    let pendingPath: string | null = null;
    try {
      setState("uploading");
      const pending = await beginResumeUpload({
        originalName: file.name,
        mimeType: "application/pdf",
        sizeBytes: file.size,
      });
      if (!pending.ok) throw new Error(pending.error);
      pendingPath = pending.data.objectPath;

      const { error: uploadError } = await getSupabaseBrowserClient()
        .storage.from(pending.data.bucket)
        .upload(pending.data.objectPath, file, {
          contentType: "application/pdf",
          cacheControl: "31536000",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      setState("verifying");
      const finalized = await finalizeResumeUpload({
        objectPath: pending.data.objectPath,
        originalName: file.name,
        mimeType: "application/pdf",
        sizeBytes: file.size,
      });
      if (!finalized.ok) throw new Error(finalized.error);

      pendingPath = null;
      inputRef.current?.form?.reset();
      setMessage({
        tone: "success",
        text: finalized.data.cleanupWarning
          ? "Resume published. The previous Storage object needs maintenance cleanup."
          : "Resume published and the previous file was removed.",
      });
      router.refresh();
    } catch (uploadError) {
      if (pendingPath) {
        await abandonResumeUpload(pendingPath).catch(() => undefined);
      }
      setMessage({
        tone: "error",
        text:
          uploadError instanceof Error
            ? uploadError.message
            : "The resume could not be uploaded.",
      });
    } finally {
      setState("idle");
    }
  }

  return (
    <section aria-labelledby="resume-upload-heading" className="border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center bg-accent">
          <FileUp className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="resume-upload-heading" className="text-sm font-bold uppercase tracking-[-0.01em]">
            {hasManagedResume ? "Replace PDF" : "Publish PDF"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">PDF only · 5 MB maximum</p>
        </div>
      </div>

      <form className="mt-5">
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-background px-4 text-center transition-colors hover:bg-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
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
            <FileUp className="size-5" aria-hidden="true" />
          )}
          <span className="mt-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
            {stateLabel}
          </span>
          <span className="mt-2 max-w-56 text-xs leading-5 text-muted-foreground">
            The public `/resume` link switches only after Storage verifies the new PDF.
          </span>
        </label>
      </form>

      {disabled && (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Resume changes are disabled in this read-only deployment.
        </p>
      )}

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-4 border px-3 py-2 text-xs leading-5 ${
            message.tone === "error"
              ? "border-destructive/40 text-destructive"
              : "border-border bg-accent text-foreground"
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
