import { ACCENT, MUTED, OgFrame, ogImage, shapeWords } from "@utils/og";

export const alt = "Panchanga sankalpa mantra elements";
export { contentType, size } from "@utils/og";

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
  // devanagari needs harfbuzz shaping, satori would mangle the conjuncts
  const shaped = await shapeWords(
    ELEMENTS.map((e) => e.deva).join(" "),
    LABEL_SIZE,
    ACCENT,
  );
  const labels = shaped ?? [];

  return ogImage(
    <OgFrame path="goodies/panchanga">
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
      </div>
    </OgFrame>,
  );
}
