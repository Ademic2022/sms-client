import type { Metadata } from "next";

// Reached only from a link in an email; never a search result.
export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/confirm-email">) {
  return children;
}
