Take the existing Gravity Sushi game in game/ and apply a balance pass.
Requirements:
- keep controls and objective unchanged
- add three piece weights: light, medium, heavy with distinct stability impact
- tune piece spawn distribution to avoid impossible heavy streaks
- add difficulty phases at 20s and 40s with faster plate speed
- preserve deterministic behavior under window.advanceTime(ms)
- add window.setDropSeed(seed) for reproducible piece sequence
- extend window.render_game_to_text() with phase, current piece weight, plate speed
- add Playwright tests for phase transition speed change, deterministic seed sequence, and heavy streak risk increase
- keep implementation compact

Do not run git, npm install, npm test, python, apt, or git apply.
Prefer direct edits and finish with a short summary.
