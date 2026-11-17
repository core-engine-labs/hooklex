# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:22-bookworm-slim AS builder

# Install system dependencies required by pnpm/Node binaries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally directly via npm (fixes Exit Code 127)
RUN npm install -g pnpm@latest

WORKDIR /app
# Copy lockfiles and install dependencies
COPY package*.json pnpm*.yaml ./
RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

RUN env

COPY tsconfig.json ./
# Copy source and build final output
COPY . .
RUN pnpm -v
RUN pnpm build


# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app
RUN env
EXPOSE 3000
# Copy application artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public

CMD ["server.js"]