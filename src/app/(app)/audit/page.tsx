"use client";

import { useState } from "react";

import { IconShield } from "@/components/icons";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, Select, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";

const AuditDocument = graphql(`
  query AuditLog($prefix: String) {
    auditLog(actionPrefix: $prefix, limit: 200) { id action summary userName viaSupport createdAt }
  }
`);

const FILTERS: Record<string, string> = {
  "": "All activity",
  "fees.": "Fees and payments",
  "results.": "Results",
  "students.": "Students",
  "staff.": "Staff and roles",
  "auth.": "Sign-ins",
  "support.": "Support access",
  "school.": "School settings",
};

const AREA: Record<string, string> = {
  fees: "Fees",
  results: "Results",
  students: "Students",
  staff: "Staff",
  auth: "Sign-in",
  support: "Support",
  school: "Settings",
  academics: "Academics",
  messaging: "Messages",
};

export default function AuditPage() {
  const [prefix, setPrefix] = useState("");
  const { data, error, isLoading } = useGql(AuditDocument, { prefix: prefix || null });
  const entries = data?.auditLog ?? [];
  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Every change to results, fees, staff permissions and support access, with who made it and when."
        actions={
          <Select value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-auto" aria-label="Filter">
            {Object.entries(FILTERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        }
      />
      <ErrorNote error={error} />
      <Card flush>
        {isLoading ? (
          <div className="p-5"><Loading /></div>
        ) : !entries.length ? (
          <div className="p-5"><Empty title="No activity recorded" icon={<IconShield size={18} />}>Changes appear here as soon as they are made.</Empty></div>
        ) : (
          <Table>
            <thead><tr><TH>When</TH><TH>Area</TH><TH>What happened</TH><TH>By</TH></tr></thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <TD className="whitespace-nowrap text-muted">{new Date(e.createdAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</TD>
                  <TD><Badge>{AREA[e.action.split(".")[0]] ?? e.action.split(".")[0]}</Badge></TD>
                  <TD className="min-w-[18rem]">{e.summary || e.action}</TD>
                  <TD className="whitespace-nowrap">
                    {e.userName ?? <span className="text-muted">System</span>}
                    {e.viaSupport && <span className="ml-2"><Badge tone="warn">Support</Badge></span>}
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
