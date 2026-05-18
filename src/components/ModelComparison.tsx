import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ModelInfo } from "../api";

const PRETTY: Record<string, string> = {
  logreg: "Logistic Reg.",
  random_forest: "Random Forest",
  gradient_boosting: "Gradient Boosting",
  lightgbm: "LightGBM",
  xgboost: "XGBoost",
  svm: "SVM (RBF)",
};

export function ModelComparison({ info }: { info: ModelInfo }) {
  const h = info.heuristic_baseline.roc_auc;

  const rows = Object.entries(info.test_metrics)
    .map(([k, m]) => ({
      name: PRETTY[k] ?? k,
      key: k,
      roc: Number(m.roc_auc.toFixed(3)),
      isBest: k === info.best_model_type,
    }))
    .sort((a, b) => b.roc - a.roc);

  const all = [
    { name: "Heuristique", key: "heuristic", roc: Number(h.toFixed(3)), isBest: false, isHeuristic: true },
    ...rows.map((r) => ({ ...r, isHeuristic: false })),
  ].sort((a, b) => b.roc - a.roc);

  const best = rows[0];
  const delta = ((best.roc - h) * 100).toFixed(1);
  const deltaSign = best.roc - h >= 0 ? "+" : "";

  return (
    <div className="rounded-2xl border border-obsidian-700 bg-obsidian-900 p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">Comparaison des modèles</h2>
        <span className="text-sm text-ink-muted">
          ROC-AUC sur le test set ({info.dataset_size?.test ?? "?"} signaux)
        </span>
      </div>

      <div className="mt-6 h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={all}
            layout="vertical"
            margin={{ left: 10, right: 50, top: 4, bottom: 4 }}
          >
            <XAxis
              type="number"
              domain={[0.4, 0.6]}
              tick={{ fill: "#5c6878", fontSize: 12 }}
              axisLine={{ stroke: "#1a212d" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "#9aa7b8", fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              x={0.5}
              stroke="#5c6878"
              strokeDasharray="4 4"
              label={{ value: "hasard", fill: "#5c6878", fontSize: 11, position: "top" }}
            />
            <Bar dataKey="roc" radius={[0, 4, 4, 0]} barSize={22}>
              {all.map((d) => (
                <Cell
                  key={d.key}
                  fill={
                    d.isHeuristic
                      ? "#5c6878"
                      : d.isBest
                      ? "#0BE0A6"
                      : "#1f6f5c"
                  }
                />
              ))}
              <LabelList
                dataKey="roc"
                position="right"
                fill="#e7edf5"
                fontSize={12}
                className="font-mono"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-xl border border-obsidian-700 bg-obsidian-800 p-4 text-sm leading-relaxed text-ink-muted">
        Le meilleur modèle (<span className="text-mint">{best.name}</span>,
        ROC-AUC {best.roc}) bat l'heuristique de Foresight ({h.toFixed(3)}) de{" "}
        <span className="font-mono text-ink">
          {deltaSign}
          {delta} pts
        </span>
        . En v1.2.0 (test set 2× plus petit) l'écart était de +3.7 pts — il
        s'est effondré avec plus de données. <span className="text-ink">Le ML
        égale l'heuristique sans la battre clairement</span> : c'est le résultat
        honnête.
      </div>
    </div>
  );
}
