# Production deployment

Public URL: https://scriptorium-myk.duckdns.org

GitHub Actions checks pull requests. Successful `main` builds additionally test
the production Docker image and publish a `deploy-<commit>` release containing
the image, deployment configuration and SHA-256 checksums. A systemd timer on EC2
checks releases every two minutes, downloads a new release, verifies checksums,
backs up PostgreSQL, migrates and deploys it. No AWS credentials, SSH deployment
keys or self-hosted Actions runners are stored in GitHub.

Only trusted maintainers should be able to publish releases or write to `main`:
deployment assets execute as root on EC2, like any privileged deployment system.
Release assets are public; never include `.env` files or credentials in them.

## Server layout

- `/etc/scriptorium/app.env`: existing app/database/JWT configuration (mode 600).
- `/etc/scriptorium/oauth.env`: OAuth client credentials and `NEXTAUTH_SECRET` (600).
- `/opt/scriptorium/poll-release.py`: release poller.
- `/opt/scriptorium/releases/<commit>`: downloaded deployment configurations.
- `/opt/scriptorium/backups`: pre-deployment database backups and proxy configs.
- `/opt/scriptorium/current-image` and `previous-image`: rollback references.
- `/home/ubuntu/scriptorium-https`: active Caddy config and Compose file.
- `scriptorium-web`: application Compose project, accessible locally on port 3001.
- `scriptorium-https`: Caddy Compose project, ports 80/443, persistent certificates.
- Existing `scriptorium-csc309-postgres-1` and its `scriptorium-csc309_pgdata`
  volume remain managed by the original Compose project. Never run `down -v`.

The initial legacy app container stays stopped as a recovery option. Its image
is not automatically deleted. New app images retain the current and previous
release; database backups are retained and should be periodically copied off EC2.

## Operations

```sh
sudo systemctl status scriptorium-deploy.timer
sudo journalctl -u scriptorium-deploy.service -n 100 --no-pager
sudo systemctl start scriptorium-deploy.service
sudo systemctl stop scriptorium-deploy.timer
```

Failed deployments restore the previous app/proxy configuration when possible.
Database migrations are not reversed automatically; migrations must remain
backward compatible. The OAuth migration only adds a table and relaxes required
fields, preserving existing users and content. A failed release is recorded in
`/opt/scriptorium/failed-release` to avoid repeated attempts; after fixing the
cause, remove that marker and start the service to retry, or publish a new commit.

For manual app rollback, pause the timer, find the previous SHA in `previous-image`,
then run its `deploy/production/deploy.sh` with that SHA. Check HTTPS health before
resuming deployments. Never restore a DB backup over production without first
accounting for content written after that backup.

## OAuth applications

Create GitHub and Google web OAuth applications with these exact callback URLs:

- `https://scriptorium-myk.duckdns.org/api/auth/callback/github`
- `https://scriptorium-myk.duckdns.org/api/auth/callback/google`

Homepage / Google JavaScript origin: `https://scriptorium-myk.duckdns.org`.
Google apps in Testing require test users. Set `GITHUB_CLIENT_ID`,
`GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a randomly
generated `NEXTAUTH_SECRET` in `/etc/scriptorium/oauth.env`. Recreate the web
service after updating credentials. Providers without credentials are hidden.

OAuth creates ordinary USER accounts with a verified email. An existing matching
email requires signing in using the existing method and connecting the provider
from Edit Profile. This avoids granting account access solely from an email match.
Provider access/refresh tokens are not persisted. OAuth hands off through an
HttpOnly encrypted cookie and a same-origin POST to the app's existing JWT login;
the frontend still stores application tokens in localStorage, as before.

## Address stability

The current EC2 IP is auto-assigned. HTTP requests to it redirect to the domain,
but stopping/starting EC2 can change that IP. Update DuckDNS after an address
change. Automatic DuckDNS updates require a separately provisioned token; this
deployment does not assume one is available.
