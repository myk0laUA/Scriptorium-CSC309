#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Builds only the C# runner image and (optionally) bootstraps the DB for dev.
#   • ./startup.sh            → full local setup (npm + migrate + seed + build csharp)
#   • ./startup.sh --build-only → only build csharp-runner (CI / prod server)
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
  npm ci

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
# 4. Build only the C# runner Docker image
###############################################################################
echo "[STEP] Building the C# runner Docker image…"

if [[ ! -f "./docker-code-processing/csharp/Dockerfile" ]]; then
  echo "[ERROR] Missing Dockerfile at docker-code-processing/csharp/Dockerfile"
  exit 1
fi

docker build \
  -t csharp-runner \
  -f ./docker-code-processing/csharp/Dockerfile \
  ./docker-code-processing/csharp

echo "[DONE] csharp-runner image built successfully."
