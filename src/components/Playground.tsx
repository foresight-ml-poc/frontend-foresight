import { useState } from "react";
import { predict, type ModelInfo, type Prediction, type SignalInput } from "../api";
import { Gauge } from "./Gauge";

const DEFAULT: SignalInput = {
  direction: "BUY_YES",
  market_price_at_signal: 0.42,
  impact_strength: 0.75,
  llm_confidence: 0.82,
  ambiguity_score: 0.18,
  specificity_score: 0.7,
  cosine_score: 0.65,
  tier_1_count: 2,
  tier_2_count: 1,
  tier_3_count: 0,
  bucket: "geopolitics",
  articles_count: 4,
  unique_sources_count: 3,
  hour_of_day: 14,
};

const BUCKETS = ["geopolitics", "politics", "sports", "crypto", "economics", "science", "other"] as const;

const SLIDERS: { key: keyof SignalInput; label: string; hint: string }[] = [
  { key: "cosine_score", label: "cosine_score", hint: "similarité news↔marché (retrieval)" },
  { key: "market_price_at_signal", label: "market_price", hint: "prix YES au signal" },
  { key: "impact_strength", label: "impact_strength", hint: "force d'impact (GPT-4o)" },
  { key: "llm_confidence", label: "llm_confidence", hint: "confiance LLM" },
  { key: "ambiguity_score", label: "ambiguity_score", hint: "ambiguïté (haut = mauvais)" },
  { key: "specificity_score", label: "specificity_score", hint: "spécificité news↔marché" },
];

const COUNTS: { key: keyof SignalInput; label: string; max: number }[] = [
  { key: "tier_1_count", label: "tier_1", max: 10 },
  { key: "tier_2_count", label: "tier_2", max: 10 },
  { key: "tier_3_count", label: "tier_3", max: 10 },
  { key: "articles_count", label: "articles", max: 30 },
  { key: "unique_sources_count", label: "sources", max: 30 },
  { key: "hour_of_day", label: "heure UTC", max: 23 },
];

export function Playground({ info }: { info: ModelInfo }) {
  const [s, setS] = useState<SignalInput>(DEFAULT);
  const [pred, setPred] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof SignalInput>(k: K, v: SignalInput[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true);
    setErr(null);
    try {
      setPred(await predict(s));
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  };

  const win = pred && pred.predicted_label === 1;

  return (
    <div className="rounded-2xl border border-obsidian-700 bg-obsidian-900 p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">Prédiction live</h2>
        <span className="text-sm text-ink-muted">
          modèle <span className="text-mint">{info.best_model_type}</span> ·{" "}
          {info.model_version}
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Inputs */}
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="direction">
              <Segmented
                value={s.direction}
                options={["BUY_YES", "BUY_NO"]}
                onChange={(v) => set("direction", v as SignalInput["direction"])}
              />
            </Field>
            <Field label="bucket">
              <select
                value={s.bucket}
                onChange={(e) => set("bucket", e.target.value as SignalInput["bucket"])}
                className="w-full rounded-lg border border-obsidian-600 bg-obsidian-800 px-3 py-2 text-sm text-ink focus:border-mint focus:outline-none"
              >
                {BUCKETS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {SLIDERS.map((f) => (
              <div key={f.key}>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm text-ink">{f.label}</span>
                  <span className="font-mono text-sm text-mint tabular-nums">
                    {(s[f.key] as number).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={s[f.key] as number}
                  onChange={(e) => set(f.key, parseFloat(e.target.value) as never)}
                  className="mt-2 w-full"
                />
                <span className="text-xs text-ink-dim">{f.hint}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {COUNTS.map((c) => (
              <label key={c.key} className="block">
                <span className="block text-xs text-ink-muted">{c.label}</span>
                <input
                  type="number"
                  min={c.key === "articles_count" || c.key === "unique_sources_count" ? 1 : 0}
                  max={c.max}
                  value={s[c.key] as number}
                  onChange={(e) =>
                    set(c.key, parseInt(e.target.value || "0", 10) as never)
                  }
                  className="mt-1 w-full rounded-lg border border-obsidian-600 bg-obsidian-800 px-2 py-1.5 text-sm font-mono text-ink focus:border-mint focus:outline-none"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-obsidian-700 bg-obsidian-950 p-6">
          {pred ? (
            <div className="animate-fade-up flex flex-col items-center gap-4">
              <Gauge value={pred.probability_winning} />
              <div
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  win
                    ? "bg-mint/15 text-mint"
                    : "bg-loss/15 text-loss"
                }`}
              >
                {win ? "▲ SIGNAL GAGNANT" : "▼ SIGNAL PERDANT"}
              </div>
              <span className="text-xs text-ink-dim">
                seuil {pred.threshold_used} · {pred.model_type}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="grid h-[200px] w-[200px] place-items-center rounded-full border border-dashed border-obsidian-600">
                <span className="text-sm text-ink-dim">en attente</span>
              </div>
            </div>
          )}

          <button
            onClick={run}
            disabled={loading}
            className="w-full rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-obsidian-950 transition hover:bg-mint/90 disabled:opacity-50"
          >
            {loading ? "Calcul…" : "Prédire"}
          </button>
          {err && <span className="text-xs text-loss">{err}</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-sm text-ink">{label}</span>
      {children}
    </label>
  );
}

function Segmented<T extends string>({
  value, options, onChange,
}: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg border border-obsidian-600 bg-obsidian-800 p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            value === o
              ? "bg-mint text-obsidian-950"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
