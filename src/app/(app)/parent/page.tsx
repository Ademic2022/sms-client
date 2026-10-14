"use client";

import Link from "next/link";
import { useState } from "react";

import { IconAward, IconChevronRight, IconChild, IconLock } from "@/components/icons";
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Loading, PageHeader } from "@/components/ui";
import { NoticesCard } from "@/components/NoticesCard";
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
  const { me, school } = useSession();
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
  const owing = children.reduce((n, c) => n + Math.max(0, c.balanceKobo), 0);

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
      <PageHeader title={`Welcome, ${me?.user.firstName || "parent"}`} subtitle={school ? `Your children at ${school.name}` : undefined} />
      {!children.length ? (
        <Empty title="No children linked to your account" icon={<IconChild size={18} />}>
          Children are linked using the phone number the school has for you. Please contact the school office.
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {children.map((c) => (
              <Card key={c.student.id} flush>
                <div className="flex items-start justify-between gap-4 p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand/10 font-display text-base font-semibold text-brand-ink">
                      {c.student.firstName[0]}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-ink">{c.student.fullName}</div>
                      <div className="text-[13px] text-muted">{c.student.currentArm?.label} · {c.student.admissionNumber}</div>
                    </div>
                  </div>
                  {c.balanceKobo > 0 ? <Badge tone="warn" dot>Owing</Badge> : <Badge tone="good" dot>Paid up</Badge>}
                </div>
                <div className="grid grid-cols-2 border-t border-line">
                  <div className="border-r border-line px-5 py-3.5">
                    <div className="text-xs text-muted">Balance</div>
                    <div className="mt-0.5 font-display text-xl font-medium tabular-nums text-ink">{naira(c.balanceKobo)}</div>
                  </div>
                  <div className="px-5 py-3.5">
                    <div className="text-xs text-muted">{c.currentBill ? `${c.currentBill.term.label} bill` : "This term"}</div>
                    <div className="mt-0.5 font-display text-xl font-medium tabular-nums text-ink">{c.currentBill ? naira(c.currentBill.totalKobo) : "–"}</div>
                  </div>
                </div>
                {c.currentBill && (
                  <details className="group border-t border-line">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-[13px] font-medium text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
                      Bill breakdown <IconChevronRight size={14} className="transition group-open:rotate-90" />
                    </summary>
                    <ul className="px-5 pb-4 text-sm">
                      {c.currentBill.lines.map((l) => (
                        <li key={l.id} className="flex justify-between border-b border-dashed border-line py-1.5 last:border-b-0">
                          <span className="text-muted">{l.description}</span>
                          <span className="tabular-nums text-ink">{naira(l.amountKobo)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <Link href={`/parent/child/${c.student.id}`} className="flex items-center justify-between border-t border-line px-5 py-3 text-sm font-medium text-brand-ink hover:bg-subtle/60">
                  <span className="inline-flex items-center gap-2"><IconAward size={16} /> Results and payment history</span>
                  <IconChevronRight size={16} />
                </Link>
              </Card>
            ))}
          </div>

          <Card title="Pay school fees" description="Pay any amount by card, bank transfer or USSD. You can pay for several children in one payment.">
            <div className="space-y-4">
              <ErrorNote error={payError} />
              <div className="grid gap-4 sm:grid-cols-2">
                {children.map((c) => (
                  <Field key={c.student.id} label={c.student.firstName} hint={c.balanceKobo > 0 ? `Owing ${naira(c.balanceKobo)}` : "Nothing owing"}>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₦</span>
                      <Input inputMode="decimal" className="pl-7 tabular-nums" value={amounts[c.student.id] ?? ""} onChange={(e) => setAmounts({ ...amounts, [c.student.id]: e.target.value })} placeholder="0" />
                    </div>
                  </Field>
                ))}
                {!me?.user.email && (
                  <Field label="Email for the card receipt" optional hint="Your SMS receipt is sent either way.">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-muted"><IconLock size={14} /> Secured by Paystack. Paid directly into the school&apos;s account.</span>
                <Button busy={busy} disabled={!total} onClick={pay}>Pay {naira(total)}</Button>
              </div>
            </div>
          </Card>
          {owing === 0 && <p className="text-center text-sm text-muted">All fees are paid. Thank you.</p>}
        </>
      )}
      <NoticesCard emptyText="Announcements from the school will appear here." />
    </>
  );
}
