// skew-normal: peak ~950, fat tails both sides, ~700 above 1750
const LOCATION = 700;
const SCALE = 350;
const SHAPE = 1.3; // mild skew
const N = 50000;
const X_MIN = 0;
const X_MAX = 3000;
const MARK = 1750;
const BIN_EQUIV = 10;
const NUM_POINTS = 600;

function stdNormalPDF(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

function stdNormalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const p =
    stdNormalPDF(x) *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
}

function skewPDF(x: number): number {
  const z = (x - LOCATION) / SCALE;
  return (2 / SCALE) * stdNormalPDF(z) * stdNormalCDF(SHAPE * z);
}

const step = (X_MAX - X_MIN) / NUM_POINTS;
const curve: { x: number; y: number }[] = [];
let maxY = 0;
let cdfAtMark = 0;

for (let i = 0; i <= NUM_POINTS; i++) {
  const x = X_MIN + i * step;
  const density = skewPDF(x);
  const y = density * N * BIN_EQUIV;
  curve.push({ x, y });
  if (y > maxY) maxY = y;
  if (x <= MARK) cdfAtMark += density * step;
}

const playersAbove = Math.round(N * (1 - cdfAtMark));

const width = 700;
const height = 340;
const padLeft = 60;
const padRight = 20;
const padTop = 30;
const padBottom = 50;
const plotW = width - padLeft - padRight;
const plotH = height - padTop - padBottom;

const yMax = Math.ceil(maxY / 100) * 100;
const yTickStep = yMax <= 400 ? 50 : yMax <= 800 ? 100 : 200;
const yTicks: number[] = [];
for (let v = 0; v <= yMax; v += yTickStep) yTicks.push(v);

const xTicks = [0, 500, 1000, 1500, 2000, 2500, 3000];

const xScale = (v: number) => padLeft + (v / X_MAX) * plotW;
const yScale = (v: number) => padTop + plotH - (v / yMax) * plotH;

const baseline = yScale(0);
const pathParts = [`M${xScale(curve[0].x).toFixed(1)},${baseline.toFixed(1)}`];
for (const pt of curve) {
  pathParts.push(`L${xScale(pt.x).toFixed(1)},${yScale(pt.y).toFixed(1)}`);
}
pathParts.push(
  `L${xScale(curve[curve.length - 1].x).toFixed(1)},${baseline.toFixed(1)}Z`,
);
const areaPath = pathParts.join(" ");

const strokeParts = curve.map(
  (pt, i) =>
    `${i === 0 ? "M" : "L"}${xScale(pt.x).toFixed(1)},${yScale(pt.y).toFixed(1)}`,
);
const strokePath = strokeParts.join(" ");

export function RatingDistribution() {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-lg border border-gray-200">
      <div className="flex items-baseline justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
        <span className="text-sm font-medium">1v1 Random Map</span>
        <span className="font-mono text-xs text-gray-500">
          N = {N.toLocaleString()}
        </span>
      </div>

      <div className="bg-white p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={padLeft}
                y1={yScale(v)}
                x2={width - padRight}
                y2={yScale(v)}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
              <text
                x={padLeft - 8}
                y={yScale(v) + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                {v}
              </text>
            </g>
          ))}

          <text
            x={16}
            y={padTop + plotH / 2}
            textAnchor="middle"
            fontSize="11"
            fill="#6b7280"
            transform={`rotate(-90, 16, ${padTop + plotH / 2})`}
          >
            Number of Players
          </text>

          <path d={areaPath} fill="#4caf50" opacity="0.7" />
          <path d={strokePath} fill="none" stroke="#388e3c" strokeWidth="1.5" />

          <line
            x1={xScale(MARK)}
            y1={padTop}
            x2={xScale(MARK)}
            y2={baseline}
            stroke="#f0a044"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
          <rect
            x={xScale(MARK) - 52}
            y={padTop - 2}
            width={104}
            height={22}
            rx={4}
            fill="#f0a044"
          />
          <text
            x={xScale(MARK)}
            y={padTop + 13}
            textAnchor="middle"
            fontSize="11"
            fontWeight="500"
            fill="white"
          >
            1750 - I'm here!
          </text>

          <line
            x1={padLeft}
            y1={baseline}
            x2={width - padRight}
            y2={baseline}
            stroke="#9ca3af"
            strokeWidth="1"
          />
          {xTicks.map((v) => (
            <g key={v}>
              <line
                x1={xScale(v)}
                y1={baseline}
                x2={xScale(v)}
                y2={baseline + 6}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <text
                x={xScale(v)}
                y={baseline + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {v}
              </text>
            </g>
          ))}

          <text
            x={padLeft + plotW / 2}
            y={height - 6}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            Elo Rating
          </text>
        </svg>
      </div>
    </div>
  );
}
