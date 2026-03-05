# Codex Game Lab 2048: Integration Usage Report

- Date: `2026-03-05`
- Source logs:
  - `demo/2048-run/logs/01-core.jsonl`
  - `demo/2048-run/logs/02-balance.jsonl`
  - `demo/2048-run/logs/03-polish.jsonl`
- Usage source: `turn.completed.usage` emitted by `codex exec --json`

## Stage Usage

| Stage | Input tokens | Cached input tokens | Output tokens |
|---|---:|---:|---:|
| core | 151,254 | 128,512 | 6,671 |
| balance | 367,294 | 332,160 | 10,978 |
| polish | 471,707 | 445,056 | 9,426 |
| **total** | **990,255** | **905,728** | **27,075** |

## Cost Estimate

Assumed pricing:

- Input: `$0.250000 / 1M tokens`
- Output: `$2.000000 / 1M tokens`

Two estimates are shown because cache billing depends on provider policy:

1. Raw input billing (all input tokens billed): **$0.301714**
2. Non-cached input billing (only `input - cached_input` billed): **$0.075282**

Per-stage raw estimate:

| Stage | Input cost | Output cost | Total |
|---|---:|---:|---:|
| core | $0.037814 | $0.013342 | $0.051156 |
| balance | $0.091824 | $0.021956 | $0.113780 |
| polish | $0.117927 | $0.018852 | $0.136779 |

## Smoke Check Usage

A preliminary provider smoke check was also run:

- `demo/2048-run/logs/00-smoke.jsonl`
- Usage: `input_tokens=22,940`, `cached_input_tokens=11,008`, `output_tokens=722`

This smoke run is excluded from the stage totals above.
