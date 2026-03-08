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

## Skill Use Requirements (Mandatory)

Before any implementation edits, run and log this exact preflight (inside the current stage directory):

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
export WEB_GAME_CLIENT="$CODEX_HOME/skills/develop-web-game/scripts/web_game_playwright_client.js"
export WEB_GAME_ACTIONS="$CODEX_HOME/skills/develop-web-game/references/action_payloads.json"

sed -n '1,200p' "$CODEX_HOME/skills/playwright/SKILL.md"
sed -n '1,260p' "$CODEX_HOME/skills/develop-web-game/SKILL.md"
sed -n '1,120p' "$CODEX_HOME/skills/playwright/references/cli.md"
sed -n '1,120p' "$CODEX_HOME/skills/develop-web-game/references/action_payloads.json"
"$PWCLI" --help || true
node "$WEB_GAME_CLIENT" --help || true
```

During implementation, keep using skill paths (scripts/references) instead of inventing new workflows where possible.
At the end of your response, include a one-line proof marker:

`SKILL_USAGE_PROOF: <what skill files/scripts were used>`
