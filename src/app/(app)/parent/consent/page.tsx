"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { IconShield } from "@/components/icons";
import { NoticeText } from "@/components/privacy/NoticeText";
import { ActionDialog, Badge, Button, Card, Checkbox, ErrorNote, Loading, Notice, PageHeader } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { localPhone } from "@/lib/money";
import { MyConsentDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const GiveConsentDocument = graphql(`
  mutation GiveConsent($studentIds: [ID!]!) { giveConsent(studentIds: $studentIds) { pending } }
`);

const WithdrawConsentDocument = graphql(`
  mutation WithdrawMyConsent($studentId: ID!, $reason: String!) { withdrawMyConsent(studentId: $studentId, reason: $reason) { pending } }
`);

function ConsentScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const firstVisit = params.get("first") === "1";
  const { school } = useSession();
  const { data, error, isLoading, mutate } = useGql(MyConsentDocument, {});
  const status = data?.myConsent;
  const pending = status?.children.filter((c) => !c.consented) ?? [];
  const [picked, setPicked] = useDerivedState(status, (s) => s.children.filter((c) => !c.consented).map((c) => c.student.id), [] as string[]);
  const [read, setRead] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<{ id: string; name: string } | null>(null);

  if (isLoading) return <Loading />;
  if (error || !status) return <ErrorNote error={error} />;

  async function agree() {
    setBusy(true);
    setErr(null);
    try {
      const { giveConsent } = await gql(GiveConsentDocument, { studentIds: picked });
      await mutate();
      if (!giveConsent.pending) router.replace("/parent");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const published = new Date(status.notice.publishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        eyebrow="Privacy and consent"
        title={pending.length ? "Before you continue" : "Your child's information"}
        subtitle={pending.length
          ? `${status.notice.schoolName} needs your consent to keep and use your child's information, as the Nigeria Data Protection Act requires.`
          : `You have given consent for every child under the current notice.`}
      />
      {firstVisit && status.notice.version > 1 && pending.length > 0 && (
        <Notice tone="info" title="The school has updated its privacy notice">Please read the new version and confirm your consent again.</Notice>
      )}

      <Card title={`Privacy notice · version ${status.notice.version}`} description={`Published ${published}`}>
        <div className="max-h-[52vh] overflow-y-auto pr-2" onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setRead(true);
        }}>
          <NoticeText body={status.notice.body} />
        </div>
      </Card>

      <Card title="Your children" flush>
        {status.children.map((c) => (
          <div key={c.student.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-b-0">
            {c.consented ? (
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">{c.student.fullName} <Badge tone="good" dot>Consent given</Badge></div>
                <div className="mt-0.5 text-[13px] text-muted">
                  {c.student.currentArm?.label} · {c.source} on {new Date(c.givenAt!).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            ) : (
              <Checkbox
                label={<span className="font-medium">{c.student.fullName}</span>}
                description={`${c.student.currentArm?.label ?? ""} · consent needed`}
                checked={picked.includes(c.student.id)}
                onChange={(v) => setPicked(v ? [...picked, c.student.id] : picked.filter((id) => id !== c.student.id))}
              />
            )}
            {c.consented && (
              <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300" onClick={() => setWithdrawing({ id: c.student.id, name: c.student.firstName })}>
                Withdraw
              </Button>
            )}
          </div>
        ))}
        {pending.length > 0 && (
          <div className="space-y-3 border-t border-line bg-subtle/40 px-5 py-4">
            <ErrorNote error={err} />
            <p className="text-sm text-ink">
              By selecting <strong>I agree</strong>, you confirm that you have read the notice above and consent to {status.notice.schoolName} using
              the information of the children ticked, as described.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                <IconShield size={15} />
                {read ? "You can withdraw consent at any time from this page." : "Scroll through the notice to read it in full."}
              </span>
              <Button busy={busy} disabled={!picked.length} onClick={agree}>I agree</Button>
            </div>
          </div>
        )}
      </Card>

      <p className="text-sm text-muted">
        Questions about your child&apos;s information? Contact {school?.name ?? "the school"}
        {school?.phone ? ` on ${localPhone(school.phone)}` : ""}{school?.email ? ` or ${school.email}` : ""}.
      </p>

      <ActionDialog
        open={withdrawing !== null}
        onClose={() => setWithdrawing(null)}
        title={`Withdraw consent for ${withdrawing?.name ?? ""}?`}
        description="The school will be told and will contact you about what happens next. Withdrawing does not affect anything done before now, and some records must be kept by law."
        confirmLabel="Withdraw consent"
        tone="danger"
        input={{ label: "Tell the school why", placeholder: "e.g. We are moving to another school", hint: "Shared only with the school." }}
        onConfirm={async (reason) => {
          await gql(WithdrawConsentDocument, { studentId: withdrawing!.id, reason });
          await mutate();
        }}
      />
    </>
  );
}

export default function ParentConsentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConsentScreen />
    </Suspense>
  );
}
