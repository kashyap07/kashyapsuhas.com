import { ImageResponse } from "next/og";

import { FRAUNCES, loadGoogleFont } from "@utils/ogText";

export const alt = "Dreamify, the dreamy wedding-photo look in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#f0a044";
const FOREGROUND = "#1e293b";
const MUTED = "#64748b";

// soft bokeh dots scattered over the card's dreamy sunset gradient
const BOKEH = [
  { x: 24, y: 28, s: 64 },
  { x: 210, y: 14, s: 44 },
  { x: 252, y: 96, s: 82 },
  { x: -18, y: 150, s: 56 },
  { x: 240, y: 300, s: 60 },
  { x: 40, y: 330, s: 40 },
];

export default async function Image() {
  const font = await loadGoogleFont(
    FRAUNCES,
    "Dreamify Suhas Kashyap goodies/dreamy wedding-photo look in your browser kashyapsuhas.com/",
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
        <div style={{ color: MUTED, fontSize: 24 }}>goodies / dreamify</div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, lineHeight: 1 }}>Dreamify</div>
          <div style={{ color: MUTED, fontSize: 32, marginTop: 28 }}>
            the dreamy wedding-photo look,
          </div>
          <div style={{ color: MUTED, fontSize: 32 }}>in your browser</div>
        </div>

        {/* a vertical photo card wearing the focal ellipse guide */}
        <div
          style={{
            position: "relative",
            display: "flex",
            width: 320,
            height: 400,
            borderRadius: 16,
            overflow: "hidden",
            background:
              "linear-gradient(165deg, #fdf0dd 0%, #f8cf9e 30%, #eba36e 62%, #c97f63 100%)",
          }}
        >
          {BOKEH.map((b, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: b.x,
                top: b.y,
                width: b.s,
                height: b.s,
                borderRadius: 9999,
                background:
                  "radial-gradient(circle, rgba(255,248,235,0.95) 0%, rgba(255,248,235,0) 70%)",
              }}
            />
          ))}
          {/* falloff extent, dashed */}
          <div
            style={{
              position: "absolute",
              left: -10,
              top: 66,
              width: 340,
              height: 248,
              borderRadius: "50%",
              border: "2px dashed rgba(255,255,255,0.6)",
              transform: "rotate(-15deg)",
            }}
          />
          {/* focal edge, solid */}
          <div
            style={{
              position: "absolute",
              left: 50,
              top: 110,
              width: 220,
              height: 160,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.95)",
              transform: "rotate(-15deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 156,
              top: 186,
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: "#fff",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>
        kashyapsuhas.com/goodies/dreamify
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
