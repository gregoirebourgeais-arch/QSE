#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

get_local_ip() {
  local ip
  ip=$(ip route get 1 2>/dev/null | awk '{print $7; exit}') || true
  if [[ -z "${ip:-}" ]]; then
    ip=$(hostname -I 2>/dev/null | awk '{print $1}') || true
  fi
  if [[ -z "${ip:-}" ]]; then
    ip="127.0.0.1"
  fi
  echo "$ip"
}

PC_IP=$(get_local_ip)

echo "[QSE] Démarrage automatique..."

echo "[QSE] Étape 1/3: Backend + base de données"
if command -v docker >/dev/null 2>&1; then
  (cd "$ROOT_DIR" && docker compose up -d --build)
  echo "[QSE] Backend OK: http://localhost:8001"
else
  echo "[QSE][ERREUR] Docker Desktop n'est pas installé."
  echo "Installe Docker Desktop puis relance ce fichier."
  exit 1
fi

echo "[QSE] Étape 2/3: Configuration mobile"
cd "$ROOT_DIR/frontend"
if [[ ! -f .env ]]; then
  cp env.sample .env
fi
sed -i.bak "s|^EXPO_PUBLIC_BACKEND_URL=.*|EXPO_PUBLIC_BACKEND_URL=http://${PC_IP}:8001|" .env && rm -f .env.bak

echo "[QSE] URL backend configurée automatiquement: http://${PC_IP}:8001"

echo "[QSE] Étape 3/3: Lancement de l'application"
yarn install
exec yarn start:offline
