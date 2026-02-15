import { expectedScore } from "./elo";

const GAPS = [0, 50, 100, 150, 200, 300, 400, 500];

export function RatingGapTable() {
  const rows = GAPS.map((gap) => {
    const higher = expectedScore(gap, 0) * 100;
    const lower = 100 - higher;
    return { gap, higher, lower };
  });

  return (
    <div className="not-prose my-8 overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm md:text-base">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-3 py-2 font-medium md:px-4">Rating gap</th>
            <th className="px-3 py-2 font-medium md:px-4">Higher-rated win%</th>
            <th className="px-3 py-2 font-medium md:px-4">Lower-rated win%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ gap, higher, lower }) => (
            <tr key={gap} className="border-b border-gray-100 last:border-0">
              <td className="px-3 py-2 font-mono md:px-4">+{gap}</td>
              <td className="px-3 py-2 md:px-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 md:w-32">
                    <div
                      className="h-full rounded-full bg-columbiaYellow"
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
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 md:w-32">
                    <div
                      className="h-full rounded-full bg-gray-400"
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
