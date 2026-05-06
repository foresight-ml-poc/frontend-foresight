const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export type ModelInfo = {
  model_version: string;
  best_model_type: string;
  trained_at: string;
  feature_order: string[];
  test_metrics: Record<string, Record<string, number>>;
  heuristic_baseline: Record<string, number>;
  dataset_size?: { train: number; test: number; total: number };
  notes?: string;
};

export type SignalInput = {
  direction: "BUY_YES" | "BUY_NO";
  market_price_at_signal: number;
  impact_strength: number;
  llm_confidence: number;
  ambiguity_score: number;
  specificity_score: number;
  cosine_score: number;
  tier_1_count: number;
  tier_2_count: number;
  tier_3_count: number;
  bucket: "geopolitics" | "politics" | "sports" | "crypto" | "economics" | "science" | "other";
  articles_count: number;
  unique_sources_count: number;
  hour_of_day: number;
};

export type Prediction = {
  probability_winning: number;
  predicted_label: 0 | 1;
  threshold_used: number;
  model_version: string;
  model_type: string;
};

export async function getModelInfo(): Promise<ModelInfo> {
  const r = await fetch(`${BACKEND_URL}/model/info`);
  if (!r.ok) throw new Error(`GET /model/info failed: ${r.status}`);
  return r.json();
}

export async function predict(signal: SignalInput): Promise<Prediction> {
  const r = await fetch(`${BACKEND_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signal),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`POST /predict failed: ${r.status} — ${txt}`);
  }
  return r.json();
}
