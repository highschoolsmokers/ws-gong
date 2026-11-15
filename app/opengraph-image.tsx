import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "W.S. Gong";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Geist Bold from Google Fonts; Next's bundled copy if the fetch fails.
async function geist(): Promise<ArrayBuffer> {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Geist:wght@700")
    ).text();
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (url) return await (await fetch(url)).arrayBuffer();
  } catch {}
  const buf = await readFile(
    join(
      process.cwd(),
      "node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
    ),
  );
  return new Uint8Array(buf).buffer;
}

const ink = "#161616";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#f3efe7",
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
        Stories &amp; Systems
      </div>
    </div>,
    { ...size, fonts: [{ name: "Geist", data: await geist(), weight: 700 }] },
  );
}
