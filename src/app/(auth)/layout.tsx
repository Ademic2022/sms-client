import { Fraunces, Instrument_Sans } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], variable: "--font-auth-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-auth-body", display: "swap" });

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <div className={`${display.variable} ${body.variable} font-[family-name:var(--font-auth-body)]`}>{children}</div>;
}
