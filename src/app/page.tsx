"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ButtonLink, Loading } from "@/components/ui";
import { useSession } from "@/lib/session";

export default function Home() {
  const { loading, me, school, error } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (school) router.replace(me ? "/dashboard" : "/login");
    else if (me?.isPlatformAdmin) router.replace("/console");
  }, [loading, me, school, router]);

  if (error) {
    return (
      <main className="mx-auto max-w-md p-6 text-center">
        <h1 className="text-xl font-bold">{error.message}</h1>
        <p className="mt-2 text-sm text-muted">Check the web address your school gave you.</p>
      </main>
    );
  }
  if (loading || school || me?.isPlatformAdmin) return <Loading />;

  // The platform's own address: the product page for school owners.
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Report cards and school fees, without the spreadsheets.</h1>
        <p className="mt-4 text-lg text-muted">
          Teachers enter scores on their phones. Report cards are computed and published for you. Parents pay fees online and you see
          who has paid without checking bank statements.
        </p>
      </div>
      <ul className="grid gap-3 text-sm text-ink sm:grid-cols-3">
        <li className="rounded-xl border border-line bg-surface p-4">Your own web address, logo and colours.</li>
        <li className="rounded-xl border border-line bg-surface p-4">Import students from Excel and start the same day.</li>
        <li className="rounded-xl border border-line bg-surface p-4">SMS receipts and result alerts to parents.</li>
      </ul>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/signup">Start a free trial</ButtonLink>
        <ButtonLink href="/login" variant="secondary">Platform login</ButtonLink>
      </div>
    </main>
  );
}
