#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Adds a customer's custom short domain to Nginx and issues its certificate.
#
#   ./scripts/add-domain.sh links.customer.com you@example.com
#
# Run this after the customer has added their DNS records and the domain shows as
# verified in the dashboard. The app itself only serves domains it has verified, so
# adding one here cannot expose another workspace's codes.
# ---------------------------------------------------------------------------
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "usage: $0 <custom-domain> <email>" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
CONF="nginx/conf.d/custom-domains.conf"

echo "▶ Checking DNS for $DOMAIN…"
if ! getent hosts "$DOMAIN" >/dev/null; then
  echo "  ! $DOMAIN does not resolve yet." >&2
  exit 1
fi

if [[ -f "$CONF" ]] && grep -q "server_name $DOMAIN;" "$CONF"; then
  echo "  · already configured, renewing the certificate only"
else
  echo "▶ Writing an Nginx server block for $DOMAIN…"
  cat >> "$CONF" <<EOF

# --- $DOMAIN (added $(date -u +%Y-%m-%d)) -----------------------------------
server {
  listen 80;
  listen [::]:80;
  server_name $DOMAIN;

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
    default_type "text/plain";
  }

  location / { return 301 https://\$host\$request_uri; }
}

server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  server_name $DOMAIN;

  ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Content-Type-Options "nosniff" always;

  proxy_http_version 1.1;
  proxy_set_header Host \$host;
  proxy_set_header X-Real-IP \$remote_addr;
  proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto https;
  proxy_set_header X-Forwarded-Host \$host;

  location = /.well-known/qr-altrix-domain-verification {
    proxy_pass http://qraltrix_app;
  }

  # Every path on a custom domain is a short link; the app resolves it by host + slug.
  location / {
    proxy_pass http://qraltrix_app;
    add_header Cache-Control "no-store" always;
  }
}
EOF
fi

echo "▶ Creating a temporary certificate so Nginx can start…"
docker compose run --rm --entrypoint "/bin/sh -c" certbot "
  mkdir -p /etc/letsencrypt/live/$DOMAIN &&
  if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    apk add --no-cache openssl >/dev/null 2>&1 || true;
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj '/CN=$DOMAIN' >/dev/null 2>&1;
  fi"

docker compose exec nginx nginx -s reload || docker compose up -d nginx
sleep 2

echo "▶ Requesting the real certificate…"
docker compose run --rm --entrypoint "certbot" certbot \
  certonly --webroot -w /var/www/certbot \
  --email "$EMAIL" -d "$DOMAIN" \
  --agree-tos --no-eff-email --force-renewal

docker compose exec nginx nginx -s reload

echo "✔ https://$DOMAIN now serves short links"
echo "  In the dashboard, press \"Check HTTPS\" on the domain to confirm."
