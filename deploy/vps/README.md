# VPS deployment (host Nginx already on 80/443)

These files deploy QR ALTRIX next to other apps on a single server: the containers listen
on loopback, the host Nginx terminates TLS, and a systemd timer redeploys on every push.

Tested layout — `altrixadmin` on Ubuntu with Docker and Nginx already installed.

## 1. Directory skeleton

```bash
sudo mkdir -p /opt/qraltrix/{logs,backups}
sudo chown -R altrixadmin:altrixadmin /opt/qraltrix
```

## 2. Environment file (lives outside the repo on purpose)

`git clean` runs on every deploy, so the real `.env` sits at `/opt/qraltrix/.env` and the
deploy script copies it into the checkout.

```bash
cat > /opt/qraltrix/.env <<'EOF'
NODE_ENV=production
APP_URL=https://qr.altrixcore.com
SHORT_URL_BASE=https://qr.altrixcore.com
APP_NAME="QR ALTRIX"
APP_PORT=3010

POSTGRES_USER=qraltrix
POSTGRES_PASSWORD=<openssl rand -base64 24 | tr -d '/+='>
POSTGRES_DB=qraltrix

AUTH_SECRET=<openssl rand -hex 32>
IP_HASH_SALT=<openssl rand -hex 16>

STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=/app/storage
BACKUP_DIR=/app/backups
MAX_UPLOAD_MB=15

# Optional, add later:
# SMTP_HOST= SMTP_PORT=587 SMTP_USER= SMTP_PASSWORD= MAIL_FROM="QR ALTRIX <no-reply@…>"
# GOOGLE_CLIENT_ID= GOOGLE_CLIENT_SECRET=
EOF
chmod 600 /opt/qraltrix/.env
```

## 3. Deploy script and timer

```bash
# First clone, so the script is available before the timer exists.
git clone --branch main https://github.com/naumanellahidev/qr-altrix.git /opt/qraltrix/repo
cp /opt/qraltrix/repo/deploy/vps/deploy.sh /opt/qraltrix/deploy.sh
chmod +x /opt/qraltrix/deploy.sh

sudo cp /opt/qraltrix/repo/deploy/vps/qraltrix-autodeploy.service /etc/systemd/system/
sudo cp /opt/qraltrix/repo/deploy/vps/qraltrix-autodeploy.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now qraltrix-autodeploy.timer

# First deploy by hand so you can watch it.
/opt/qraltrix/deploy.sh --force
tail -f /opt/qraltrix/logs/deploy.log
```

## 4. Nginx and TLS

DNS first: an `A` record for `qr.altrixcore.com` pointing at this server (through
Cloudflare is fine — proxy on or off both work).

```bash
sudo mkdir -p /var/www/acme-qraltrix
sudo cp /opt/qraltrix/repo/deploy/vps/nginx-qr.altrixcore.com.conf \
        /etc/nginx/sites-available/qr.altrixcore.com.conf
sudo ln -sfn ../sites-available/qr.altrixcore.com.conf \
        /etc/nginx/sites-enabled/qr.altrixcore.com.conf

# Certbot needs port 80 to answer before the TLS block can load, so get the
# certificate with the HTTP block only, then enable the rest.
sudo certbot certonly --webroot -w /var/www/acme-qraltrix -d qr.altrixcore.com
sudo nginx -t && sudo systemctl reload nginx
```

## 5. First administrator

```bash
cd /opt/qraltrix/repo
docker compose -p qraltrix -f docker-compose.vps.yml exec app \
  npm run admin:create -- --email you@example.com
```

Sign in, then **Settings → Security** and enrol two-factor authentication. Only after that
should you switch on *Require two-factor for administrators* in Platform settings.

## 6. Backups

```bash
(crontab -l 2>/dev/null; echo "30 2 * * * cd /opt/qraltrix/repo && COMPOSE_PROJECT_NAME=qraltrix ./scripts/backup.sh >> /opt/qraltrix/logs/backup.log 2>&1") | crontab -
```

The admin panel reads `/opt/qraltrix/backups` and reports how fresh the last dump is.

## Day-to-day

| Task | Command |
|---|---|
| Watch a deploy | `tail -f /opt/qraltrix/logs/deploy.log` |
| Force a deploy | `/opt/qraltrix/deploy.sh --force` |
| App logs | `docker compose -p qraltrix -f docker-compose.vps.yml logs -f app worker` |
| Restart | `docker compose -p qraltrix -f docker-compose.vps.yml restart app worker` |
| Health | `curl -s localhost:3010/api/health` |
| Timer state | `systemctl list-timers qraltrix-autodeploy.timer` |

Pushing to `main` is the deploy: the timer picks the commit up within a minute, rebuilds,
migrates, waits for `/api/health`, and only then records the SHA. A failed build leaves the
previous containers serving.
