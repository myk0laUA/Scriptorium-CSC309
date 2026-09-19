# HTTPS for the existing EC2 deployment

This standalone Compose project adds HTTPS without recreating the running app or
database. DNS for `scriptorium-myk.duckdns.org` must point to the instance, and its
security group must allow inbound TCP 443. The existing app keeps HTTP port 80;
HTTP redirects will be configured during the full deployment migration.

From this directory on EC2:

```sh
sudo docker compose -p scriptorium-https config --quiet
sudo docker compose -p scriptorium-https run --rm --no-deps caddy caddy validate --config /etc/caddy/Caddyfile
sudo docker compose -p scriptorium-https up -d
```

Caddy uses the TLS-ALPN challenge on port 443 and automatically renews its
certificate. Keep the `caddy_data` volume; it contains certificate keys and ACME
account state. No DuckDNS token is needed for certificate issuance.

To stop HTTPS without affecting the existing app or database:

```sh
sudo docker compose -p scriptorium-https down
```

Do not add `--volumes`. This configuration relies on the existing external Docker
network `scriptorium-csc309_appnet` and its `app` DNS alias.
