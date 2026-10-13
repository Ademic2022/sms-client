"use client";

import { useRef, useState } from "react";

import { Button, Card, ErrorNote, Field, Input, Notice, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";

const PayoutAccountDocument = graphql(`
  query PayoutAccount { payoutAccount { connected bankName accountNumber accountName canChange } }
`);
const PayoutBanksDocument = graphql(`query PayoutBanks { payoutBanks { code name } }`);
const ResolveDocument = graphql(`
  mutation ResolvePayoutAccount($bankCode: String!, $accountNumber: String!) { resolvePayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) }
`);
const ConnectDocument = graphql(`
  mutation ConnectPayoutAccount($bankCode: String!, $accountNumber: String!) {
    connectPayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) { connected }
  }
`);

/** The bank account parents' online fee payments are paid into. Saved on its own, not with the settings form. */
export function PayoutAccountCard() {
  const { data, error, mutate } = useGql(PayoutAccountDocument, {});
  const [editing, setEditing] = useState(false);
  const account = data?.payoutAccount;
  const banks = useGql(PayoutBanksDocument, editing ? {} : null);
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const lookup = useRef(0);

  // Ask Paystack for the name on the account once both the bank and all 10 digits are in.
  async function check(nextBank: string, nextNumber: string) {
    setName(null);
    setErr(null);
    if (!nextBank || nextNumber.length !== 10) return;
    const id = ++lookup.current;
    setChecking(true);
    try {
      const result = await gql(ResolveDocument, { bankCode: nextBank, accountNumber: nextNumber });
      if (id === lookup.current) setName(result.resolvePayoutAccount);
    } catch (e) {
      if (id === lookup.current) setErr((e as Error).message);
    } finally {
      if (id === lookup.current) setChecking(false);
    }
  }

  async function connect() {
    setBusy(true);
    setErr(null);
    try {
      await gql(ConnectDocument, { bankCode: bank, accountNumber: number });
      await mutate();
      setEditing(false);
      setSaved(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function startEditing() {
    setBank("");
    setNumber("");
    setName(null);
    setErr(null);
    setSaved(false);
    setEditing(true);
  }

  return (
    <Card title="Online fee payments" description="Parents' card, transfer and USSD payments are paid straight into this bank account by Paystack, usually the next working day.">
      <div className="space-y-4">
        <ErrorNote error={error ?? null} />
        {saved && <Notice tone="success">Bank account linked. Parents can now pay fees online.</Notice>}
        {account && !editing && (account.connected ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-subtle/50 px-4 py-3 text-sm">
            <div>
              <div className="font-medium text-ink">{account.accountName}</div>
              <div className="text-[13px] text-muted">{account.bankName} · <span className="tabular-nums">{account.accountNumber}</span></div>
            </div>
            {account.canChange && <Button size="sm" variant="secondary" onClick={startEditing}>Change account</Button>}
          </div>
        ) : (
          <Notice tone="warning" title="Parents can't pay online yet">
            {account.canChange
              ? <>Link the school&apos;s bank account to turn on online payments.
                  <div className="mt-3"><Button size="sm" onClick={startEditing}>Link bank account</Button></div></>
              : "Ask the school owner to link the school's bank account under Settings."}
          </Notice>
        ))}
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bank">
                <Select value={bank} disabled={!banks.data} onChange={(e) => { setBank(e.target.value); void check(e.target.value, number); }}>
                  <option value="">{banks.data ? "Choose the bank" : "Loading banks…"}</option>
                  {banks.data?.payoutBanks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                </Select>
              </Field>
              <Field label="Account number" hint="The school's own account. Use a business account in the school's name.">
                <Input inputMode="numeric" autoComplete="off" maxLength={10} value={number} className="tabular-nums"
                  onChange={(e) => { const digits = e.target.value.replace(/\D/g, "").slice(0, 10); setNumber(digits); void check(bank, digits); }} />
              </Field>
            </div>
            <ErrorNote error={banks.error ?? err} />
            {checking && <div className="text-[13px] text-muted">Checking the account…</div>}
            {name && (
              <div className="rounded-lg border border-line bg-subtle/50 px-4 py-3 text-sm">
                <div className="text-[13px] text-muted">Name on the account</div>
                <div className="font-medium text-ink">{name}</div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button busy={busy} disabled={!name || checking} onClick={connect}>{account?.connected ? "Use this account" : "Link this account"}</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
