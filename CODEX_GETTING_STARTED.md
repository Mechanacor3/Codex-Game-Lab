# Codex Game Lab - Codex + Custom gpt-oss-120b Provider (host.tls:5000/v1) Docker Quickstart

This guide gets you to a working Codex-in-Docker setup that:

- Uses a custom model provider at `https://host.tls:5000/v1` (OpenAI-compatible `/v1` API).
- Installs Codex CLI.
- Adds Playwright + game-dev skills (the `develop-web-game` skill is a great game-dev starter).
- Lets someone clone your repo and start using shared skills immediately.

Codex supports custom model providers via `~/.codex/config.toml` (or a repo-local `.codex/config.toml`). ([OpenAI Developers][1])
Skills are folder-based (with `SKILL.md`) and are discovered from `.agents/skills` directories up the tree. ([OpenAI Developers][2])

## Quick Shortcut For This Repo (Repo-Local LiteLLM)

This repo is pre-wired to run its own LiteLLM service and use it from Codex:

- `model = "default"`
- `base_url = "http://litellm:4000/v1"`
- compose service: `litellm`

Run:

```bash
cp .env.example .env
# set OPENAI_API_KEY in .env
./scripts/one-shot.sh
```

---

## 0) What you'll end up with

A repo layout like:

```text
your-repo/
  .codex/
    config.toml
  .agents/
    skills/
      playwright/           # installed skill
      develop-web-game/     # installed skill (game-dev)
  Dockerfile
  compose.yml               # optional helper
  game/                     # your actual game code (created by Codex)
```

Once built, you'll run Codex inside the container and it will:

- read/write files in `/workspace` (your mounted repo)
- run commands (node, tests, playwright)
- use your skills automatically when relevant

---

## 1) Prereqs (host machine)

- Docker Desktop (or Docker Engine)
- Your model provider is reachable from the container:
  - `https://host.tls:5000/v1`
  - an API key/token if your provider requires auth

Codex CLI installation reference (npm/homebrew) lives in the official quickstart. ([OpenAI Developers][3])

---

## 2) Add a Dockerfile to your repo

Create `Dockerfile`:

```dockerfile
FROM node:20-bookworm

# ---- OS deps (git, python for tooling, + Playwright runtime deps) ----
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# ---- Install Codex CLI ----
# Official package is @openai/codex (Codex CLI).
RUN npm install -g @openai/codex

# ---- Install Playwright + browsers (so skills/tests can actually run) ----
RUN npm init -y >/dev/null 2>&1 \
 && npm install -D playwright \
 && npx playwright install --with-deps

# Workspace
WORKDIR /workspace

# Convenience: keep config + skills under /workspace by default
ENV CODEX_CONFIG_DIR=/root/.codex

# Helpful default shell
CMD [ "bash" ]
```

Why this works:

- Codex CLI is a local terminal agent you run where your code is. ([OpenAI Developers][4])
- Playwright is installed in the container so browser automation can run reliably.

---

## 3) Add a Codex config pointing at your custom provider

Create `.codex/config.toml` in the repo:

```toml
# --- Model selection ---
# Put whatever your provider advertises as the model name here.
# If your provider is truly "gpt-oss-120b", use that.
model = "gpt-oss-120b"
model_provider = "custom_oss"

# Optional: approval/sandbox posture (tune to taste)
approval_policy = "on-request"
sandbox_mode = "workspace-write"

# --- Custom provider (OpenAI-compatible /v1) ---
[model_providers.custom_oss]
name = "Custom OSS Provider"
base_url = "https://host.tls:5000/v1"
env_key = "CUSTOM_LLM_API_KEY"

# If (and only if) your provider supports the OpenAI "Responses API",
# you can enable it explicitly like Azure examples do:
# wire_api = "responses"
#
# Otherwise, omit wire_api and Codex will use the default OpenAI-compatible API.
```

Custom model providers are configured with `base_url` and `env_key` in Codex. ([OpenAI Developers][1])

> Note on `wire_api`:
>
> - Many OpenAI-compatible servers implement "chat completions"-style APIs; some implement "Responses API".
> - If your provider supports Responses API, setting `wire_api = "responses"` can unlock extra Codex tuning knobs (some settings only apply to Responses). ([OpenAI Developers][1])
> - If you're unsure, leave it out and start simple.

---

## 4) Add a simple compose file (recommended)

Create `compose.yml`:

```yaml
services:
  codex:
    build: .
    working_dir: /workspace
    volumes:
      - ./:/workspace
    environment:
      # Put your provider key in your shell or .env, then pass through:
      - CUSTOM_LLM_API_KEY=${CUSTOM_LLM_API_KEY}
    # If host.tls is an internal DNS name, ensure your container can resolve it.
    # Add extra_hosts only if needed.
    # extra_hosts:
    #   - "host.tls:192.168.1.50"
    tty: true
```

Run:

```bash
docker compose build
docker compose run --rm codex
```

You'll land in a shell inside the container at `/workspace`.

---

## 5) First run: authenticate + verify the provider

Inside the container:

```bash
export CUSTOM_LLM_API_KEY="...your key..."
codex --version
codex
```

On first run, Codex will guide setup/sign-in. The official quickstart describes the basic flow ("install, run codex, sign in"). ([OpenAI Developers][3])

To sanity-check your config is being picked up:

- Ensure you launched `codex` from the repo root (so `.codex/config.toml` is in-scope).
- If you keep a global config instead, Codex will read `~/.codex/config.toml` (inside the container that's `/root/.codex/config.toml`).

---

## 6) Install skills: Playwright + game-dev (develop-web-game)

### Option A (fastest for sharing): commit skills into the repo

This is the best "someone can use my skills right away" approach: check the skill folders into your repo under `.agents/skills/`.

Codex discovers repo skills from `.agents/skills`. ([OpenAI Developers][2])

#### 1) Fetch skills from the official catalog

The official skills catalog is `openai/skills`, and curated skills can be installed by name via the built-in installer. ([GitHub][5])

You can either install using the Codex skill installer (recommended), or copy folders manually.

---

### Option A1: Install via Codex's built-in skill installer (recommended)

In the running Codex session, use the skills UI/commands:

- The community-documented flow to install Playwright is: `/skills -> skill-installer -> playwright` ([OpenAI Developer Community][6])

Then install the game-dev skill:

- Install the curated `develop-web-game` skill (this is a strong game-dev workflow skill and includes Playwright-based iteration guidance). ([GitHub][7])

Once installed, confirm the folders exist in your repo:

```bash
ls -la .agents/skills
```

Commit them:

```bash
git add .agents/skills
git commit -m "Add Codex skills: playwright + develop-web-game"
```

Now anyone who clones the repo gets the skills automatically.

---

### Option A2: Manual copy (works even without the installer)

If you prefer a deterministic scriptable approach:

```bash
mkdir -p .agents/skills
git clone https://github.com/openai/skills /tmp/openai-skills

# Copy curated skills into your repo
cp -R /tmp/openai-skills/skills/.curated/playwright .agents/skills/playwright
cp -R /tmp/openai-skills/skills/.curated/develop-web-game .agents/skills/develop-web-game
```

Commit:

```bash
git add .agents/skills
git commit -m "Add Codex skills: playwright + develop-web-game"
```

---

## 7) "Game hacking" starter prompt (copy/paste)

Once you're in the repo (inside the container) and running `codex`, paste this prompt:

> Build me a small web game in `game/` using Vite + TypeScript.
> Theme: neon cave spelunker (simple but juicy).
> Requirements:
>
> - Use a single `<canvas>` for rendering.
> - Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()` so automated tests can read state.
> - Create a Playwright test that launches the dev server, starts the game, simulates 10 seconds of play via `advanceTime`, and asserts the player score increases from 0.
> - Keep it tiny: one player, one enemy type, one collectible, one level.
> - After each change: run tests; if failing, fix; keep a short `progress.md` log of what you did.
> - Use the Playwright skill for browser automation and the develop-web-game skill for the overall workflow.

Why this prompt works:

- The `develop-web-game` skill explicitly pushes a tight implement->test loop and calls out deterministic stepping + a `render_game_to_text` integration point for Playwright-driven validation. ([GitHub][7])
- The Playwright skill handles real browser automation cleanly once installed.

---

## 8) Tips for making this "clone-and-go" for other people

1. Commit `.codex/config.toml` with the provider base URL and `env_key` (never commit the key itself).
2. Commit `.agents/skills/**` so skills are present immediately (no interactive install needed). Codex will discover them from `.agents/skills`. ([OpenAI Developers][2])
3. Add a tiny `README.md` snippet:

```md
## Run Codex (docker)

export CUSTOM_LLM_API_KEY=...
docker compose build
docker compose run --rm codex
codex
```

4. If your `host.tls` name isn't globally resolvable, document how teammates should map it (VPN DNS, `/etc/hosts`, compose `extra_hosts`, etc.).

---

## 9) Troubleshooting quick hits

- Codex ignores `.codex/config.toml`
  - Run `codex` from the repo root.
  - Ensure the file path is exactly `.codex/config.toml`.

- Playwright can't launch a browser
  - Make sure you built the image after adding Playwright (`docker compose build`).
  - Confirm browsers exist: `ls -la /root/.cache/ms-playwright` (location may vary).

- Provider errors (401/403)
  - Confirm `CUSTOM_LLM_API_KEY` is set in the container: `echo $CUSTOM_LLM_API_KEY`
  - Confirm your provider expects `Authorization: Bearer ...` (Codex uses `env_key` for OpenAI-style auth). ([OpenAI Developers][1])

---

If you tell me what your provider expects for the model name string (e.g., `gpt-oss-120b`, `openai/gpt-oss-120b`, or a local alias), I can tailor the `config.toml` to match it exactly (and include a one-command smoke test prompt that verifies the full request/response path end-to-end).

[1]: https://developers.openai.com/codex/config-advanced/ "Advanced Configuration"
[2]: https://developers.openai.com/codex/skills/ "Agent Skills"
[3]: https://developers.openai.com/codex/quickstart/ "Quickstart"
[4]: https://developers.openai.com/codex/cli/ "Codex CLI"
[5]: https://github.com/openai/skills "openai/skills: Skills Catalog for Codex"
[6]: https://community.openai.com/t/how-do-i-get-codex-to-use-the-browser/1373178 "How do I get Codex to use the browser?"
[7]: https://github.com/openai/skills/blob/main/skills/.curated/develop-web-game/SKILL.md "skills/skills/.curated/develop-web-game/SKILL.md at main"
