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
- Default model alias: `gpt-5-nano` (routed by LiteLLM to your upstream model)
- Network isolation: `codex` is on an internal network with `litellm` only (no direct internet egress)
- Baked global skills in container: `playwright`, `develop-web-game`
- Global agent guidance baked in: `/home/node/.codex/AGENTS.md`
- Single-folder mode: set `WORKSPACE_DIR` in `.env` (or shell) before `docker compose run`

## Manual run

```bash
docker compose up -d litellm
docker compose build codex
docker compose run --rm codex
```

Single-folder run (instead of whole repo):

```bash
WORKSPACE_DIR=./demo/gravity-sushi-run/polish docker compose run --rm codex
```

## Demo Prompt Costing

```bash
python3 demo/prompt_cost_report.py \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```
