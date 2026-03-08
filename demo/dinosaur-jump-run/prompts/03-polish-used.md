# Dinosaur Jump Integration Prompt - Stage 3: Polish

Use this as an integration run inside Codex.

You are given an existing Dinosaur Jump prototype in the current directory.
Apply a polish pass only.

Tasks:

1. Keep gameplay mechanics and balance unchanged.
2. Add lightweight polish:
   - jump squash/stretch
   - landing dust puff
   - subtle collision shake
3. Add clean start and game-over overlays with restart flow.
4. Add keyboard + touch jump support.
5. Preserve deterministic hooks:
   - `window.advanceTime(ms)`
   - `window.render_game_to_text()`
6. Add/adjust Playwright tests for overlays and restart flow.
7. Run tests and fix failures.
8. Update `progress.md` with this stage’s changes.

Important constraints:

- Keep changes scoped to this stage directory.
- Keep visual polish lightweight and fast.

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
