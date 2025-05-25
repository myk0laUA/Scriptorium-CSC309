#!/usr/bin/env sh
set -e

echo "⏳ Waiting for database to accept connections…"

until /app/node_modules/.bin/prisma \
      db execute --url "$DATABASE_URL" --stdin --stdin
do
  echo "  ↻ database not ready yet, retrying in 2s…"
  sleep 2
done

echo "✅ database is up"

# Now run migrations + seed
/app/node_modules/.bin/prisma migrate deploy
node prisma/seed-admin.js

echo "🚀 Starting Next.js"
exec npm start
