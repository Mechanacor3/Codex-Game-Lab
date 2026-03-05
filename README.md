# Codex Game Lab

Fast local Codex workspace with its own LiteLLM stack.

## Quickstart

```bash
cp .env.example .env
# set OPENAI_API_KEY in .env
./scripts/one-shot.sh
```

## Verify

```bash
./scripts/smoke-codex-provider.sh
```

## Defaults

- Codex provider: `http://litellm:4000/v1`
- Host LiteLLM port: `127.0.0.1:28789`
- Default model alias: `default`

## Manual run

```bash
docker compose up -d litellm
docker compose build codex
docker compose run --rm codex
```

## Demo Prompt Costing

```bash
python3 demo/prompt_cost_report.py \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```
