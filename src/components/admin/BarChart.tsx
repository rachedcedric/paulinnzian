import { formatAxis, niceAxisMax, type SeriesPoint } from "@/lib/dashboard-stats";

interface Props {
  data: SeriesPoint[];
  color: string; // tailwind bg class for bars
  formatValue: (n: number) => string;
}

/** Dependency-free responsive bar chart (HTML/CSS). */
export function BarChart({ data, color, formatValue }: Props) {
  const max = niceAxisMax(Math.max(0, ...data.map((d) => d.value)));
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(max * f));
  // Show ~8 x labels at most.
  const every = Math.max(1, Math.ceil(data.length / 8));
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="flex h-44 w-full min-w-0 gap-2" role="img" aria-label="Graphique">
      <div className="flex h-[calc(100%-1.25rem)] flex-col justify-between text-right text-[10px] leading-none text-gray-400">
        {ticks.map((t, i) => <span key={i}>{formatAxis(t)}</span>)}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="absolute inset-x-0 top-0 h-[calc(100%-1.25rem)]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute inset-x-0 border-t border-gray-100" style={{ top: `${i * 25}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[3px]">
            {data.map((d, i) => (
              <div key={i} className="group relative flex h-full min-w-0 flex-1 items-end" title={`${d.label} : ${formatValue(d.value)}`}>
                <div
                  className={`w-full rounded-t-[3px] ${color} opacity-90 transition-opacity group-hover:opacity-100`}
                  style={{ height: `${d.value > 0 ? Math.max(2, (d.value / max) * 100) : 0}%` }}
                />
              </div>
            ))}
          </div>
          {!hasData && (
            <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Aucune donnée sur cette période</p>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-5 gap-[3px] text-[10px] text-gray-400">
          {data.map((d, i) => (
            <span key={i} className="relative min-w-0 flex-1">
              {i % every === 0 && <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{d.label}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
