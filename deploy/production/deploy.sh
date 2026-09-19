#!/usr/bin/env bash
set -euo pipefail
umask 077

release_dir=$(cd "$(dirname "$0")/../.." && pwd)
sha=${1:?Release commit is required}
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || exit 1
export APP_IMAGE="scriptorium:$sha"
base=/opt/scriptorium
proxy=/home/ubuntu/scriptorium-https
legacy=scriptorium-csc309-app-1
previous=$(cat "$base/current-image" 2>/dev/null || true)
web_compose=(docker compose -p scriptorium-web -f "$release_dir/deploy/production/web.yaml")
proxy_compose=(docker compose -p scriptorium-https -f "$proxy/compose.yaml")

mkdir -p "$base/backups"
backup_dir=$(mktemp -d "$base/backups/$(date -u +%Y%m%dT%H%M%SZ)-XXXX")
cp "$proxy/Caddyfile" "$backup_dir/Caddyfile"
cp "$proxy/compose.yaml" "$backup_dir/proxy.yaml"
legacy_running=$(docker inspect -f '{{.State.Running}}' "$legacy" 2>/dev/null || echo false)

echo "Saving a database backup before deployment."
docker exec scriptorium-csc309-postgres-1 sh -c 'exec pg_dumpall -U "${POSTGRES_USER:-postgres}"' | gzip > "$backup_dir/postgres-all.sql.gz"
gzip -t "$backup_dir/postgres-all.sql.gz"

echo "Applying additive database migrations."
"${web_compose[@]}" run --rm --no-deps web ./node_modules/.bin/prisma migrate deploy

rollback() {
  local result=$?
  trap - ERR
  echo 'Deployment failed; restoring the previous app and proxy configuration.'
  cp "$backup_dir/Caddyfile" "$proxy/Caddyfile"
  cp "$backup_dir/proxy.yaml" "$proxy/compose.yaml"
  if [ -n "$previous" ]; then
    APP_IMAGE="$previous" "${web_compose[@]}" up -d --no-deps web || true
  else
    "${web_compose[@]}" stop web || true
  fi
  "${proxy_compose[@]}" up -d --force-recreate || true
  if [ "$legacy_running" = true ]; then docker start "$legacy" >/dev/null || true; fi
  exit "$result"
}
trap rollback ERR

"${web_compose[@]}" up -d --no-deps web
healthy=false
for attempt in $(seq 1 40); do
  if curl -fsS --max-time 5 http://127.0.0.1:3001/api/health >/dev/null; then healthy=true; break; fi
  sleep 2
done
test "$healthy" = true

# Free HTTP port 80 only after the replacement application passes its DB check.
if [ "$legacy_running" = true ]; then docker stop "$legacy" >/dev/null; fi
cp "$release_dir/deploy/production/Caddyfile" "$proxy/Caddyfile"
cp "$release_dir/deploy/production/proxy.yaml" "$proxy/compose.yaml"
"${proxy_compose[@]}" up -d --force-recreate
curl --retry 8 --retry-delay 2 --retry-all-errors -fsS --max-time 10 \
  --resolve scriptorium-myk.duckdns.org:443:127.0.0.1 \
  https://scriptorium-myk.duckdns.org/api/health >/dev/null

printf '%s\n' "$previous" > "$base/previous-image"
printf '%s\n' "$APP_IMAGE" > "$base/current-image"
trap - ERR
echo "Deployed $APP_IMAGE; HTTPS and database health checks passed."
