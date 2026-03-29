import { expectedScore } from "./elo";

const GAPS = [0, 50, 100, 150, 200, 300, 400, 500];

export function RatingGapTable() {
  const rows = GAPS.map((gap) => {
    const higher = expectedScore(gap, 0) * 100;
    const lower = 100 - higher;
    return { gap, higher, lower };
  });

  return (
    <div className="not-prose my-8 overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm md:text-base">
        <thead>
          <tr className="border-b border-line bg-surface-subtle text-left">
            <th className="px-3 py-2 font-medium md:px-4">Rating gap</th>
            <th className="px-3 py-2 font-medium md:px-4">Higher-rated win%</th>
            <th className="px-3 py-2 font-medium md:px-4">Lower-rated win%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ gap, higher, lower }) => (
            <tr key={gap} className="border-b border-line-subtle last:border-0">
              <td className="px-3 py-2 font-mono md:px-4">+{gap}</td>
              <td className="px-3 py-2 md:px-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-line md:w-32">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${higher}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs md:text-sm">
                    {higher.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 md:px-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-line md:w-32">
                    <div
                      className="h-full rounded-full bg-subtle"
                      style={{ width: `${lower}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs md:text-sm">
                    {lower.toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
