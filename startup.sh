#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Builds language-runner images and (optionally) bootstraps the DB for local dev.
#   • ./startup.sh            → full local setup (npm + migrate + seed + build)
#   • ./startup.sh --build-only → only build runner images (CI / prod server)
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

###############################################################################
# 0. Pre-flight: tools & Docker daemon
###############################################################################
for cmd in docker node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[ERROR] $cmd is not installed or not on PATH."
    exit 1
  fi
done

if ! docker info >/dev/null 2>&1; then
  echo "[ERROR] Docker daemon is not running.  Start it and re-run this script."
  exit 1
fi

echo "[OK] Docker and Node are available."

###############################################################################
# 1. Parse flag
###############################################################################
BUILD_ONLY=false
[[ ${1:-} == "--build-only" ]] && BUILD_ONLY=true

###############################################################################
# 2. Load environment variables (DATABASE_URL, JWT secrets, …)
###############################################################################
if [[ -f .env ]]; then
  echo "[INFO] Loading variables from .env"
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

###############################################################################
# 3. Local Node/Prisma bootstrap (skipped with --build-only)
###############################################################################
if ! $BUILD_ONLY; then
  echo "[STEP] Installing Node modules…"
  # We let npm run its post-install scripts so Prisma can auto-generate.
  npm ci

  # If you prefer to skip postinstall hooks, comment ^ and uncomment v
  # npm ci --ignore-scripts
  # echo "[STEP] Generating Prisma client…"
  # npx prisma generate

  echo "[STEP] Running Prisma migrations…"
  npx prisma migrate deploy

  echo "[STEP] Seeding admin user…"
  node <<'NODE'
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcrypt');

    (async () => {
      const prisma = new PrismaClient();
      try {
        const exists = await prisma.user.findUnique({ where: { username: 'admin' } });
        if (exists) {
          console.log('[INFO] Admin user already exists – skipping seed.');
          return;
        }
        const hashed = await bcrypt.hash('adminpassword', 10);
        await prisma.user.create({
          data: {
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@uoft.com',
            password: hashed,
            phoneNum: '0987654321',
            role: 'ADMIN',
          },
        });
        console.log('[OK] Admin user created (admin / adminpassword)');
      } finally {
        await prisma.$disconnect();
      }
    })();
NODE
fi

###############################################################################
# 4. Build language-runner Docker images
###############################################################################
echo "[STEP] Building language-runner Docker images…"

langs=()
for d in ./docker-code-processing/*/ ; do
  [[ -f "${d}Dockerfile" ]] && langs+=( "$(basename "$d")" )
done

if [[ ${#langs[@]} -eq 0 ]]; then
  echo "[WARN] No Dockerfiles found in docker-code-processing – nothing to build."
else
  for lang in "${langs[@]}"; do
    ctx="./docker-code-processing/${lang}"
    img="${lang}-runner"
    echo "  · Building $img"
    docker build -t "$img" -f "$ctx/Dockerfile" "$ctx"
    echo "    ➜ built $img"
  done
fi

echo "[DONE] startup.sh completed successfully."