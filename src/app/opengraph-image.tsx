import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

// The card shown when the site is shared on WhatsApp, X, LinkedIn or Slack.
export const alt = `${SITE.name}: report cards and school fees for Nigerian schools`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#0f3d2e";
const SAFFRON = "#e9a23b";
const CREAM = "#fffcf5";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: GREEN, color: CREAM, padding: "72px 80px", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: SAFFRON, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN, fontSize: 40, fontWeight: 700 }}>A</div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -0.5 }}>{SITE.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -1.5, display: "flex", flexWrap: "wrap" }}>
            Results day, without the late nights.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, lineHeight: 1.35, color: "#d8e3dc", fontFamily: "Helvetica, Arial, sans-serif" }}>
            Report cards, school fees and SMS for Nigerian schools.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26, fontFamily: "Helvetica, Arial, sans-serif" }}>
          <div style={{ background: SAFFRON, color: GREEN, padding: "10px 22px", borderRadius: 999, fontWeight: 700 }}>
            {/* Written out: the image font has no naira sign. */}
            {`${SITE.pricePerStudentNaira.toLocaleString("en-NG")} naira per student, per term`}
          </div>
          <div style={{ border: `2px solid ${CREAM}`, padding: "8px 22px", borderRadius: 999 }}>{`${SITE.trialDays} days free`}</div>
        </div>
      </div>
    ),
    size,
  );
}
