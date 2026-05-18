/** SVG circular gauge showing a probability 0..1. */
export function Gauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  const size = 200;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.75; // 270° arc
  const filled = dash * pct;

  const isWin = pct >= 0.5;
  const color = isWin ? "#0BE0A6" : "#f76d6d";

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1a212d"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="font-mono text-4xl font-semibold tabular-nums"
          style={{ color }}
        >
          {(pct * 100).toFixed(1)}%
        </span>
        <span className="mt-1 text-xs uppercase tracking-widest text-ink-muted">
          proba gain
        </span>
      </div>
    </div>
  );
}
