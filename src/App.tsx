import { useEffect, useState } from "react";
import { getModelInfo, type ModelInfo } from "./api";
import { ModelComparison } from "./components/ModelComparison";
import { Playground } from "./components/Playground";

export default function App() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getModelInfo().then(setInfo).catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Header info={info} />

      <main className="mx-auto max-w-5xl px-5 pb-24">
        <Hero info={info} />

        {err && !info && (
          <div className="mt-8 rounded-xl border border-loss/30 bg-loss/10 p-5 text-sm text-loss">
            Impossible de joindre le backend (
            <code className="font-mono">
              {import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"}
            </code>
            ). Lance-le avec <code className="font-mono">uvicorn app.main:app --port 8000</code>.
            <div className="mt-1 text-loss/70">{err}</div>
          </div>
        )}

        {info && (
          <div className="mt-12 space-y-12">
            <ModelComparison info={info} />
            <Playground info={info} />
            <DatasetSection info={info} />
          </div>
        )}

        {!info && !err && (
          <div className="mt-16 text-center text-ink-dim">Chargement du modèle…</div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Header({ info }: { info: ModelInfo | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-obsidian-800 bg-obsidian-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-mint/15">
            <span className="text-mint">◆</span>
          </div>
          <span className="font-semibold tracking-tight">Foresight ML</span>
          {info && (
            <span className="ml-2 rounded-full border border-obsidian-700 px-2 py-0.5 font-mono text-xs text-ink-muted">
              {info.model_version}
            </span>
          )}
        </div>
        <a
          href="https://github.com/foresight-ml-poc"
          className="text-sm text-ink-muted transition hover:text-ink"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
}

function Hero({ info }: { info: ModelInfo | null }) {
  return (
    <section className="pt-16">
      <p className="font-mono text-sm text-mint">POC machine learning · Albert School</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
        Peut-on battre une heuristique de trading avec du machine learning ?
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
        Foresight émet des signaux sur Polymarket notés par une formule fixe
        (winrate 46–48 % à T+24h). On entraîne 6 modèles pour prédire si un
        signal sera correct — et on compare honnêtement à l'heuristique.
      </p>
      {info?.dataset_size && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Pill label="Signaux" value={String(info.dataset_size.total)} />
          <Pill label="Train" value={String(info.dataset_size.train)} />
          <Pill label="Test" value={String(info.dataset_size.test)} />
          <Pill label="Best model" value={info.best_model_type} accent />
        </div>
      )}
    </section>
  );
}

function Pill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-obsidian-700 bg-obsidian-900 px-4 py-2.5">
      <div className="text-xs uppercase tracking-wider text-ink-dim">{label}</div>
      <div className={`mt-0.5 font-mono text-sm ${accent ? "text-mint" : "text-ink"}`}>
        {value}
      </div>
    </div>
  );
}

function DatasetSection({ info }: { info: ModelInfo }) {
  const m = info.test_metrics[info.best_model_type];
  const h = info.heuristic_baseline;
  const cells = [
    ["Best model", info.best_model_type],
    ["Version", info.model_version],
    ["Entraîné le", new Date(info.trained_at).toLocaleString("fr-FR")],
    ["Features", String(info.feature_order.length)],
    ["Best ROC-AUC", m.roc_auc.toFixed(3)],
    ["Heuristique ROC-AUC", h.roc_auc.toFixed(3)],
    ["Best F1", m.f1.toFixed(3)],
    ["Best precision", m.precision.toFixed(3)],
  ];
  return (
    <div className="rounded-2xl border border-obsidian-700 bg-obsidian-900 p-6 md:p-8">
      <h2 className="text-xl font-semibold">Model card</h2>
      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-obsidian-700 bg-obsidian-700 sm:grid-cols-4">
        {cells.map(([k, v]) => (
          <div key={k} className="bg-obsidian-900 p-4">
            <div className="text-xs uppercase tracking-wider text-ink-dim">{k}</div>
            <div className="mt-1 break-words font-mono text-sm text-ink">{v}</div>
          </div>
        ))}
      </div>
      {info.notes && (
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">{info.notes}</p>
      )}
    </div>
  );
}

function Footer() {
  const repos = [
    ["ml-foresight", "pipeline ML"],
    ["backend-foresight", "API FastAPI"],
    ["frontend-foresight", "cette démo"],
  ];
  return (
    <footer className="border-t border-obsidian-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <span>Vadim Capton · Albert School · 2026</span>
        <div className="flex flex-wrap gap-4">
          {repos.map(([r, d]) => (
            <a
              key={r}
              href={`https://github.com/foresight-ml-poc/${r}`}
              className="transition hover:text-mint"
            >
              <span className="font-mono">{r}</span>{" "}
              <span className="text-ink-dim">— {d}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
