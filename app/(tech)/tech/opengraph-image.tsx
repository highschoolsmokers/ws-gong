import { ImageResponse } from "next/og";

export const alt = "W.S. Gong — Technical Writer & Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: "black",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          W.S. Gong
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#737373",
            marginTop: 20,
            letterSpacing: "0.02em",
          }}
        >
          Technical Writer &amp; Developer
        </div>
      </div>
    ),
    { ...size },
  );
}
