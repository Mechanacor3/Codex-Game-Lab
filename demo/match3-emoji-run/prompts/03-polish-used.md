# Match-3 Stage 3 One-Shot Polish

Overwrite exactly these files using shell heredocs, then stop:
- game/src/main.ts
- game/tests/playwright.spec.ts
- game/progress.md

Add polish markers without changing balance core game.ts:
- selected tile marker state
- swap animation marker state
- match pop marker state
- score popup marker for 4+ clears
- start overlay + game-over overlay + restart state
- keyboard path: arrow keys move cursor, Enter select/swap
- keep deterministic APIs from balance working
- extend Playwright tests for overlay flow + keyboard path

Constraints:
- no git commands
- no python
- no npm install
- no git apply
- short summary at end
