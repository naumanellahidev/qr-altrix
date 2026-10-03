#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Issues the first HTTPS certificate for QR ALTRIX and reloads Nginx.
#
#   ./scripts/init-ssl.sh qr.example.com you@example.com
#
# Run it after DNS for the domain points at this server and the stack is up.
# ---------------------------------------------------------------------------
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"
STAGING="${STAGING:-0}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "usage: $0 <domain> <email>   (set STAGING=1 to use Let's Encrypt staging)" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "▶ Checking that $DOMAIN resolves to this server…"
RESOLVED="$(getent hosts "$DOMAIN" | awk '{print $1}' | head -n1 || true)"
if [[ -z "$RESOLVED" ]]; then
  echo "  ! $DOMAIN does not resolve yet. Add the DNS record and wait a few minutes." >&2
  exit 1
fi
echo "  · resolves to $RESOLVED"

echo "▶ Putting the domain into the Nginx configuration…"
# Replace the placeholder on first run; afterwards this is a no-op.
sed -i "s/qr\.example\.com/$DOMAIN/g" nginx/conf.d/qr-altrix.conf

echo "▶ Starting Nginx on port 80 so Certbot can answer the challenge…"
# A self-signed stand-in lets the HTTPS block load before the real certificate exists.
docker compose run --rm --entrypoint "/bin/sh -c" certbot "
  mkdir -p /etc/letsencrypt/live/$DOMAIN &&
  if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    apk add --no-cache openssl >/dev/null 2>&1 || true;
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj '/CN=$DOMAIN' >/dev/null 2>&1;
  fi"

docker compose up -d nginx
sleep 3

echo "▶ Requesting the certificate…"
STAGING_FLAG=""
if [[ "$STAGING" == "1" ]]; then
  STAGING_FLAG="--staging"
  echo "  · using the staging environment (certificates will not be trusted)"
fi

docker compose run --rm --entrypoint "certbot" certbot \
  certonly --webroot -w /var/www/certbot \
  $STAGING_FLAG \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  --agree-tos --no-eff-email \
  --force-renewal

echo "▶ Reloading Nginx…"
docker compose exec nginx nginx -s reload

echo "✔ HTTPS is live for https://$DOMAIN"
echo "  Set APP_URL and SHORT_URL_BASE in .env to https://$DOMAIN, then:"
echo "    docker compose up -d app worker"
