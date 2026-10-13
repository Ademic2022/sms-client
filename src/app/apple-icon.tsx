import { ImageResponse } from "next/og";

// The icon iPhones use when the site is added to the home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f3d2e", color: "#e9a23b", fontSize: 112, fontWeight: 700, fontFamily: "Georgia, serif" }}>
        A
      </div>
    ),
    size,
  );
}
