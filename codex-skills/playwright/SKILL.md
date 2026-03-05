---
name: playwright
description: Browser automation and deterministic test workflow for Codex Game Lab.
---

# Playwright Skill (Codex Game Lab)

Use this skill when implementing or debugging browser-driven tests.

## Goals

- Keep browser tests deterministic and fast.
- Prefer minimal end-to-end checks over brittle UI snapshots.
- Avoid network fetch/install loops during runs.

## Workflow

1. Inspect existing test setup first:
   - `package.json`
   - `playwright.config.*`
   - test files under `tests/` or `e2e/`
2. Reuse existing scripts (`npm test`, `npx playwright test`) before adding new ones.
3. For game projects, prefer deterministic hooks:
   - `window.advanceTime(ms)`
   - `window.render_game_to_text()`
4. Keep assertions state-based (text hooks / DOM state), not pixel-perfect.
5. If dependencies are missing in isolated mode, do not spam install retries; report the missing package and continue with static validation.

## Test Authoring Rules

- One behavior per test.
- Stable selectors (`data-testid`, element IDs).
- Explicit waits for state changes; avoid long sleeps.
- Keep test output concise and actionable.
