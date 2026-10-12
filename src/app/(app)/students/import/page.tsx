"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, ErrorNote, Notice, PageHeader } from "@/components/ui";
import { uploadFile } from "@/lib/api";

interface RowError {
  row: number;
  messages: string[];
}

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<number | null>(null);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <PageHeader title="Import students from Excel" />
      <Card>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li><a className="font-semibold text-brand" href="/files/students/template.xlsx">Download the template</a>. It has one example row; replace it with your students.</li>
          <li>Use class names exactly as they appear in the portal, for example <strong>JSS 1A</strong>. Phone numbers can be written as 0803… or +234….</li>
          <li>Siblings with the same guardian phone are linked to one parent account automatically.</li>
          <li>Upload the file below. Nothing is saved unless every row is correct, so you can fix the file and upload again.</li>
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
          <Button onClick={submit} busy={busy} disabled={!file}>Upload</Button>
        </div>
      </Card>
      <ErrorNote error={error} />
      {created !== null && (
        <Notice tone="success">
          {created} students imported. <Link href="/students" className="font-semibold underline">View students</Link>
        </Notice>
      )}
      {rowErrors.length > 0 && (
        <Card title={`${rowErrors.length} row${rowErrors.length > 1 ? "s" : ""} need fixing. Nothing was imported.`}>
          <ul className="divide-y divide-line text-sm">
            {rowErrors.map((e) => (
              <li key={e.row} className="py-2">
                <span className="font-semibold">Row {e.row}:</span> {e.messages.join(" ")}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
