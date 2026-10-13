import type { Metadata } from "next";

// Each school signs in on its own address; the sign-in page is not a search result.
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: LayoutProps<"/login">) {
  return children;
}
