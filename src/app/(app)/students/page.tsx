"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { Badge, Button, ButtonLink, Empty, ErrorNote, Input, Loading, PageHeader, Select, statusTone } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { ArmsDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const StudentsDocument = graphql(`
  query Students($armId: ID, $search: String, $status: String, $offset: Int!) {
    students(armId: $armId, search: $search, status: $status, offset: $offset, limit: 50) {
      total
      items { id fullName admissionNumber gender status currentArm { id label } }
    }
  }
`);

export default function StudentsPage() {
  const { can } = useSession();
  const [search, setSearch] = useState("");
  const [armId, setArmId] = useState("");
  const [status, setStatus] = useState("active");
  const [offset, setOffset] = useState(0);
  const deferred = useDeferredValue(search);
  const arms = useGql(ArmsDocument, {});
  const { data, error, isLoading } = useGql(StudentsDocument, { armId: armId || null, search: deferred || null, status: status || null, offset });
  const page = data?.students;

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={page ? `${page.total} ${status || "total"}` : undefined}
        actions={
          can("students.manage") && (
            <>
              <ButtonLink href="/students/import" variant="secondary">Import from Excel</ButtonLink>
              <ButtonLink href="/students/new">Add student</ButtonLink>
            </>
          )
        }
      />
      <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
        <Input placeholder="Search by name or admission number" value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} type="search" />
        <Select value={armId} onChange={(e) => { setArmId(e.target.value); setOffset(0); }}>
          <option value="">All classes</option>
          {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label} ({a.studentCount})</option>)}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }}>
          <option value="active">Active</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="transferred">Transferred</option>
          <option value="graduated">Graduated</option>
          <option value="">All</option>
        </Select>
      </div>
      <ErrorNote error={error} />
      {isLoading ? (
        <Loading />
      ) : !page?.items.length ? (
        <Empty>No students found.</Empty>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {page.items.map((s) => (
            <li key={s.id}>
              <Link href={`/students/${s.id}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 hover:bg-subtle">
                <div className="min-w-0">
                  <div className="truncate font-medium">{s.fullName}</div>
                  <div className="text-xs text-muted">{s.admissionNumber} · {s.currentArm?.label ?? "No class"}</div>
                </div>
                {s.status !== "active" && <Badge tone={statusTone[s.status]}>{s.status}</Badge>}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a className="text-sm text-brand" href={`/files/students/export.xlsx${armId ? `?arm=${armId}` : ""}`}>Export list to Excel</a>
        {page && page.total > 50 && (
          <div className="flex gap-2">
            <Button variant="secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 50))}>Previous</Button>
            <Button variant="secondary" disabled={offset + 50 >= page.total} onClick={() => setOffset(offset + 50)}>Next</Button>
          </div>
        )}
      </div>
    </>
  );
}
