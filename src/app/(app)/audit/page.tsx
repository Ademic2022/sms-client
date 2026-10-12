"use client";

import { useState } from "react";

import { Badge, Card, ErrorNote, Loading, PageHeader, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";

const AuditDocument = graphql(`
  query AuditLog($prefix: String) {
    auditLog(actionPrefix: $prefix, limit: 200) { id action summary userName viaSupport createdAt }
  }
`);

const FILTERS: Record<string, string> = {
  "": "Everything",
  "fees.": "Fees and payments",
  "results.": "Results",
  "students.": "Students",
  "staff.": "Staff and roles",
  "auth.": "Logins",
  "support.": "Support access",
};

export default function AuditPage() {
  const [prefix, setPrefix] = useState("");
  const { data, error, isLoading } = useGql(AuditDocument, { prefix: prefix || null });
  return (
    <>
      <PageHeader title="Audit log" subtitle="Every change to results, fees, permissions and support access, with who did it and when." />
      <div className="max-w-xs">
        <Select value={prefix} onChange={(e) => setPrefix(e.target.value)}>
          {Object.entries(FILTERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>
      <ErrorNote error={error} />
      {isLoading ? <Loading /> : (
        <Card>
          <ul className="divide-y divide-line text-sm">
            {data?.auditLog.map((e) => (
              <li key={e.id} className="py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{e.summary || e.action}</span>
                  <span className="text-xs text-muted">{new Date(e.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted">
                  <span>{e.userName ?? "System"}</span> · <code>{e.action}</code>
                  {e.viaSupport && <Badge tone="warn">support access</Badge>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
