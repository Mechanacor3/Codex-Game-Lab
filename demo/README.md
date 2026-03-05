# Codex Game Lab Demo

This folder pins exact demo prompts and generates token/cost reports.

## Files

- `prompt.md`: default Dinosaur Jump core prompt
- `dinosaur-jump/`: additional Dinosaur Jump prompts (balance and polish)
- `prompt_cost_report.py`: measures provider token usage and writes `REPORT.md`
- `REPORT.md`: generated output for `prompt.md`

## Run

```bash
docker compose up -d litellm
python3 demo/prompt_cost_report.py \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```

This writes `demo/REPORT.md`.

## Dinosaur Jump Demo Pack

Generate reports for all three dinosaur-jump prompts:

```bash
python3 demo/prompt_cost_report.py \
  --prompt-file demo/prompt.md \
  --write-md demo/REPORT.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/dinosaur-jump/prompt-balance.md \
  --write-md demo/dinosaur-jump/REPORT-balance.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/dinosaur-jump/prompt-polish.md \
  --write-md demo/dinosaur-jump/REPORT-polish.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```

## Emoji Match-3 Demo Pack

Generate reports for all three emoji match-3 prompts:

```bash
python3 demo/prompt_cost_report.py \
  --prompt-file demo/match3-emoji/prompt-core.md \
  --write-md demo/match3-emoji/REPORT-core.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/match3-emoji/prompt-balance.md \
  --write-md demo/match3-emoji/REPORT-balance.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/match3-emoji/prompt-polish.md \
  --write-md demo/match3-emoji/REPORT-polish.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```

## 2048 Demo Pack

Generate reports for all three 2048 prompts:

```bash
python3 demo/prompt_cost_report.py \
  --prompt-file demo/2048/prompt-core.md \
  --write-md demo/2048/REPORT-core.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/2048/prompt-balance.md \
  --write-md demo/2048/REPORT-balance.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/2048/prompt-polish.md \
  --write-md demo/2048/REPORT-polish.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```

## Random Pick Demo Pack: Gravity Sushi

Generate reports for all three Gravity Sushi prompts:

```bash
python3 demo/prompt_cost_report.py \
  --prompt-file demo/gravity-sushi/prompt-core.md \
  --write-md demo/gravity-sushi/REPORT-core.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/gravity-sushi/prompt-balance.md \
  --write-md demo/gravity-sushi/REPORT-balance.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000

python3 demo/prompt_cost_report.py \
  --prompt-file demo/gravity-sushi/prompt-polish.md \
  --write-md demo/gravity-sushi/REPORT-polish.md \
  --input-cost-per-1m 0.250000 \
  --output-cost-per-1m 2.000000
```

If your upstream auth is not set in `.env`, export it first:

```bash
export OPENAI_API_KEY=...
docker compose up -d litellm
```

## Notes

- Token counts come from provider-reported `usage` via `/v1/chat/completions`.
- Cost depends on your pricing inputs; pass your real rates for accurate dollars.
