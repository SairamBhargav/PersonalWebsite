import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

export const ogSize = { width: 1200, height: 630 };

const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Italic.ttf")),
]);

/** Shared social-card template: violet on near-black, serif title. */
export async function renderOg({ eyebrow, title }: { eyebrow: string; title: string }) {
  const [regular, italic] = await fontsPromise;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0a0b",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(124,58,237,0.55), transparent 45%), radial-gradient(circle at 5% 110%, rgba(76,29,149,0.6), transparent 45%)",
          color: "#ededef",
          fontFamily: "Instrument Serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, color: "#a78bfa" }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 999,
              border: "1.5px solid #a78bfa",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            {site.shortName}
          </div>
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 40 ? 76 : 104, lineHeight: 1.02, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#8b8b94" }}>
          <span style={{ fontStyle: "italic", color: "#a78bfa" }}>{site.name}</span>
          <span>bhargavsairam.me</span>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Instrument Serif", data: regular, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
