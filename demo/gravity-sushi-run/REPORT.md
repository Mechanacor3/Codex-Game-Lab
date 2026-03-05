# Codex Game Lab Gravity Sushi: Integration Usage Report

- Date: `2026-03-05`
- Source logs:
  - `demo/gravity-sushi-run/logs/01-core.jsonl`
  - `demo/gravity-sushi-run/logs/02-balance.jsonl`
  - `demo/gravity-sushi-run/logs/03-polish.jsonl`
- Usage source: `turn.completed.usage` emitted by `codex exec --json`

## Stage Usage

| Stage | Input tokens | Cached input tokens | Output tokens |
|---|---:|---:|---:|
| core | 26,859 | 20,608 | 6,515 |
| balance | 378,563 | 311,040 | 15,562 |
| polish | 204,909 | 180,608 | 9,676 |
| **total** | **610,331** | **512,256** | **31,753** |

## Cost Estimate

Assumed pricing:

- Input: `$0.250000 / 1M tokens`
- Output: `$2.000000 / 1M tokens`

Two estimates are shown because cache billing depends on provider policy:

1. Raw input billing (all input tokens billed): **$0.216089**
2. Non-cached input billing (only `input - cached_input` billed): **$0.088025**

Per-stage raw estimate:

| Stage | Input cost | Output cost | Total |
|---|---:|---:|---:|
| core | $0.006715 | $0.013030 | $0.019745 |
| balance | $0.094641 | $0.031124 | $0.125765 |
| polish | $0.051227 | $0.019352 | $0.070579 |
