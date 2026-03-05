Create a minimal deterministic 2048 project in this directory.
Write files under game/:
- index.html, package.json, tsconfig.json, playwright.config.ts
- src/game.ts, src/main.ts
- tests/playwright.spec.ts
- progress.md

Must include:
- 4x4 board, proper 2048 merge rules
- spawn 2/4 with 90/10 on valid move
- keyboard arrows + WASD
- window.advanceTime(ms), window.render_game_to_text()
- render text includes board rows, score, move count, state
- deterministic helper API for tests (seed/set board)
- tests for merge result, score increase, and loss detection

Do not run git, npm install, python, or git apply.
At the end print a short summary.
