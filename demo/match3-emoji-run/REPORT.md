# Codex Game Lab Match-3: Integration Usage Report

- Date: `2026-03-05`
- Source logs:
  - `demo/match3-emoji-run/logs/01-core.jsonl`
  - `demo/match3-emoji-run/logs/02-balance.jsonl`
  - `demo/match3-emoji-run/logs/03-polish.jsonl`
- Usage source: `turn.completed.usage` emitted by `codex exec --json`

## Stage Usage

| Stage | Input tokens | Cached input tokens | Output tokens |
|---|---:|---:|---:|
| core | 107,178 | 87,424 | 9,558 |
| balance | 142,165 | 108,288 | 7,155 |
| polish | 122,111 | 101,376 | 6,037 |
| **total** | **371,454** | **297,088** | **22,750** |

## Cost Estimate

Assumed pricing:

- Input: `$0.250000 / 1M tokens`
- Output: `$2.000000 / 1M tokens`

Two estimates are shown because cache billing depends on provider policy:

1. Raw input billing (all input tokens billed): **$0.138364**
2. Non-cached input billing (only `input - cached_input` billed): **$0.064091**

Per-stage raw estimate:

| Stage | Input cost | Output cost | Total |
|---|---:|---:|---:|
| core | $0.026795 | $0.019116 | $0.045910 |
| balance | $0.035541 | $0.014310 | $0.049851 |
| polish | $0.030528 | $0.012074 | $0.042602 |
