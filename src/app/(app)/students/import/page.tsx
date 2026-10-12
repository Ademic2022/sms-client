"use client";

import Link from "next/link";
import { useRef, useState, type DragEvent } from "react";

import { IconDownload, IconFile, IconUpload } from "@/components/icons";
import { Button, ButtonLink, Card, ErrorNote, Notice, PageHeader, Table, TD, TH, cx } from "@/components/ui";
import { uploadFile } from "@/lib/api";

interface RowError {
  row: number;
  messages: string[];
}

const STEPS = [
  ["Download the template", "One example row shows the format. Keep the column headings as they are."],
  ["Fill in your students", "Use class names exactly as they appear in the portal, such as JSS 1A. Phone numbers can be written 0803… or +234…."],
  ["Upload the file", "Every row is checked first. Nothing is saved unless the whole file is correct, so you can fix and upload again."],
];

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<number | null>(null);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function choose(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setCreated(null);
    setRowErrors([]);
    setError(null);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    choose(e.dataTransfer.files[0]);
  }

  async function submit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setRowErrors([]);
    setCreated(null);
    try {
      const { ok, body } = await uploadFile("/files/students/import/", file);
      if (ok) setCreated(body.created);
      else if (body.errors) setRowErrors(body.errors);
      else setError(body.error ?? "The upload failed.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader back={{ href: "/students", label: "Students" }} title="Import students from Excel" subtitle="Students and their parents or guardians, in one upload." />

      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 font-display text-sm font-semibold text-brand-ink">{i + 1}</div>
            <div className="mt-3 text-sm font-semibold text-ink">{title}</div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>
            {i === 0 && <ButtonLink href="/files/students/template.xlsx" variant="secondary" size="sm" className="mt-4" icon={<IconDownload size={15} />}>Download template</ButtonLink>}
          </li>
        ))}
      </ol>

      <Card title="Upload">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cx("flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition", dragging ? "border-brand bg-brand/5" : "border-line-strong")}
        >
          <div className="grid h-11 w-11 place-items-center rounded-full bg-subtle text-muted"><IconUpload size={20} /></div>
          {file ? (
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink"><IconFile size={16} className="text-muted" />{file.name} <span className="font-normal text-muted">· {(file.size / 1024).toFixed(0)} KB</span></div>
          ) : (
            <>
              <div className="mt-3 text-sm font-medium text-ink">Drag your completed template here</div>
              <div className="mt-1 text-[13px] text-muted">Excel workbook (.xlsx), up to 5 MB</div>
            </>
          )}
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={() => input.current?.click()}>{file ? "Choose another file" : "Choose file"}</Button>
            {file && <Button onClick={submit} busy={busy}>Import students</Button>}
          </div>
          <input ref={input} type="file" accept=".xlsx" hidden onChange={(e) => choose(e.target.files?.[0])} />
        </div>
      </Card>

      <ErrorNote error={error} />
      {created !== null && (
        <Notice tone="success" title={`${created} students imported`}>
          Parents can now sign in with their phone numbers. <Link href="/students" className="font-semibold underline underline-offset-2">View students</Link>
        </Notice>
      )}
      {rowErrors.length > 0 && (
        <Card title={`${rowErrors.length} row${rowErrors.length > 1 ? "s" : ""} need fixing`} description="Nothing was imported. Correct these rows in your file and upload it again." flush>
          <Table>
            <thead><tr><TH className="w-24">Row</TH><TH>Problem</TH></tr></thead>
            <tbody>
              {rowErrors.map((e) => (
                <tr key={e.row}>
                  <TD className="font-medium tabular-nums">{e.row}</TD>
                  <TD><ul className="space-y-0.5">{e.messages.map((m) => <li key={m}>{m}</li>)}</ul></TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </>
  );
}
