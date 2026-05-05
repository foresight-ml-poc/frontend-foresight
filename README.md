# frontend-foresight

> Demo React pour le POC ML Foresight.
> Projet école Albert School · 2026-05.

![Status](https://img.shields.io/badge/status-design--phase-orange) · React 18 · TypeScript · Vite

## Rôle

Application web qui consomme l'API
[backend-foresight](https://github.com/foresight-ml-poc/backend-foresight)
pour afficher visuellement la **comparaison entre le scoring heuristique et
les prédictions ML** sur des signaux d'exemple.

Sert de **vitrine produit** lors de la soutenance école.

## Vues prévues

1. **Signaux Demo** — tableau de 30 signaux avec colonnes :
   - Question marché Polymarket
   - Score heuristique (badge vert/rouge selon seuil)
   - Probabilité ML
   - Verdict réel (`direction_correct` à T+24h)
   - ✓ / ✗
   - En haut : bar chart winrate heuristique vs ML — la punchline visuelle

2. **Tester /predict** — formulaire avec sliders pour les ~20 features,
   appelle `/predict` du backend, affiche probabilité + label + version du
   modèle.

## Architecture (3 repos)

| Repo | Rôle |
|---|---|
| [ml-foresight](https://github.com/foresight-ml-poc/ml-foresight) | Pipeline ML, training, évaluation, Streamlit dashboard |
| [backend-foresight](https://github.com/foresight-ml-poc/backend-foresight) | API FastAPI d'inférence |
| **frontend-foresight** *(ici)* | Demo React qui compare prédictions ML vs heuristique |

## Documentation

- 📄 **[Design document complet](./docs/specs/2026-05-05-design.md)** —
  voir notamment §10 pour les détails de ce repo

## Quickstart (à venir)

```bash
# 1. Setup
npm install
cp .env.example .env   # renseigner VITE_BACKEND_URL=http://localhost:8000

# 2. Lancer en dev
npm run dev
# → http://localhost:5173
```

## Status

🚧 **Phase de design.** Code à venir. Voir le
[design doc](./docs/specs/2026-05-05-design.md) pour le plan complet.

## License

MIT
