#!/usr/bin/env bash
set -euo pipefail

API_KEY="${CUSTOM_LLM_API_KEY:-dummy}"

if [[ -z "${OPENAI_API_KEY:-}" ]] && ! grep -Eq '^OPENAI_API_KEY=.+$' .env 2>/dev/null; then
  cat <<'EOF'
OPENAI_API_KEY is not set.
Set it in your shell or .env before running the provider smoke test.
EOF
  exit 1
fi

echo "Starting this repo's LiteLLM service ..."
docker compose up -d litellm >/dev/null

echo "Waiting for LiteLLM readiness ..."
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

echo "Ensuring Codex container image is available ..."
docker compose build codex >/dev/null

echo "Checking models endpoint on Docker network (http://litellm:4000/v1/models) ..."
MODELS_JSON="$(docker compose run --rm -e CUSTOM_LLM_API_KEY="${API_KEY}" --entrypoint bash codex -lc \
  'curl -fsS -H "Authorization: Bearer ${CUSTOM_LLM_API_KEY}" http://litellm:4000/v1/models')"

if ! grep -q '"id":"default"\|"id": "default"' <<<"${MODELS_JSON}"; then
  echo "Expected model id 'default' not found in /models output."
  exit 1
fi

echo "Checking chat completions endpoint with model=default"
RESPONSE_JSON="$(docker compose run --rm -e CUSTOM_LLM_API_KEY="${API_KEY}" --entrypoint bash codex -lc \
  'curl -fsS \
    -H "Authorization: Bearer ${CUSTOM_LLM_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '"'"'{"model":"default","messages":[{"role":"user","content":"Reply with OK"}],"max_tokens":8}'"'"' \
    http://litellm:4000/v1/chat/completions')"

if ! grep -qi '"choices"' <<<"${RESPONSE_JSON}"; then
  echo "No choices returned from chat completions."
  exit 1
fi

echo "Smoke test passed."
