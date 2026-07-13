import { ImageResponse } from "next/og";

import { FRAUNCES, loadGoogleFont } from "@utils/ogText";

export const alt = "Ragle, a daily melakarta listening game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#f0a044";
const FOREGROUND = "#1e293b";
const MUTED = "#64748b";
const SUCCESS = "#16a34a";
const SURFACE = "#f8fafc";
const LINE = "#e5e7eb";

const CELLS = ["sa", "ri", "ga", "ma", "pa", "da", "ni"];

export default async function Image() {
  const font = await loadGoogleFont(
    FRAUNCES,
    "Ragle Suhas Kashyap a daily melakarta listening game sa ri ga ma pa da ni kashyapsuhas.com",
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fff",
        color: FOREGROUND,
        padding: 64,
        fontFamily: "Fraunces",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: ACCENT, fontSize: 32 }}>Suhas Kashyap</div>
        <div style={{ color: MUTED, fontSize: 24 }}>goodies / ragle</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 104, lineHeight: 1 }}>Ragle</div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 30,
            marginBottom: 30,
          }}
        >
          {CELLS.map((cell, index) => {
            const correct = index === 0 || index === 2 || index === 4;
            return (
              <div
                key={cell}
                style={{
                  width: 88,
                  height: 88,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: `2px solid ${correct ? SUCCESS : LINE}`,
                  background: correct ? SUCCESS : SURFACE,
                  color: correct ? "#fff" : MUTED,
                  fontSize: 28,
                }}
              >
                {cell}
              </div>
            );
          })}
        </div>
        <div style={{ color: MUTED, fontSize: 32 }}>
          a daily melakarta listening game
        </div>
      </div>

      <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>
        kashyapsuhas.com/goodies/ragle
      </div>
    </div>,
    {
      ...size,
      fonts: font
        ? [{ name: "Fraunces", data: font, style: "normal", weight: 600 }]
        : undefined,
    },
  );
}
