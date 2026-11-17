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
RUN pnpm setup

WORKDIR /app
RUN mkdir dist
# Copy lockfiles and install dependencies
COPY package*.json pnpm*.yaml ./
COPY prisma.config.ts ./
COPY tsconfig.json ./


RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL



# Copy source and generate Prisma Client
COPY . .
RUN env
RUN pnpm prisma generate
RUN pnpm build

# Deploy production dependencies into a clean directory
RUN pnpm prune --prod
# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app


# Copy clean production dependencies and package.json from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json


# Copy application artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

CMD ["node", "dist/start-all.js"]