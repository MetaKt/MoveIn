"use client";

import { FileText, Paperclip, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn, fileSize } from "@/lib/format";
import type { FileRef } from "@/lib/types";

const MAX_MB = 20;

/** Downscale an image to a small JPEG data URL so the demo can keep it in browser storage. */
async function imageToDataUrl(file: File, maxSide = 1200, quality = 0.75): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function toFileRef(file: File): Promise<FileRef> {
  const ref: FileRef = { name: file.name, size: file.size, type: file.type || "application/octet-stream", uploadedAt: new Date().toISOString() };
  if (file.type.startsWith("image/")) {
    try {
      ref.url = await imageToDataUrl(file);
    } catch {
      /* preview not available for this image */
    }
  }
  return ref;
}

export function FileUpload({
  label,
  accept,
  onFile,
  hint,
  compact,
  disabled,
}: {
  label: string;
  accept?: string;
  onFile: (f: FileRef) => void;
  hint?: string;
  compact?: boolean;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const handle = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`That file is larger than ${MAX_MB} MB.`);
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      onFile(await toFileRef(f));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <input ref={input} type="file" accept={accept} className="sr-only" onChange={(e) => handle(e.target.files)} disabled={disabled} aria-label={label} />
      {compact ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Upload className="size-4" /> {busy ? "Uploading…" : label}
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handle(e.dataTransfer.files);
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-white px-6 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
        >
          <span className="grid size-12 place-items-center rounded-full bg-brand-100 text-brand-600">
            <Upload className="size-5" />
          </span>
          <span className="text-sm font-semibold text-brand-700">{busy ? "Uploading…" : label}</span>
          {hint && <span className="text-xs text-muted">{hint}</span>}
        </button>
      )}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function FileChip({ file, label, className }: { file: FileRef; label?: string; className?: string }) {
  const isImage = file.type.startsWith("image/");
  const content = (
    <>
      {isImage && file.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.url} alt="" className="size-9 rounded-md object-cover" />
      ) : (
        <span className="grid size-9 place-items-center rounded-md bg-brand-50 text-brand-600">{isImage ? <Paperclip className="size-4" /> : <FileText className="size-4" />}</span>
      )}
      <span className="min-w-0 text-left">
        <span className="block truncate text-sm font-medium">{label ?? file.name}</span>
        <span className="block text-xs text-muted">
          {label ? `${file.name} · ` : ""}
          {fileSize(file.size)}
        </span>
      </span>
    </>
  );
  const cls = cn("flex min-w-0 items-center gap-3 rounded-xl border border-line bg-white p-2 pr-4", className);
  return file.url ? <PreviewableChip file={file} cls={cls}>{content}</PreviewableChip> : (
    <div className={cls} title="Preview is available once files are stored in Supabase">
      {content}
    </div>
  );
}

function PreviewableChip({ file, cls, children }: { file: FileRef; cls: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(cls, "hover:border-brand-300")}>
        {children}
      </button>
      {open && (
        <div role="dialog" aria-label={file.name} className="fixed inset-0 z-[1000] grid place-items-center bg-ink/70 p-4" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.url} alt={file.name} className="max-h-[85dvh] max-w-full rounded-xl bg-white object-contain shadow-2xl" />
        </div>
      )}
    </>
  );
}
