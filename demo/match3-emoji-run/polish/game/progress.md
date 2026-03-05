Polish progress for Match-3 Stage 3 One-Shot

What I changed:
- Replaced `game/src/main.ts` with a UI polish layer that wraps the deterministic engine `game.ts`.
  - Adds UI markers: selected tile state, swap animation marker, match pop markers, and score popups for 4+ clears.
  - Adds overlay state: `start` overlay, `gameover` overlay, and `restart` flow.
  - Keyboard path: `Arrow` keys move cursor; `Enter` selects/attempts swaps.
  - Keeps deterministic APIs intact (calls into `window.setBoardSeed`, `window.advanceTime`, `window.reshuffleDeterministic`, and uses `window._GAME` RNG and board).
- Updated `game/tests/playwright.spec.ts`:
  - Extended tests to exercise the overlay start flow, keyboard cursor/select/swap path, match pop markers and score popups, and game-over overlay + restart.
- Updated `game/progress.md` to record changes.

Notes and constraints:
- Did not modify `game/src/game.ts` (balance core) to preserve deterministic behaviors.
- Swap animation is represented as a simple marker (no real animation frames) to keep tests deterministic.
- Score popup triggers when a match removal clears 4 or more tiles in one resolution.

Next suggestions:
- Hook this UI layer into a DOM renderer (e.g., use `render.ts`) to visualize markers.
- Add timing ticks to decay `matchPops` and `scorePopups` for real animations.

Summary:
- Implemented polish markers, keyboard controls, overlays, and extended Playwright tests as requested.
