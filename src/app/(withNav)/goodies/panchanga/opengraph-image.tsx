import { ImageResponse } from "next/og";

import { FRAUNCES, loadGoogleFont, shapeWords } from "@utils/ogText";

export const alt = "Panchanga, sankalpa mantra elements for any date";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori can't read css vars, mirror globals.css tokens
const ACCENT = "#f0a044";
const FOREGROUND = "#1e293b";
const MUTED = "#64748b";

// mirrors the page's element grid: devanagari label, transliteration, gloss
const ELEMENTS = [
  { deva: "सम्वत्सर", en: "samvatsara", gloss: "year" },
  { deva: "अयन", en: "ayana", gloss: "solar transit" },
  { deva: "ऋतु", en: "ritu", gloss: "season" },
  { deva: "मास", en: "maasa", gloss: "month" },
  { deva: "पक्ष", en: "paksha", gloss: "fortnight" },
  { deva: "तिथि", en: "tithi", gloss: "lunar day" },
  { deva: "वासर", en: "vaasara", gloss: "weekday" },
  { deva: "नक्षत्र", en: "nakshatra", gloss: "lunar mansion" },
];

const LABEL_SIZE = 40;

export default async function Image() {
  const devaText = ELEMENTS.map((e) => e.deva).join(" ");
  const [fraunces, shaped] = await Promise.all([
    loadGoogleFont(
      FRAUNCES,
      "Panchanga Suhas Kashyap goodies/panchanga sankalpa mantra elements, for any date kashyapsuhas.com samvatsara ayana ritu maasa paksha tithi vaasara nakshatra year solar transit season month fortnight lunar day weekday mansion ·",
    ),
    // devanagari needs harfbuzz shaping, satori would mangle the conjuncts
    shapeWords(devaText, LABEL_SIZE, ACCENT),
  ]);

  const labels = shaped ?? [];

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
        <div style={{ color: MUTED, fontSize: 24 }}>goodies / panchanga</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ fontSize: 96, lineHeight: 1 }}>Panchanga</div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 32,
            marginBottom: 32,
          }}
        >
          {ELEMENTS.map((el, i) => (
            <div
              key={el.en}
              style={{
                width: 268,
                display: "flex",
                flexDirection: "column",
                marginBottom: i < 4 ? 24 : 0,
              }}
            >
              {labels[i] ? (
                <img
                  src={labels[i].src}
                  width={labels[i].width}
                  height={labels[i].height}
                  alt=""
                />
              ) : (
                <div style={{ color: ACCENT, fontSize: LABEL_SIZE }}>
                  {el.en}
                </div>
              )}
              <div style={{ color: MUTED, fontSize: 20, marginTop: 4 }}>
                {labels[i] ? `${el.en} · ${el.gloss}` : el.gloss}
              </div>
            </div>
          ))}
        </div>

        <div style={{ color: MUTED, fontSize: 32 }}>
          sankalpa mantra elements, for any date
        </div>
      </div>

      <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>
        kashyapsuhas.com/goodies/panchanga
      </div>
    </div>,
    {
      ...size,
      fonts: fraunces
        ? [{ name: "Fraunces", data: fraunces, style: "normal", weight: 600 }]
        : undefined,
    },
  );
}
