import { useEffect, useState } from "react";
import { getModelInfo, predict, type ModelInfo, type Prediction, type SignalInput } from "./api";

const DEFAULT_SIGNAL: SignalInput = {
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

export default function App() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [signal, setSignal] = useState<SignalInput>(DEFAULT_SIGNAL);
  const [pred, setPred] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getModelInfo()
      .then(setInfo)
      .catch((e) => setError(String(e)));
  }, []);

  const update = <K extends keyof SignalInput>(k: K, v: SignalInput[K]) =>
    setSignal((s) => ({ ...s, [k]: v }));

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setPred(null);
    try {
      setPred(await predict(signal));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <h1 className="text-2xl font-semibold">Foresight ML — démo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Prédit si un signal Polymarket va être correct à T+24h.
            Modèle entraîné dans{" "}
            <a
              href="https://github.com/foresight-ml-poc/ml-foresight"
              className="underline hover:text-slate-900"
            >
              ml-foresight
            </a>
            .
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <ModelCard info={info} error={error} />

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Tester /predict</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ajuste les valeurs puis clique « Prédire ».
          </p>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <Select
              label="direction"
              value={signal.direction}
              options={["BUY_YES", "BUY_NO"]}
              onChange={(v) => update("direction", v as "BUY_YES" | "BUY_NO")}
            />
            <Select
              label="bucket"
              value={signal.bucket}
              options={[...BUCKETS]}
              onChange={(v) => update("bucket", v as SignalInput["bucket"])}
            />
            <Slider label="market_price_at_signal" value={signal.market_price_at_signal}
              onChange={(v) => update("market_price_at_signal", v)} />
            <Slider label="cosine_score" value={signal.cosine_score}
              onChange={(v) => update("cosine_score", v)} />
            <Slider label="impact_strength" value={signal.impact_strength}
              onChange={(v) => update("impact_strength", v)} />
            <Slider label="llm_confidence" value={signal.llm_confidence}
              onChange={(v) => update("llm_confidence", v)} />
            <Slider label="ambiguity_score" value={signal.ambiguity_score}
              onChange={(v) => update("ambiguity_score", v)} />
            <Slider label="specificity_score" value={signal.specificity_score}
              onChange={(v) => update("specificity_score", v)} />
            <NumberInput label="tier_1_count" value={signal.tier_1_count} min={0} max={20}
              onChange={(v) => update("tier_1_count", v)} />
            <NumberInput label="tier_2_count" value={signal.tier_2_count} min={0} max={20}
              onChange={(v) => update("tier_2_count", v)} />
            <NumberInput label="tier_3_count" value={signal.tier_3_count} min={0} max={20}
              onChange={(v) => update("tier_3_count", v)} />
            <NumberInput label="articles_count" value={signal.articles_count} min={1} max={50}
              onChange={(v) => update("articles_count", v)} />
            <NumberInput label="unique_sources_count" value={signal.unique_sources_count} min={1} max={50}
              onChange={(v) => update("unique_sources_count", v)} />
            <NumberInput label="hour_of_day" value={signal.hour_of_day} min={0} max={23}
              onChange={(v) => update("hour_of_day", v)} />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? "Calcul…" : "Prédire"}
            </button>

            {pred && <PredictionResult pred={pred} />}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </section>
      </main>
    </div>
  );
}

function ModelCard({ info, error }: { info: ModelInfo | null; error: string | null }) {
  if (error && !info) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Erreur en chargeant le modèle : {error}. Le backend est-il bien lancé sur{" "}
        <code className="rounded bg-red-100 px-1">{import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"}</code> ?
      </section>
    );
  }
  if (!info) {
    return <section className="text-sm text-slate-500">Chargement du modèle…</section>;
  }

  const best = info.test_metrics?.[info.best_model_type];
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Modèle chargé</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <Stat label="Type" value={info.best_model_type} />
        <Stat label="Version" value={info.model_version} />
        <Stat
          label="Dataset"
          value={
            info.dataset_size
              ? `${info.dataset_size.total} (train ${info.dataset_size.train} / test ${info.dataset_size.test})`
              : "—"
          }
        />
        <Stat label="Test ROC-AUC" value={best ? best.roc_auc.toFixed(3) : "—"} />
      </dl>
      {info.heuristic_baseline && best && (
        <p className="mt-4 text-sm text-slate-600">
          Vs heuristique Foresight (ROC-AUC {info.heuristic_baseline.roc_auc.toFixed(3)}) :{" "}
          <span className="font-semibold">
            {(best.roc_auc - info.heuristic_baseline.roc_auc >= 0 ? "+" : "") +
              ((best.roc_auc - info.heuristic_baseline.roc_auc) * 100).toFixed(1)} pts
          </span>
        </p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-base font-medium">{value}</dd>
    </div>
  );
}

function PredictionResult({ pred }: { pred: Prediction }) {
  const win = pred.predicted_label === 1;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={`rounded-md px-2 py-1 font-semibold ${win ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
        {win ? "🟢 GAIN" : "🔴 LOSS"}
      </span>
      <span className="text-slate-600">
        proba = <span className="font-mono">{pred.probability_winning.toFixed(3)}</span> ·
        modèle = {pred.model_type} {pred.model_version}
      </span>
    </div>
  );
}

function Slider({
  label, value, onChange, min = 0, max = 1, step = 0.01,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono text-slate-700">{label}</span>
        <span className="font-mono text-slate-500">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-1 w-full"
      />
    </label>
  );
}

function NumberInput({
  label, value, onChange, min, max,
}: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-mono text-slate-700">{label}</span>
      <input
        type="number"
        min={min} max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
    </label>
  );
}

function Select<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-mono text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
