"use client";

import { useState } from "react";

import { IconPlus, IconUpload } from "@/components/icons";
import { ImportDialog } from "@/components/ImportDialog";
import { Badge, Button, Card, ErrorNote, FormActions, Input, Loading, Notice, PageHeader, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { naira, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const FeeSetupDocument = graphql(`
  query FeeSetup($termId: ID!) {
    feeItems { id name order }
    levels { id name }
    feeSchedules(termId: $termId) { id amountKobo isCompulsory levelId item { id } }
  }
`);

const SaveItemDocument = graphql(`mutation SaveFeeItem($name: String!, $order: Int!) { saveFeeItem(name: $name, order: $order) { id } }`);

const SetScheduleDocument = graphql(`
  mutation SetFeeSchedule($termId: ID!, $schedules: [ScheduleInput!]!) {
    setFeeSchedule(termId: $termId, schedules: $schedules) { id }
  }
`);

type Cell = { amount: string; compulsory: boolean };

export default function FeeSetupPage() {
  const { term, can } = useSession();
  const [importing, setImporting] = useState(false);
  const { data, error, isLoading, mutate } = useGql(FeeSetupDocument, term ? { termId: term.id } : null);
  const [cells, setCells] = useDerivedState(
    data,
    (d) => Object.fromEntries(d.feeSchedules.map((s) => [`${s.levelId}:${s.item.id}`, { amount: String(s.amountKobo / 100), compulsory: s.isCompulsory }])),
    {} as Record<string, Cell>,
  );
  const [newItem, setNewItem] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!term) return <Notice tone="warning" title="No current term">Set the current term before setting fees.</Notice>;
  if (isLoading) return <Loading />;
  if (!data) return <ErrorNote error={error} />;

  async function addItem() {
    if (!newItem.trim()) return;
    try {
      await gql(SaveItemDocument, { name: newItem.trim(), order: data!.feeItems.length });
      setNewItem("");
      await mutate();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function save() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    const schedules = [];
    for (const [k, c] of Object.entries(cells)) {
      if (c.amount.trim() === "") continue;
      const amountKobo = toKobo(c.amount);
      if (amountKobo === null) {
        setErr(`"${c.amount}" is not a valid amount.`);
        setBusy(false);
        return;
      }
      const [levelId, itemId] = k.split(":");
      schedules.push({ levelId, itemId, amountKobo, isCompulsory: c.compulsory });
    }
    try {
      await gql(SetScheduleDocument, { termId: term!.id, schedules });
      setMsg("Fees saved. Generate term bills from the Fees page to charge students.");
      await mutate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (k: string, patch: Partial<Cell>) => setCells((c) => ({ ...c, [k]: { ...(c[k] ?? { amount: "", compulsory: true }), ...patch } }));
  const levelTotal = (levelId: string) =>
    data.feeItems.reduce((sum, i) => {
      const c = cells[`${levelId}:${i.id}`];
      return sum + (c?.compulsory ? toKobo(c.amount) ?? 0 : 0);
    }, 0);

  return (
    <>
      <PageHeader back={{ href: "/fees", label: "Fees and payments" }} eyebrow={term.label} title="Fee setup" subtitle="What each level pays this term. Amounts in naira." />
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Card title="Fee items" description="The lines that appear on every bill, in this order.">
        <div className="flex flex-wrap gap-2">
          {data.feeItems.map((i) => <Badge key={i.id}>{i.name}</Badge>)}
          {!data.feeItems.length && <span className="text-sm text-muted">No fee items yet. Add tuition first.</span>}
        </div>
        <div className="mt-4 flex max-w-md gap-2">
          <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void addItem()} placeholder="e.g. Tuition, Books, PTA levy" aria-label="New fee item" />
          <Button variant="secondary" icon={<IconPlus size={15} />} onClick={addItem}>Add item</Button>
        </div>
      </Card>
      {data.feeItems.length > 0 && (
        <>
          <Card flush title="Amounts by level" description="Untick Compulsory for items like bus or lessons that only some students take.">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-subtle/60 text-xs text-muted">
                    <th className="sticky left-0 z-10 bg-subtle px-5 py-2.5 text-left font-medium">Level</th>
                    {data.feeItems.map((i) => <th key={i.id} className="px-2 py-2.5 text-left font-medium">{i.name}</th>)}
                    <th className="px-5 py-2.5 text-right font-medium">Compulsory total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.levels.map((l) => (
                    <tr key={l.id} className="border-b border-line last:border-b-0">
                      <td className="sticky left-0 z-10 bg-surface px-5 py-2.5 font-medium text-ink">{l.name}</td>
                      {data.feeItems.map((i) => {
                        const k = `${l.id}:${i.id}`;
                        const c = cells[k];
                        const compulsory = c?.compulsory ?? true;
                        return (
                          <td key={i.id} className="px-2 py-2 align-top">
                            <div className="relative">
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">₦</span>
                              <input inputMode="decimal" className="h-9 w-28 rounded-md border border-line-strong bg-surface pl-6 pr-2 text-right text-sm tabular-nums text-ink shadow-sm outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/15"
                                value={c?.amount ?? ""} placeholder="0" onChange={(e) => set(k, { amount: e.target.value })} aria-label={`${i.name} for ${l.name}`} />
                            </div>
                            <button type="button" onClick={() => set(k, { compulsory: !compulsory })}
                              className={cx("mt-1 rounded px-1 text-[11px] font-medium", compulsory ? "text-muted hover:text-ink" : "text-amber-700 dark:text-amber-300")}>
                              {compulsory ? "Compulsory" : "Optional"}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-5 py-2.5 text-right align-top font-semibold tabular-nums text-ink">{naira(levelTotal(l.id))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <FormActions>
            <span className="mr-auto text-sm text-muted">Saving does not charge anyone. Generate term bills from the Fees page.</span>
            <Button busy={busy} onClick={save}>Save fees</Button>
          </FormActions>
        </>
      )}
      {can("fees.manage") && (
        <Card
          title="Opening balances"
          description="New to the portal? Bring across what each student owed, or paid ahead, from your old records. These count in every balance, reminder and debtors list."
          actions={<Button size="sm" variant="secondary" icon={<IconUpload size={15} />} onClick={() => setImporting(true)}>Import from Excel</Button>}
        >
          <p className="text-sm text-muted">The template lists every active student. Fill in the amounts you need and leave the rest blank. You can also change one student&apos;s opening balance from their fees account.</p>
        </Card>
      )}
      <ImportDialog
        open={importing}
        onClose={() => setImporting(false)}
        title="Import opening balances"
        description="Amounts in naira. Use a minus sign for money paid ahead. Uploading again replaces a student's earlier opening balance."
        templateHref="/files/fees/opening-balances.xlsx"
        uploadPath="/files/fees/opening-balances/import/"
        submitLabel="Import balances"
        summary={(r) => `Opening balances saved for ${r.saved} student${r.saved === 1 ? "" : "s"}, totalling ₦${(Number(r.total_kobo) / 100).toLocaleString("en-NG")}.`}
      />
    </>
  );
}
