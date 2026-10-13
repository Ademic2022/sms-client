import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";

// Everything here is a school's private data, behind sign-in. Never in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
