"use client";

import { useState } from "react";

import { Button, Card, ErrorNote, Input, Loading, Notice, PageHeader } from "@/components/ui";
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
  const { term } = useSession();
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

  if (!term) return <Notice tone="warning">Set the current term first.</Notice>;
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
      <PageHeader title="Fee setup" subtitle={`Amounts per level for ${term.label}, in naira`} />
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Card title="Fee items">
        <div className="flex flex-wrap gap-2">
          {data.feeItems.map((i) => <span key={i.id} className="rounded-full bg-subtle px-3 py-1 text-sm">{i.name}</span>)}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="e.g. Lesson, Uniform, PTA levy" />
          <Button variant="secondary" onClick={addItem}>Add</Button>
        </div>
      </Card>
      {data.feeItems.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="text-sm">
              <thead className="bg-subtle text-xs text-muted">
                <tr>
                  <th className="sticky left-0 bg-subtle px-3 py-2 text-left">Level</th>
                  {data.feeItems.map((i) => <th key={i.id} className="px-2 py-2">{i.name}</th>)}
                  <th className="px-3">Compulsory total</th>
                </tr>
              </thead>
              <tbody>
                {data.levels.map((l) => (
                  <tr key={l.id} className="border-t border-line">
                    <td className="sticky left-0 bg-surface px-3 py-1.5 font-medium">{l.name}</td>
                    {data.feeItems.map((i) => {
                      const k = `${l.id}:${i.id}`;
                      const c = cells[k];
                      return (
                        <td key={i.id} className="px-1 py-1">
                          <input inputMode="decimal" className="h-10 w-24 rounded-md border border-line bg-surface px-2 text-right tabular-nums" value={c?.amount ?? ""}
                            onChange={(e) => set(k, { amount: e.target.value })} aria-label={`${i.name} for ${l.name}`} />
                          <label className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                            <input type="checkbox" checked={c?.compulsory ?? true} onChange={(e) => set(k, { compulsory: e.target.checked })} /> compulsory
                          </label>
                        </td>
                      );
                    })}
                    <td className="px-3 text-right font-semibold tabular-nums">{naira(levelTotal(l.id))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">Optional items (bus, lesson) are not added to bills automatically. Add them to a student&apos;s bill from their fees account.</p>
          <Button busy={busy} onClick={save}>Save fees</Button>
        </>
      )}
    </>
  );
}
