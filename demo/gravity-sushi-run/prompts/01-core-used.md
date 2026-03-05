Create a tiny deterministic Gravity Sushi game in this directory.
Create files under game/ only:
- index.html
- package.json
- tsconfig.json
- playwright.config.ts
- src/game.ts
- src/main.ts
- tests/playwright.spec.ts
- progress.md

Requirements:
- single canvas renderer
- moving plate, left/right controls, drop action
- piece weights affect stability, unstable stack can topple
- 60s timer and game_over
- score grows on stable drops
- deterministic API:
  - window.advanceTime(ms)
  - window.render_game_to_text()
  - window.setDropSeed(seed)
  - window.setStateForTest(...)
- render_game_to_text includes: score,timer,stack_height,stability,state
- tests cover:
  - stable drop increases score
  - unstable stack can topple
  - timer reaches game_over

Do not run git.
Do not run npm install.
Do not run tests.
Do not use python.
Write files directly and finish with a short summary.
