# Dinosaur Jump Demo Pack

This folder contains prompt variants for a Dinosaur Jump game and their cost reports.

## Prompts

- `prompt-balance.md`
- `prompt-polish.md`

## Reports

- `REPORT-balance.md`
- `REPORT-polish.md`

Generate reports with:

```bash
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
