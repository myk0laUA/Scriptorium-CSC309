#!/usr/bin/env sh
set -eu
# Production runs migrations before replacing the app; local Compose opts in.
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  ./node_modules/.bin/prisma migrate deploy
fi
exec "$@"
