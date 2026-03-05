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
    && rm -rf /var/lib/apt/lists/*

# Codex CLI
RUN npm install -g @openai/codex

# Playwright + browser deps for web-game/browser automation loops.
RUN mkdir -p /opt/codex-tools \
 && cd /opt/codex-tools \
 && npm init -y >/dev/null 2>&1 \
 && npm install -D playwright \
 && npx playwright install --with-deps \
 && rm -rf /root/.npm/_cacache

ENV PATH="/opt/codex-tools/node_modules/.bin:${PATH}"
WORKDIR /workspace

CMD ["bash"]
