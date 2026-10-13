import type { Metadata } from "next";

// Each school's own privacy notice, for its parents; not a search result.
export const metadata: Metadata = {
  title: "Privacy notice",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/privacy">) {
  return children;
}
