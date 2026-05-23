FROM node:20

RUN npm install -g @anthropic-ai/claude-code \
 && apt-get update \
 && apt-get install -y --no-install-recommends git \
 && rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /workspace

CMD ["claude", "--dangerously-skip-permissions"]
