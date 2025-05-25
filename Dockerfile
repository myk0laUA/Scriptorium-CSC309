# ── builder stage ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# system deps for Prisma during build
RUN apk add --no-cache openssl

COPY package*.json ./
# allow postinstall so prisma generates client
RUN npm ci

# Copy the rest of the repo
COPY . .
# Make sure Prisma client exists *before* Next build
RUN npx prisma generate
# Build the Next.js app (outputs to .next/)
RUN npm run build

# ── production stage ────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy built assets & Prisma bits
COPY --from=builder /app/.next       ./.next
COPY --from=builder /app/public      ./public
COPY --from=builder /app/prisma      ./prisma

# ← Add this line:
COPY --from=builder /app/docker-code-processing ./docker-code-processing

# Regenerate Prisma client (if you really need to)
RUN npx prisma generate

EXPOSE 3000
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "start"]