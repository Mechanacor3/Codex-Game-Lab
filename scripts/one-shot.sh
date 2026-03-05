#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [[ -z "${OPENAI_API_KEY:-}" ]] && ! grep -Eq '^OPENAI_API_KEY=.+$' .env 2>/dev/null; then
  cat <<'EOF'
Warning: OPENAI_API_KEY is not set.
Set it in your shell or a local .env file if your LiteLLM upstream requires auth.
EOF
fi

echo "[1/3] Starting this repo's LiteLLM service ..."
docker compose up -d litellm >/dev/null

LITELLM_READY=0
for _ in {1..40}; do
  if docker compose exec -T litellm python -c \
    'import urllib.request; urllib.request.urlopen("http://127.0.0.1:4000/health/liveliness", timeout=2).read()' \
    >/dev/null 2>&1; then
    LITELLM_READY=1
    break
  fi
  sleep 1
done
if [[ "${LITELLM_READY}" -ne 1 ]]; then
  echo "LiteLLM did not become ready in time."
  exit 1
fi

export CUSTOM_LLM_API_KEY="${CUSTOM_LLM_API_KEY:-dummy}"

echo "[2/3] Building Codex container ..."
docker compose build codex

echo "[3/3] Launching Codex ..."
docker compose run --rm codex
