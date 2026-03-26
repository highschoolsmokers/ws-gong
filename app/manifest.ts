import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "W.S. Gong",
    short_name: "W.S. Gong",
    description:
      "W.S. Gong — writer, editor, and technical writer based in San Francisco.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2ede4",
    theme_color: "#f2ede4",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
