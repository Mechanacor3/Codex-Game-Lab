# Codex Game Lab: 2048 Integration Demo (Try Again Pass)

This is a full staged integration run of 2048 through Codex-in-container against repo-local LiteLLM.

## Run Output

Stages were executed in order:

1. `demo/2048-run/creation`
2. `demo/2048-run/balance`
3. `demo/2048-run/polish`

Each stage contains:

- `game/src/*`
- `game/tests/playwright.spec.ts`
- `game/progress.md`

## Prompt Order Used

1. `demo/2048-run/prompts/01-core-used.md`
2. `demo/2048-run/prompts/02-balance-used.md`
3. `demo/2048-run/prompts/03-polish-used.md`

Base copies are included for traceability:

- `01-core-base.md`
- `02-balance-base.md`
- `03-polish-base.md`

## Notes On This "Try Again"

- `core` completed cleanly and produced a deterministic minimal 2048 scaffold.
- `balance` completed after a long pass that included some unnecessary git checks, but it produced a valid `turn.completed` usage record.
- `polish` completed with UI overlays, touch path, accessibility toggles, and additional Playwright coverage.
- All three stage logs contain `turn.completed` with token usage.

## Usage + Cost

- Consolidated usage/cost report: `demo/2048-run/REPORT.md`
- Raw logs:
  - `demo/2048-run/logs/01-core.jsonl`
  - `demo/2048-run/logs/02-balance.jsonl`
  - `demo/2048-run/logs/03-polish.jsonl`

## Quick Observations

- The run demonstrates deterministic API usage (`setBoardSeed`, `advanceTime`, `render_game_to_text`) through staged prompts.
- Token overhead is heavily driven by repeated file re-reading and validation loops in balance/polish.
- Output artifacts are useful for showing an end-to-end "Codex Game Lab" workflow, but are intentionally compact and demo-focused rather than production-hardened.
