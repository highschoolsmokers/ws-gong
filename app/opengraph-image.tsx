import { ImageResponse } from "next/og";

export const alt = "W.S. Gong";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGeistFont(): Promise<ArrayBuffer> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Geist:wght@700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (url) return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    /* fall through */
  }
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const buf = await readFile(
    join(
      process.cwd(),
      "node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
    ),
  );
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export default async function Image() {
  const fontData = await loadGeistFont();

  return new ImageResponse(
    <div
      style={{
        background: "#f2ede4",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: "100px 80px 0 80px",
        fontFamily: "Geist",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 104,
          fontWeight: 700,
          color: "black",
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span>W.S. Gong</span>
      </div>

      {/* Horizontal rule */}
      <div
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "black",
          marginTop: 40,
          display: "flex",
        }}
      />

      {/* Tagline with icon */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          marginTop: 56,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            backgroundColor: "black",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "black",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Narratives. Code.
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: fontData,
          weight: 700,
          style: "normal" as const,
        },
      ],
    },
  );
}
