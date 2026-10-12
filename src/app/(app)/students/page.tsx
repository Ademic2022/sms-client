"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";

import { IconDownload, IconPlus, IconUpload, IconUsers } from "@/components/icons";
import { Button, ButtonLink, Card, Empty, ErrorNote, Loading, PageHeader, SearchInput, Select, StatusBadge, Table, TD, TH } from "@/components/ui";
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

const PAGE = 50;

function Avatar({ name }: { name: string }) {
  const letters = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  return <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-subtle text-xs font-semibold text-muted ring-1 ring-line">{letters}</span>;
}

export default function StudentsPage() {
  const { can } = useSession();
  const router = useRouter();
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
        subtitle={page ? `${page.total.toLocaleString("en-NG")} ${status ? status : "in total"}` : undefined}
        actions={
          <>
            <ButtonLink href={`/files/students/export.xlsx${armId ? `?arm=${armId}` : ""}`} variant="secondary" icon={<IconDownload size={16} />}>Export</ButtonLink>
            {can("students.manage") && (
              <>
                <ButtonLink href="/students/import" variant="secondary" icon={<IconUpload size={16} />}>Import</ButtonLink>
                <ButtonLink href="/students/new" icon={<IconPlus size={16} />}>Add student</ButtonLink>
              </>
            )}
          </>
        }
      />
      <Card flush>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-[1fr_200px_170px]">
          <SearchInput placeholder="Search by name or admission number" value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} aria-label="Search students" />
          <Select value={armId} onChange={(e) => { setArmId(e.target.value); setOffset(0); }} aria-label="Class">
            <option value="">All classes</option>
            {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label} ({a.studentCount})</option>)}
          </Select>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }} aria-label="Status">
            <option value="active">Active</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
            <option value="">All statuses</option>
          </Select>
        </div>
        {error ? (
          <div className="p-4"><ErrorNote error={error} /></div>
        ) : isLoading ? (
          <div className="p-5"><Loading /></div>
        ) : !page?.items.length ? (
          <div className="p-5">
            <Empty title={search ? "No matching students" : "No students yet"} icon={<IconUsers size={18} />}
              action={!search && can("students.manage") ? <ButtonLink href="/students/import" size="sm">Import from Excel</ButtonLink> : undefined}>
              {search ? "Try a different name or admission number." : "Add students one at a time or import a whole class from Excel."}
            </Empty>
          </div>
        ) : (
          <Table>
            <thead>
              <tr><TH>Student</TH><TH>Admission no.</TH><TH>Class</TH><TH>Gender</TH><TH>Status</TH></tr>
            </thead>
            <tbody>
              {page.items.map((s) => (
                <tr key={s.id} className="cursor-pointer transition hover:bg-subtle/60" onClick={() => router.push(`/students/${s.id}`)}>
                  <TD>
                    <Link href={`/students/${s.id}`} className="flex items-center gap-3 font-medium text-ink" onClick={(e) => e.stopPropagation()}>
                      <Avatar name={s.fullName} />
                      {s.fullName}
                    </Link>
                  </TD>
                  <TD className="tabular-nums text-muted">{s.admissionNumber}</TD>
                  <TD>{s.currentArm?.label ?? <span className="text-muted">None</span>}</TD>
                  <TD className="text-muted">{s.gender === "F" ? "Female" : "Male"}</TD>
                  <TD><StatusBadge status={s.status} /></TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {page && page.total > PAGE && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-muted">
            <span>Showing {offset + 1}–{Math.min(offset + PAGE, page.total)} of {page.total}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={offset + PAGE >= page.total} onClick={() => setOffset(offset + PAGE)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
