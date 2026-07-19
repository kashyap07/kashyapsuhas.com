import { DANGER, MUTED, OgFrame, SUBTLE, SUCCESS, ogImage } from "@utils/og";

export const alt = "Raagle, a daily melakarta listening game";
export { contentType, size } from "@utils/og";

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

export default function Image() {
  return ogImage(
    <OgFrame path="goodies/raagle">
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
                    : DANGER,
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
    </OgFrame>,
  );
}
