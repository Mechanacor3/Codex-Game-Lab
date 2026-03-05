# Gravity Sushi Demo Pack

This folder contains prompt variants for a Gravity Sushi game and their cost reports.

## Prompts

- `prompt-core.md`
- `prompt-balance.md`
- `prompt-polish.md`

## Reports

- `REPORT-core.md`
- `REPORT-balance.md`
- `REPORT-polish.md`

Generate reports with:

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
