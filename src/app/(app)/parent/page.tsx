"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, Empty, ErrorNote, Field, Input, Loading, Notice, PageHeader } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { naira, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const MyChildrenDocument = graphql(`
  query MyChildren {
    myChildren {
      balanceKobo
      student { id fullName firstName admissionNumber currentArm { label } }
      currentBill { totalKobo term { label } lines { id description amountKobo } }
    }
  }
`);

const StartCheckoutDocument = graphql(`
  mutation StartCheckout($payFor: [PayFor!]!, $callbackUrl: String!, $email: String) {
    startCheckout(payFor: $payFor, callbackUrl: $callbackUrl, email: $email) {
      reference authorizationUrl totalKobo convenienceFeeKobo
    }
  }
`);

export default function ParentHome() {
  const { me } = useSession();
  const { data, error, isLoading } = useGql(MyChildrenDocument, {});
  const [amounts, setAmounts] = useDerivedState(
    data,
    (d) => Object.fromEntries(d.myChildren.map((c) => [c.student.id, c.balanceKobo > 0 ? String(c.balanceKobo / 100) : ""])),
    {} as Record<string, string>,
  );
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const children = data?.myChildren ?? [];

  const payFor = Object.entries(amounts)
    .map(([studentId, v]) => ({ studentId, amountKobo: toKobo(v) ?? 0 }))
    .filter((p) => p.amountKobo > 0);
  const total = payFor.reduce((s, p) => s + p.amountKobo, 0);

  async function pay() {
    setBusy(true);
    setPayError(null);
    try {
      const { startCheckout } = await gql(StartCheckoutDocument, {
        payFor, email: email || me?.user.email || null, callbackUrl: `${window.location.origin}/parent/payments/return`,
      });
      window.location.assign(startCheckout.authorizationUrl);
    } catch (e) {
      setPayError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="My children" />
      {!children.length && <Empty>No children are linked to your phone number at this school. Please contact the school office.</Empty>}
      <div className="grid gap-3 md:grid-cols-2">
        {children.map((c) => (
          <Card key={c.student.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{c.student.fullName}</div>
                <div className="text-sm text-muted">{c.student.currentArm?.label} · {c.student.admissionNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase text-muted">Balance</div>
                <div className={`text-xl font-bold tabular-nums ${c.balanceKobo > 0 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}>{naira(c.balanceKobo)}</div>
              </div>
            </div>
            {c.currentBill && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-brand">{c.currentBill.term.label} bill: {naira(c.currentBill.totalKobo)}</summary>
                <ul className="mt-2 divide-y divide-line">
                  {c.currentBill.lines.map((l) => (
                    <li key={l.id} className="flex justify-between py-1"><span>{l.description}</span><span className="tabular-nums">{naira(l.amountKobo)}</span></li>
                  ))}
                </ul>
              </details>
            )}
            <div className="mt-3 flex gap-3 text-sm">
              <Link className="font-semibold text-brand" href={`/parent/child/${c.student.id}`}>Results and payments →</Link>
            </div>
          </Card>
        ))}
      </div>
      {children.length > 0 && (
        <Card title="Pay school fees">
          <p className="mb-3 text-sm text-muted">Pay any amount by card, bank transfer or USSD. You can pay for several children at once.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map((c) => (
              <Field key={c.student.id} label={`${c.student.firstName} (₦)`}>
                <Input inputMode="decimal" value={amounts[c.student.id] ?? ""} onChange={(e) => setAmounts({ ...amounts, [c.student.id]: e.target.value })} placeholder="0" />
              </Field>
            ))}
            {!me?.user.email && (
              <Field label="Email for the payment receipt (optional)" hint="Your SMS receipt is sent either way.">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            )}
          </div>
          <ErrorNote error={payError} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button busy={busy} disabled={!total} onClick={pay}>Pay {naira(total)}</Button>
            <span className="text-xs text-muted">You will be taken to a secure payment page.</span>
          </div>
        </Card>
      )}
      <Notice>Prefer to pay at the bank? Pay into the school&apos;s account and bring the teller to the bursar. It will show here once recorded.</Notice>
    </>
  );
}
