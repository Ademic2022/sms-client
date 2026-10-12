"use client";

import { useRef, useState } from "react";

import { deleteFile, uploadFile } from "@/lib/api";

import { IconUpload } from "./icons";
import { Button, ErrorNote, Spinner, cx } from "./ui";

/**
 * An image slot with preview, upload, replace and remove. The server resizes and
 * re-encodes whatever is uploaded, so any reasonable PNG or JPG is fine.
 */
export function ImageUpload({
  label,
  hint,
  url,
  endpoint,
  onChange,
  shape = "square",
  emptyText = "No image yet",
}: {
  label: string;
  hint?: string;
  url: string | null | undefined;
  endpoint: string;
  onChange: (url: string | null) => void;
  shape?: "square" | "portrait" | "wide" | "circle";
  emptyText?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const { ok, body } = await uploadFile(endpoint, file);
      if (!ok) throw new Error(body.error ?? "The upload failed.");
      onChange(body.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await deleteFile(endpoint);
      onChange(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const frame = {
    square: "h-28 w-28 rounded-xl",
    portrait: "h-32 w-26 rounded-xl",
    wide: "h-24 w-48 rounded-xl",
    circle: "h-28 w-28 rounded-full",
  }[shape];

  return (
    <div>
      <div className="mb-1.5 text-[13px] font-medium text-ink">{label}</div>
      <div className="flex items-center gap-4">
        <div
          className={cx(
            "relative grid flex-none place-items-center overflow-hidden border border-dashed border-line-strong bg-[repeating-conic-gradient(var(--subtle)_0_25%,var(--surface)_0_50%)] bg-[length:14px_14px]",
            frame,
          )}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="px-2 text-center text-xs text-muted">{emptyText}</span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-surface/70">
              <Spinner />
            </span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<IconUpload size={15} />} disabled={busy} onClick={() => input.current?.click()}>
              {url ? "Replace" : "Upload"}
            </Button>
            {url && (
              <Button size="sm" variant="ghost" disabled={busy} onClick={remove} className="text-red-700 dark:text-red-300">
                Remove
              </Button>
            )}
          </div>
          {hint && <p className="max-w-xs text-xs leading-relaxed text-muted">{hint}</p>}
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
      </div>
      {error && <div className="mt-2"><ErrorNote error={error} /></div>}
    </div>
  );
}
