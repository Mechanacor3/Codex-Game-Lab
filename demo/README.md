# Codex Game Lab Demo

This folder pins the exact demo prompt and generates a token/cost report.

## Files

- `prompt.md`: exact demo prompt text
- `prompt_cost_report.py`: measures provider token usage and writes `REPORT.md`
- `REPORT.md`: generated output

## Run

```bash
docker compose up -d litellm
python3 demo/prompt_cost_report.py \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```

This writes `demo/REPORT.md`.

If your upstream auth is not set in `.env`, export it first:

```bash
export OPENAI_API_KEY=...
docker compose up -d litellm
```

## Notes

- Token counts come from provider-reported `usage` via `/v1/chat/completions`.
- Cost depends on your pricing inputs; pass your real rates for accurate dollars.
