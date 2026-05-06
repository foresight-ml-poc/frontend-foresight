# frontend-foresight

Petite démo React pour tester le modèle entraîné dans [ml-foresight](https://github.com/foresight-ml-poc/ml-foresight). Une page : un form pour entrer les features d'un signal, ça appelle `POST /predict` du [backend-foresight](https://github.com/foresight-ml-poc/backend-foresight) et affiche la probabilité.

![screenshot](screenshot.png)

## Quickstart

```bash
# le backend doit tourner sur :8000
npm install
echo "VITE_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
# → http://localhost:5173
```

## Architecture (3 repos)

- [ml-foresight](https://github.com/foresight-ml-poc/ml-foresight) — pipeline ML
- [backend-foresight](https://github.com/foresight-ml-poc/backend-foresight) — FastAPI
- **frontend-foresight** (ici)
