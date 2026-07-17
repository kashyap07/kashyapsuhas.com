import { ImageResponse } from "next/og";

import { FRAUNCES, loadGoogleFont } from "@utils/ogText";

export const alt = "Raagle, a daily melakarta listening game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#f0a044";
const FOREGROUND = "#1e293b";
const MUTED = "#64748b";
const SUCCESS = "#16a34a";
const WRONG = "#dc2626";
const SUBTLE = "#94a3b8";

// mirrors the board: sa, pa and the upper sa are fixed ghosts, never scored
const CELLS = [
  { label: "sa", fixed: true },
  { label: "ri", correct: false },
  { label: "ga", correct: true },
  { label: "ma", correct: true },
  { label: "pa", fixed: true },
  { label: "da", correct: false },
  { label: "ni", correct: true },
  { label: "sa", fixed: true, upper: true },
];

export default async function Image() {
  const font = await loadGoogleFont(
    FRAUNCES,
    "Raagle Suhas Kashyap A daily Mēḷakartā raaga guessing game goodies sa ri ga ma pa da ni kashyapsuhas.com/ •",
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
        <div style={{ color: MUTED, fontSize: 24 }}>goodies / raagle</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 104, lineHeight: 1 }}>Raagle</div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 30,
            marginBottom: 30,
          }}
        >
          {CELLS.map((cell, index) => (
            <div
              key={index}
              style={{
                width: 88,
                height: 88,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: cell.fixed
                  ? "transparent"
                  : cell.correct
                    ? SUCCESS
                    : WRONG,
                color: cell.fixed ? SUBTLE : "#fff",
                fontSize: 28,
              }}
            >
              <div style={{ height: 20, fontSize: 20 }}>
                {cell.upper ? "•" : " "}
              </div>
              <div>{cell.label}</div>
            </div>
          ))}
        </div>
        <div style={{ color: MUTED, fontSize: 32 }}>
          A daily Mēḷakartā raaga guessing game
        </div>
      </div>

      <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>
        kashyapsuhas.com/goodies/raagle
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
