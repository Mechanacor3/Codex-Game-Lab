# Codex Game Lab Dinosaur Jump: Integration Usage Report

- Date: `2026-03-05`
- Source logs:
  - `demo/dnosaur-jump/logs/01-creation.jsonl`
  - `demo/dnosaur-jump/logs/02-balance.jsonl`
  - `demo/dnosaur-jump/logs/03-polish.jsonl`
- Usage source: `turn.completed.usage` emitted by `codex exec --json`

## Stage Usage

| Stage | Input tokens | Cached input tokens | Output tokens |
|---|---:|---:|---:|
| creation | 241,617 | 219,904 | 11,562 |
| balance | 526,989 | 495,104 | 9,902 |
| polish | 807,821 | 730,624 | 13,444 |
| **total** | **1,576,427** | **1,445,632** | **34,908** |

## Cost Estimate

Assumed pricing:

- Input: `$0.250000 / 1M tokens`
- Output: `$2.000000 / 1M tokens`

Two estimates are shown because cache billing depends on provider policy:

1. Raw input billing (all input tokens billed): **$0.463923**
2. Non-cached input billing (only `input - cached_input` billed): **$0.102515**

Per-stage raw estimate:

| Stage | Input cost | Output cost | Total |
|---|---:|---:|---:|
| creation | $0.060404 | $0.023124 | $0.083528 |
| balance | $0.131747 | $0.019804 | $0.151551 |
| polish | $0.201955 | $0.026888 | $0.228843 |
