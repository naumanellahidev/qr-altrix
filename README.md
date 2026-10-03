# QR ALTRIX

A free, self-hostable QR code platform. Design codes that are worth printing, change
where they point after they are printed, and see every scan — on your own server, under
your own domain.

**Out of the box, dynamic QR codes never expire.** There is no trial, no subscription and
no scan cap. A dynamic code stops resolving only when:

1. its owner pauses it,
2. its owner deletes it,
3. its owner switched on a schedule or scan limit and that limit applies,
4. a platform administrator disabled it for abuse (with a reason, reversibly),
5. the operator switched on the **expiry policy** (off by default) and the code has
   passed the age or inactivity limit they chose.

All five live in one place — `src/lib/routing/evaluate.ts` — and are covered by tests, so
the behaviour cannot quietly drift.

### Expiry policy (off by default)

**Admin → Platform settings → Expiry policy** gives the operator full control:

| Setting | Meaning |
|---|---|
| Allow QR codes to expire | Master switch. Off means nothing can expire by age or inactivity |
| Expire this many days after creation | `0` = never |
| Expire after this many days with no scans | `0` = never |
| Apply to codes that already exist | Off (safer) limits the rule to codes created after the switch was turned on |

When it is on: the earlier of the two deadlines wins, each code shows its expiry date in
the dashboard (with a warning in the last 30 days), an expired scan shows a neutral notice
instead of the destination, and **nothing is deleted** — switching the policy off brings
every code straight back. Turning it on or off is written to the security log, and the
public pages change their wording to match, so the site never advertises something the
install does not do.

---

## What is included

| Area | Details |
|---|---|
| **QR types** | 12 static (URL, text, Wi-Fi, vCard, email, WhatsApp, SMS, phone, location, event, crypto, calendar) and 19 dynamic (website, PDF, image gallery, vCard Plus, video, link list, social, audio, business page, coupon, app store, landing page, product, event page, menu, feedback, playlist, GS1, smart multi-link) |
| **Design editor** | 7 pattern styles, 8 corner-frame and 7 corner-centre styles, 32 frame presets with call-to-action text, gradients, transparency, inversion, logo upload plus a 16-icon built-in library, quiet-zone and error-correction control, and a live scan-safety score |
| **Exports** | PNG, SVG, PDF, JPEG, WebP and EPS, up to 4096 px |
| **Dynamic routing** | Short codes, custom slugs, custom domains, UTM parameters, password protection, schedules with per-day time windows, owner-set scan limits, and smart routing by country, language, device and time |
| **Hosted pages** | Menus, link lists, galleries, vCard Plus, PDF viewer, video, audio, business pages, coupons, products, events, feedback forms and playlists, each rendered mobile-first |
| **Analytics** | Total and unique scans, time series, country, city, device, browser, OS, language, referrer, campaign and hour-of-day, with CSV and XLSX export and a privacy-first hashed-IP model |
| **Bulk** | CSV import with a downloadable template, column mapping, per-row validation before anything is written, background processing and a ZIP of the generated codes |
| **Teams** | Owner, Admin, Editor, Analyst, Viewer and folder-scoped Limited roles, invitations, and a per-user security history |
| **API** | Documented REST API with scoped bearer keys, rate limits, signed webhooks and an OpenAPI 3.1 description at `/api/v1/openapi.json` |
| **Admin** | Users, workspaces, every code, abuse reports, queue and storage health, and platform settings |

---

## Quick start (local development)

```bash
git clone <your-repo> qr-altrix && cd qr-altrix
cp .env.example .env            # edit DATABASE_URL and AUTH_SECRET at minimum
npm install
npx prisma migrate deploy       # or: npx prisma db push
npm run seed                    # optional demo workspace and 30 days of scans
npm run dev
```

Open <http://localhost:3000>. The seed prints the demo sign-in details
(`admin@qraltrix.local` / `altrix1234` by default) — change that password immediately on
anything public.

Requirements: Node 20.11+ (22+ recommended), PostgreSQL 14+. Redis is optional: without
`REDIS_URL` background jobs run inline inside the web process, which is fine for a small
install.

---

## Production on an Ubuntu VPS

A 2 vCPU / 4 GB box comfortably runs the whole stack.

### 1. Install Docker

```bash
sudo apt update && sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker
```

### 2. Get the code and configure it

```bash
sudo mkdir -p /opt/qr-altrix && sudo chown $USER:$USER /opt/qr-altrix
git clone <your-repo> /opt/qr-altrix && cd /opt/qr-altrix
cp .env.example .env
```

Edit `.env`. The values that matter most:

```ini
APP_URL=https://qr.example.com
SHORT_URL_BASE=https://qr.example.com
POSTGRES_PASSWORD=<long random string>
AUTH_SECRET=<openssl rand -hex 32>
IP_HASH_SALT=<openssl rand -hex 16>
MAIL_FROM="QR ALTRIX <no-reply@example.com>"
SMTP_HOST=smtp.yourprovider.com
SMTP_USER=...
SMTP_PASSWORD=...
```

Generate the secrets with:

```bash
echo "AUTH_SECRET=$(openssl rand -hex 32)"
echo "IP_HASH_SALT=$(openssl rand -hex 16)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')"
```

### 3. Point DNS at the server

Create an `A` record for `qr.example.com` → your server's IP. Wait for it to resolve
(`getent hosts qr.example.com`).

### 4. Bring the stack up

```bash
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run seed      # optional
```

### 5. Turn on HTTPS

```bash
chmod +x scripts/*.sh
./scripts/init-ssl.sh qr.example.com you@example.com
```

The script puts your domain into the Nginx config, issues the certificate with Certbot,
and reloads Nginx. The `certbot` service then renews automatically twice a day.

Visit `https://qr.example.com`. The first account you create becomes the platform
administrator.

### 6. Lock the box down

```bash
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
```

Only Nginx is published to the host; PostgreSQL, Redis, the app and the worker stay on
the internal Docker network.

---

## Deploying behind an existing Nginx (several apps on one VPS)

If the server already terminates TLS for other sites, do not run the bundled Nginx and
Certbot containers. Use the VPS compose file instead: it starts only PostgreSQL, Redis,
the app and the worker, and publishes the app on loopback for the host Nginx to proxy.

```bash
cd /opt/qraltrix/repo
cp .env.example .env          # set APP_URL, SHORT_URL_BASE, secrets, APP_PORT=3010
docker compose -p qraltrix -f docker-compose.vps.yml up -d --build
docker compose -p qraltrix -f docker-compose.vps.yml exec app npx prisma migrate deploy
docker compose -p qraltrix -f docker-compose.vps.yml exec app npm run admin:create -- --email you@example.com
```

Host Nginx site (the important parts):

```nginx
location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Host $host;
}
```

`X-Forwarded-For` and `X-Forwarded-Proto` matter: the first is what unique-visitor
hashing and rate limiting read, and the second is what makes session cookies `Secure`.

### Creating the first administrator

```bash
npm run admin:create -- --email you@example.com              # generates a password
npm run admin:create -- --email you@example.com --password '…'
```

The account is created with its email already confirmed and platform-admin rights. Run it
again on the same address to reset that password and sign every other session out — that
is the recovery path if the password is lost. Turn on two-factor authentication straight
after signing in.

## Custom short domains

Customers can serve short links from their own domain, at no cost.

1. In the dashboard: **My domains → Add a domain** (e.g. `links.customer.com`).
2. The customer adds the two DNS records shown: a `TXT` proof at
   `_qr-altrix.links.customer.com` and a `CNAME` (or `A`) pointing at this server.
3. Press **Check DNS**. Verification accepts either the TXT record or, once DNS points
   here, the HTTP proof at `/.well-known/qr-altrix-domain-verification`.
4. On the server, add the domain to Nginx and issue its certificate:

   ```bash
   ./scripts/add-domain.sh links.customer.com you@example.com
   ```

5. Press **Check HTTPS** in the dashboard to confirm.

Removing a domain never breaks a printed code: those codes fall back to the platform
short link, which still resolves by short code.

---

## Backups

```bash
chmod +x scripts/*.sh
./scripts/backup.sh                        # ./backups/db-*.dump + storage-*.tar.gz
RETAIN_DAYS=14 ./scripts/backup.sh         # prune older sets
./scripts/restore.sh backups/db-….dump backups/storage-….tar.gz
```

Add a daily cron job and copy the files off the machine:

```bash
(crontab -l 2>/dev/null; echo "30 2 * * * cd /opt/qr-altrix && ./scripts/backup.sh >> backups/backup.log 2>&1") | crontab -
```

A dynamic QR code is only as permanent as its database row. Test a restore before you
need one.

---

## Upgrades

```bash
cd /opt/qr-altrix
./scripts/backup.sh
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Migrations are additive. Scans continue to resolve during the rebuild because Nginx keeps
serving until the new container is healthy.

---

## Configuration reference

Everything is read from the environment; see `.env.example` for the full list.

| Variable | Purpose |
|---|---|
| `APP_URL` | Public base URL. Used for links in emails, OAuth redirects and absolute URLs |
| `SHORT_URL_BASE` | Base for platform short links; set to a shorter domain if you have one |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Optional. Enables the BullMQ queue and the worker container |
| `AUTH_SECRET` | Signs session cookies. Rotating it signs everybody out |
| `IP_HASH_SALT` | Salts visitor IP hashes. Rotating it resets unique-visitor counting |
| `SMTP_*`, `MAIL_FROM` | Outbound email. With no `SMTP_HOST`, mails are written to the log instead |
| `GOOGLE_CLIENT_ID` / `SECRET` | Optional Google sign-in. Redirect URI: `${APP_URL}/api/auth/google/callback` |
| `STORAGE_DRIVER` | `local` (default) or `s3` |
| `S3_*` | Any S3-compatible bucket, when `STORAGE_DRIVER=s3` |
| `MAX_UPLOAD_MB` | Per-file upload ceiling |
| `ALLOW_GUEST_STATIC_DOWNLOAD` | Whether visitors can download static codes without an account |
| `ANALYTICS_RETENTION_DAYS` | `0` keeps scan history forever |
| `IP_STORAGE_MODE` | `hashed` (default) or `never` |
| `RATE_LIMIT_*`, `BULK_MAX_ROWS` | Anti-abuse limits, overridable in the admin panel |
| `WORKER_CONCURRENCY` | Parallel jobs per worker process |
| `BACKUP_DIR` | Where `scripts/backup.sh` writes; the admin panel reads it to report backup freshness |

Most of these can also be changed at runtime in **Admin → Platform settings**, which
takes effect within 20 seconds without a restart.

### Optional: S3-compatible storage

```ini
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.eu-central-1.amazonaws.com
S3_REGION=eu-central-1
S3_BUCKET=qr-altrix-uploads
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_BASE_URL=https://cdn.example.com      # optional CDN in front of the bucket
S3_FORCE_PATH_STYLE=true                        # needed by MinIO and some providers
```

Existing local files are not migrated automatically; copy `storage/` into the bucket with
the same key layout before switching.

---

## Architecture

```
src/
  app/
    page.tsx                  Homepage with the no-login generator
    (auth)/                   Login, signup, reset, verify, invitations
    dashboard/                New QR, My codes, Analytics, Templates, Domains,
                              Team, Security, Developers, Bulk, Settings, Support
    admin/                    Users, workspaces, codes, abuse, system, platform settings
    q/[code]/route.ts         The scan handler (and /r/[code] as an alias)
    l/[id]/page.tsx           Hosted landing pages for dynamic content types
    p/[code]/                 Password gate
    inactive/[code]/          Friendly page when a code is paused or disabled
    api/v1/                   Public REST API
  lib/
    qr/                       Catalogue, payload encoders, renderer, exports, scan safety
    routing/evaluate.ts       The access rules — the "never expires" guarantee
    routing/resolve.ts        Host + code → QR code lookup
    analytics.ts              Aggregation in PostgreSQL
    jobs/                     Scan logging, bulk import, webhooks, housekeeping, domains
    queue.ts                  BullMQ with an inline fallback when Redis is absent
prisma/schema.prisma          21 models
scripts/worker.ts             Background worker entry point
```

The QR renderer is original: only the module matrix comes from the `qrcode` package, and
every visual decision — shapes, eyes, gradients, frames, logo plating — is produced as
plain SVG by `src/lib/qr/render.ts`. The same function runs in the browser for the live
preview and on the server for exports, so the preview *is* the deliverable.

---

## Tests

```bash
npm test          # unit tests, no database required
npm run typecheck
```

The suite covers the access rules (pause, delete, schedule, time windows, scan limits,
admin disable), smart routing, static payload encoders, the SVG renderer, scan-safety
scoring, CSV mapping and validation, TOTP, and the webhook signature. Tests that need a
database are skipped automatically unless `DATABASE_URL` points at a disposable one:

```bash
DATABASE_URL=postgresql://localhost:5432/qraltrix_test npm test
```

---

## Operating notes

- **Health check**: `GET /api/health` returns 200 when the database is reachable, 503
  otherwise. The container health check uses it.
- **Logs**: `docker compose logs -f app worker`. Output is structured JSON, one object per
  line.
- **Queue**: **Admin → System & queue** shows waiting, active and failed jobs, plus
  storage use. Housekeeping can be run from there at any time.
- **Scan logging** happens after the redirect has been served. A slow database never slows
  a scan; with Redis enabled, writes move to the worker entirely.
- **Geo data** comes from proxy headers (`CF-IPCountry`, `X-GeoIP-*`, `X-Vercel-IP-*`). If
  you want city-level data without a CDN, add Nginx's GeoIP2 module and set those headers
  in `nginx/conf.d/qr-altrix.conf`.
- **Email** is best-effort everywhere: a missing SMTP server never blocks a signup, an
  invitation or an abuse notice.

---

## Security

- Passwords: bcrypt, cost 12. Sessions: signed JWT in an HTTP-only, SameSite=Lax cookie
  with a version counter, so a password change signs out every other device.
- API keys are stored only as SHA-256 hashes; the key is shown exactly once.
- Optional TOTP two-factor authentication with single-use recovery codes.
- Every request body is validated with Zod before it reaches Prisma; all queries are
  parameterised through the ORM.
- Uploads are type- and size-checked, stored under random keys, and SVG files are
  sanitised (scripts, event handlers, `javascript:` URLs and entities stripped) before
  they are ever served.
- Rate limits on auth, the API, downloads, unlock attempts and abuse reports, backed by
  Redis when present.
- Visitor IPs are salted-hashed and truncated; an administrator can switch IP processing
  off entirely.
- Security-relevant actions are written to a per-user security history and a workspace
  audit log.

Operator-controlled hardening, in **Admin → Platform settings → Login and admin security**:

| Setting | Default | Effect |
|---|---|---|
| Require two-factor for administrators | off | An admin without TOTP is sent to enrol before the admin panel opens, and admin API calls are refused |
| Sign out after inactivity | `0` (never) | Idle sessions stop working after N minutes |
| Lock an account after failed sign-ins | `10` | Per account, counted over 15 minutes, on top of the per-IP limit. A password reset always restores access |

Enrol your own two-factor **before** requiring it for admins, so you cannot lock yourself
out. Admin panel access is itself logged (once per admin per hour).

### Google sign-in

Create an OAuth client at <https://console.cloud.google.com/apis/credentials> →
*Create credentials* → *OAuth client ID* → *Web application*:

- Authorised JavaScript origin: `https://your-domain`
- Authorised redirect URI: `https://your-domain/api/auth/google/callback`

Put the client id and secret in `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
and restart. The Google buttons then appear on the signup, login and homepage download
flows automatically; with the variables empty they are hidden rather than broken. Google
accounts arrive with their email already verified, and a visitor's in-progress QR design
survives the round trip to Google and back.

Found a vulnerability? Email the address in `MAIL_FROM` rather than opening a public
issue.

---

## Licence and trademarks

Self-hosted software; adapt it for your own deployment. “QR Code” is a registered
trademark of Denso Wave Incorporated. QR ALTRIX is an independent project with its own
branding, copy, assets and implementation, and is not affiliated with any other QR
service.
