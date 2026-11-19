import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { TAGLINE } from "@/lib/site/content";

export const alt = "W.S. Gong";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Geist Bold, bundled (src/app/fonts, OFL): no network fetch at build.
const geist = () =>
  readFile(join(process.cwd(), "src", "app", "fonts", "Geist-Bold.ttf"));

const ink = "#161616";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#ffffff",
        color: ink,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "100px 80px 0",
        fontFamily: "Geist",
        fontWeight: 700,
      }}
    >
      <div style={{ fontSize: 104, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
        W.S. Gong
      </div>
      <div style={{ height: 1, background: ink, marginTop: 40 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 56,
          fontSize: 80,
          letterSpacing: "-0.03em",
        }}
      >
        <div style={{ width: 32, height: 32, background: ink }} />
        {TAGLINE}
      </div>
    </div>,
    { ...size, fonts: [{ name: "Geist", data: await geist(), weight: 700 }] },
  );
}
