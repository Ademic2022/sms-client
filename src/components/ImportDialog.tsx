"use client";

import { useRef, useState, type ReactNode } from "react";

import { IconDownload, IconFile, IconUpload } from "@/components/icons";
import { Button, ButtonLink, Dialog, ErrorNote, Notice } from "@/components/ui";
import { uploadFile } from "@/lib/api";

type RowError = { row: number; messages: string[] };
type Result = Record<string, unknown>;

/**
 * Upload a filled-in Excel template. The server checks every row first and saves nothing
 * if any row is wrong, so the list of problems is the whole story.
 */
export function ImportDialog({
  open, onClose, title, description, templateHref, uploadPath, submitLabel, onDone, summary,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  templateHref: string;
  uploadPath: string;
  submitLabel: string;
  onDone?: (result: Result) => void;
  summary: (result: Result) => string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RowError[]>([]);
  const [done, setDone] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setError(null);
    setRows([]);
    setDone(null);
  }

  async function submit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setRows([]);
    try {
      const { ok, body } = await uploadFile(uploadPath, file);
      if (ok) {
        setDone(summary(body));
        setFile(null);
        onDone?.(body);
      } else if (body.errors?.length) setRows(body.errors);
      else setError(body.error ?? "The upload failed.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={title}
      description={description}
      footer={done
        ? <Button onClick={() => { reset(); onClose(); }}>Done</Button>
        : <><Button variant="secondary" onClick={() => { reset(); onClose(); }}>Cancel</Button><Button busy={busy} disabled={!file} onClick={submit}>{submitLabel}</Button></>}
    >
      <div className="space-y-4">
        {done ? (
          <Notice tone="success" title="Imported">{done}</Notice>
        ) : (
          <>
            <ButtonLink href={templateHref} variant="secondary" size="sm" icon={<IconDownload size={15} />}>Download the template</ButtonLink>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-line-strong px-4 py-6 text-center transition hover:border-brand hover:bg-brand/5"
            >
              <IconUpload size={20} className="text-muted" />
              {file
                ? <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink"><IconFile size={15} className="text-muted" />{file.name}</span>
                : <span className="mt-2 text-sm font-medium text-ink">Choose the completed file</span>}
              <span className="mt-0.5 text-xs text-muted">Excel workbook (.xlsx), up to 5 MB</span>
            </button>
            <input ref={input} type="file" accept=".xlsx" hidden onChange={(e) => { setFile(e.target.files?.[0] ?? null); setRows([]); setError(null); e.target.value = ""; }} />
          </>
        )}
        <ErrorNote error={error} />
        {rows.length > 0 && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/60">
            <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
              Nothing was saved. Fix {rows.length === 1 ? "this row" : `these ${rows.length} rows`} and upload again.
            </div>
            <ul className="max-h-56 divide-y divide-line overflow-y-auto text-[13px]">
              {rows.map((r) => (
                <li key={r.row} className="flex gap-3 px-3 py-2">
                  <span className="w-12 flex-none font-medium tabular-nums text-ink">Row {r.row}</span>
                  <span className="text-muted">{r.messages.join(" ")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Dialog>
  );
}
