FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# Base tooling used by Codex workflows and browser tests.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
    wget \
    jq \
    ripgrep \
    && rm -rf /var/lib/apt/lists/*

# Ensure tools that call `python` directly still work.
RUN ln -sf /usr/bin/python3 /usr/local/bin/python

# Global runtime defaults for Codex-in-container.
ENV CODEX_HOME=/home/node/.codex \
    CODEX_CONFIG_DIR=/home/node/.codex \
    NPM_CONFIG_CACHE=/home/node/.npm \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_PREFER_OFFLINE=true \
    NPM_CONFIG_FETCH_RETRIES=0 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=1000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=2000 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Codex CLI + common JS tooling.
RUN npm install -g @openai/codex typescript vite @playwright/test playwright

# Playwright + browser deps for web-game/browser automation loops.
RUN mkdir -p /opt/codex-tools \
 && cd /opt/codex-tools \
 && npm init -y >/dev/null 2>&1 \
 && npm install -D playwright @playwright/test typescript vite esbuild jsdom \
 && npx playwright install --with-deps \
 && git config --system --add safe.directory /workspace

# Seed npm cache with common packages so isolated runtime installs can use cache.
RUN mkdir -p /opt/codex-seed \
 && cd /opt/codex-seed \
 && npm init -y >/dev/null 2>&1 \
 && npm install --save-dev \
    playwright \
    @playwright/test \
    typescript \
    vite \
    esbuild \
    jsdom \
 && rm -rf /opt/codex-seed/node_modules

# Bake global skills + agent guidance into the image.
COPY codex-skills/ /opt/codex-skills/
COPY AGENTS.md /opt/codex-default/AGENTS.md
RUN mkdir -p "${CODEX_HOME}/skills" \
 && cp -R /opt/codex-skills/* "${CODEX_HOME}/skills/" \
 && cp /opt/codex-default/AGENTS.md "${CODEX_HOME}/AGENTS.md" \
 && chown -R node:node /home/node /ms-playwright /opt/codex-tools /opt/codex-seed /opt/codex-skills /opt/codex-default

ENV PATH="/opt/codex-tools/node_modules/.bin:${PATH}"
WORKDIR /workspace
USER node

CMD ["bash"]
