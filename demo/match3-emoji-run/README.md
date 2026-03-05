# Codex Game Lab: Match-3 Integration Demo (Try Again Pass)

This is a full staged integration run of Match-3 through Codex-in-container against repo-local LiteLLM.

## Run Output

Stages were executed in order:

1. `demo/match3-emoji-run/creation`
2. `demo/match3-emoji-run/balance`
3. `demo/match3-emoji-run/polish`

Each stage contains:

- `game/src/*`
- `game/tests/playwright.spec.ts`
- `game/progress.md`

## Prompt Order Used

1. `demo/match3-emoji-run/prompts/01-core-used.md`
2. `demo/match3-emoji-run/prompts/02-balance-used.md`
3. `demo/match3-emoji-run/prompts/03-polish-used.md`

Base copies are included for traceability:

- `01-core-base.md`
- `02-balance-base.md`
- `03-polish-base.md`

## Notes On This "Try Again"

- `core` completed on first attempt.
- `balance` and `polish` required stricter one-shot prompts to avoid stalled tool loops.
- Final `balance` and `polish` logs each contain `turn.completed` with usage.

## Usage + Cost

- Consolidated usage/cost report: `demo/match3-emoji-run/REPORT.md`
- Raw logs:
  - `demo/match3-emoji-run/logs/01-core.jsonl`
  - `demo/match3-emoji-run/logs/02-balance.jsonl`
  - `demo/match3-emoji-run/logs/03-polish.jsonl`

## Quick Observations

- The run demonstrates deterministic API usage (`setBoardSeed`, `advanceTime`, `render_game_to_text`) and staged prompt execution.
- The generated stage outputs are functional artifacts for demonstrating workflow, but they are intentionally compact and prioritize deterministic/testable scaffolding over production-quality game architecture.
