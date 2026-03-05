---
name: develop-web-game
description: Staged creation/balance/polish workflow for deterministic web game prototypes.
---

# Develop Web Game Skill (Codex Game Lab)

Use this skill for small browser game prototypes with testable loops.

## Core Pattern

Work in three passes:

1. Creation: minimal playable loop.
2. Balance: tune progression and edge-case behavior.
3. Polish: UI feedback, overlays, accessibility toggles.

## Required Interfaces

Expose deterministic hooks whenever possible:

- `window.advanceTime(ms)`
- `window.render_game_to_text()`

Optional deterministic controls:

- `window.setSeed(seed)` / `window.setBoardSeed(seed)`
- `window.setStateForTest(obj)`

## Implementation Guidance

- Single-canvas render path unless project already uses a different pattern.
- Keep architecture small and readable.
- Prefer direct file edits over complex patch pipelines.
- Avoid `git apply` in automated loops unless absolutely necessary.

## Testing Guidance

- Add at least one end-to-end check that advances simulated time and validates score/progression.
- Validate fail state (`game_over`) and restart path.
- Keep tests deterministic with seeded state where possible.

## Isolated Runtime Notes

- Assume no direct internet egress from Codex runtime.
- Prefer existing dependencies and cached packages.
- If install is unavoidable and fails, stop retry loops and report exact blocker.
