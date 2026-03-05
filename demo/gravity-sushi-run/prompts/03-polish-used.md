Take the existing Gravity Sushi game in game/ and add lightweight polish.
Requirements:
- keep gameplay and balance unchanged
- add subtle drop trail, landing squish, and plate wobble feedback
- add clean start/game-over overlays with restart button
- add touch input alongside keyboard controls
- add reduced-motion and high-contrast toggles
- preserve deterministic hooks window.advanceTime(ms) and window.render_game_to_text()
- add Playwright checks for overlay flow and touch controls
- keep visuals minimal and fast-loading

Do not run git, npm install, npm test, python, apt, or git apply.
Prefer direct edits and finish with a short summary.
