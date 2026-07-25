# SMRMP Backend — Complete Render Deployment Guide

This guide is written for **this repository’s actual backend** (`smrmp-backend/`), not a generic Node tutorial.

**What you will deploy**

| Piece | Where it runs |
|-------|----------------|
| Express API (`server.js`) | Render **Web Service** |
| PostgreSQL (app tables via Sequelize) | Render **PostgreSQL** |
| Auth passwords / sessions | **Supabase Auth** (external — already required by this codebase) |
| Artifact images | **Cloudinary** (external) |
| AI features | **OpenAI** (external) |
| Ticket payments | Telebirr **sandbox simulation** (no real payments) |

**Monorepo note:** The GitHub repo root is `SMRMP/`. The API lives in the `smrmp-backend/` folder. On Render you must set **Root Directory** to `smrmp-backend`.

---

## Part 0 — Pre-deployment fixes already applied in code

Before following this guide, make sure your local branch includes these deployment fixes (they were required for Render):

| Fix | Why |
|-----|-----|
| `app.set('trust proxy', 1)` in `src/app.js` | Render sits behind a proxy; without this, rate limits and `req.ip` break |
| `DATABASE_URL` support in `src/config/dbEnv.js` | Render Postgres gives you `DATABASE_URL`; the app previously only accepted `DB_*` |
| `sequelize-cli` moved to **dependencies** | Migrations must run on Render; CLI must not be install-only in local/dev |
| `.npmrc` with `legacy-peer-deps=true` | Avoids Cloudinary / `multer-storage-cloudinary` peer conflict during `npm install` |
| `auth:sync` emails aligned with seeder (`@adwa.museum`) | Demo login failed if emails did not match |

If you do not have these changes, pull/merge them before deploying.

---

## Part 1 — Verify the project is deployment-ready

### 1.1 What “ready” means for this project

The API is ready when:

1. It starts with `npm start` (not only `npm run dev`).
2. All **required env vars** from `src/config/environment.js` are available in production.
3. Database tables can be created with `npm run db:migrate`.
4. Demo staff profiles can be seeded + synced into Supabase Auth.
5. `GET /health` returns JSON without auth.

### 1.2 Local commands to run before you open Render

From your machine:

```bash
cd /path/to/SMRMP/smrmp-backend

# Install dependencies (uses .npmrc legacy-peer-deps)
npm install

# Confirm start script exists
npm run start
```

Press `Ctrl+C` after you see:

```text
Database connection established
SMRMP API listening on port ...
```

**Why:** Render runs `npm start` → `node server.js`. If this fails locally with env vars present, it will also fail on Render.

### 1.3 Confirm scripts this project actually uses

From `package.json`:

| Script | Command | Used on Render? |
|--------|---------|-----------------|
| `start` | `node server.js` | **Yes** — Start Command |
| `db:migrate` | `npx sequelize-cli db:migrate` | **Yes** — first deploy / schema updates |
| `db:seed` | `npx sequelize-cli db:seed:all` | Optional — demo data only |
| `auth:sync` | `node scripts/sync-supabase-auth-users.js` | Optional — creates Supabase Auth users for demo staff |
| `dev` | `nodemon server.js` | **No** — local only |
| `test` | Jest | **No** — local/CI only |

There is **no** `build` script. Render build = install dependencies only.

### 1.4 Confirm health endpoint

With the server running:

```bash
curl http://localhost:5000/health
```

Expected:

```json
{
  "status": "healthy",
  "service": "SMRMP API",
  "timestamp": "..."
}
```

**Why:** You will point Render’s health check at `/health`.

---

## Part 2 — Check for missing production configurations

### 2.1 Things this project requires that beginners often miss

| Item | Required? | Notes |
|------|-----------|-------|
| `NODE_ENV=production` | Yes | Enables production error behavior |
| `DB_SSL=true` (or `DATABASE_URL`) | Yes on Render Postgres | Managed Postgres needs SSL |
| `SUPABASE_URL` + `SUPABASE_ANON_KEY` | Yes | Auth is **Supabase Auth**, not local JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | For seed login setup | Needed only for `npm run auth:sync` |
| `FRONTEND_URL` | Yes | CORS allows **exactly** this origin |
| `API_BASE_URL` | Yes | Must be your Render API URL |
| Cloudinary keys | Yes | Validated at startup even before first upload |
| OpenAI key + model | Yes | Validated at startup |
| Telebirr sandbox vars | Yes | Validated at startup; payment is simulated |

### 2.2 What you do **not** need for this deploy

| Item | Why not |
|------|---------|
| `JWT_SECRET` | Login uses Supabase access tokens, not local JWT signing |
| Local `uploads/` disk folder | Images go to Cloudinary via memory upload |
| Docker on Render | Render builds from Node + `package.json` |
| Redis | Not used |
| Separate Telebirr production keys | MVP always simulates payments |

### 2.3 Auth architecture (critical to understand)

```text
POST /api/auth/login
  → Supabase Auth (email/password)
  → loads role/profile from public.users (Postgres on Render)
  → returns Supabase access_token as data.token
```

So:

- **Render Postgres** = museum data + `public.users` profiles/roles  
- **Supabase Auth** = passwords / tokens  

If you only migrate Postgres and never create Auth users, login returns 401/403.

---

## Part 3 — Prepare environment variables (values checklist)

Copy this checklist and fill values **before** creating the Web Service. You will paste them into Render later.

### 3.1 Core

```env
NODE_ENV=production
# PORT is injected by Render — do not hardcode a custom port in the dashboard
```

### 3.2 Database (choose ONE approach)

**Approach A — recommended on Render (simplest)**

After you create Render Postgres, Render can link:

```env
DATABASE_URL=<Internal Database URL from Render>
DB_SSL=true
```

Do **not** also set conflicting `DB_HOST` / `DB_PASSWORD` unless you know they match.

**Approach B — discrete vars**

Parse the Internal Database URL:

```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Then set:

```env
DB_HOST=<HOST>
DB_PORT=5432
DB_NAME=<DATABASE>
DB_USER=<USER>
DB_PASSWORD=<PASSWORD>
DB_SSL=true
```

### 3.3 Supabase Auth

From Supabase Dashboard → **Project Settings** → **API**:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJ...   # anon / public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # service_role (server only — never put in frontend)
```

### 3.4 Cloudinary

From Cloudinary Dashboard → **Settings** → **API Keys**:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3.5 OpenAI

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### 3.6 Telebirr sandbox placeholders (required by validateEnv)

```env
TELEBIRR_APP_ID=sandbox_app_id
TELEBIRR_APP_KEY=sandbox_key
TELEBIRR_SHORT_CODE=sandbox_code
TELEBIRR_PUBLIC_KEY=sandbox_public_key
TELEBIRR_BASE_URL=https://sandbox.telebirr.com
```

### 3.7 URLs (set after you know the Render hostname)

```env
# After first deploy you will know the API URL, e.g.:
API_BASE_URL=https://smrmp-api.onrender.com

# Your real frontend origin (no trailing slash)
FRONTEND_URL=https://your-frontend.vercel.app
```

**Common mistake:** `FRONTEND_URL=https://site.com/` (trailing slash) while the browser origin is `https://site.com` → CORS failures.

**Common mistake:** Using `http://localhost:3000` in production → browser CORS blocks your live frontend.

---

## Part 4 — Configure the production database strategy

### 4.1 What tables this app needs

Migrations create the full schema (see `migrations/20260725170000-create-all-tables.js` + password-null migration), including:

- `users`
- `artifacts`, `artifact_images`
- `exhibitions`, `exhibition_artifacts`
- `conservation_logs`
- `tickets`, `ticket_types`
- `audit_logs`

### 4.2 How schema is applied

This app does **not** auto-migrate on boot.

`server.js` only:

1. `validateEnv()`
2. `sequelize.authenticate()`
3. `app.listen(PORT)`

You must run:

```bash
npm run db:migrate
```

against the production database (via Render Shell or a one-off job).

### 4.3 Seed data (optional but useful for demos)

```bash
npm run db:seed
npm run auth:sync
```

Seed creates demo staff in `public.users`:

| Email | Role | Password after `auth:sync` |
|-------|------|----------------------------|
| `admin@adwa.museum` | admin | `Demo@2026!` (default) |
| `curator@adwa.museum` | curator | `Demo@2026!` |
| `conservation@adwa.museum` | conservation | `Demo@2026!` |

Override password with `DEMO_AUTH_PASSWORD` if desired.

**Danger:** Never run `npm run db:reset` or `db:migrate:undo` on a production DB that has real data — those wipe schema/data.

---

## Part 5 — Create a PostgreSQL database on Render

### 5.1 Create the database

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in.
2. Click **New +** (top right).
3. Click **PostgreSQL**.
4. Fill in:
   - **Name:** `smrmp-db` (any name is fine)
   - **Database:** leave default or set `smrmp`
   - **User:** leave default
   - **Region:** pick the **same region** you will use for the Web Service (e.g. Frankfurt / Oregon)
   - **Plan:** Free (or Starter if Free is unavailable in your account)
5. Click **Create Database**.
6. Wait until status is **Available**.

### 5.2 Copy connection values

On the database page, open the **Info / Connections** section.

You will see:

- **Internal Database URL** — use this when the Web Service is also on Render (faster, private network)
- **External Database URL** — use only from your laptop or outside Render

**Why Internal URL?** Web Service ↔ Postgres on Render’s private network. Lower latency, no public exposure needed for the app.

**Common mistake:** Using the External URL from the Web Service works, but Internal is preferred.  
**Common mistake:** Copying the URL and forgetting SSL (`DB_SSL=true`).

### 5.3 Keep the database running

On free tiers, databases may sleep or be deleted after inactivity/time limits. For hackathon demos, wake/recreate if needed and re-run migrations.

---

## Part 6 — Connect the backend to Render PostgreSQL

You will do this by environment variables on the Web Service (Part 10). Conceptually:

```text
Render Web Service
  → DATABASE_URL (Internal) or DB_* vars
  → DB_SSL=true
  → Sequelize (src/config/database.js)
  → Render Postgres
```

Also keep:

```text
SUPABASE_URL / SUPABASE_ANON_KEY
  → Auth only (not your museum tables)
```

**Do not** point `DATABASE_URL` at Supabase Postgres unless your team intentionally chose Supabase as the app DB. This guide uses **Render Postgres for app data** + **Supabase Auth for login**, matching the current code split.

---

## Part 7 — Configure Sequelize migrations and seeders for production

### 7.1 Config files this project uses

| File | Role |
|------|------|
| `.sequelizerc` | Points CLI at `src/config/sequelize-cli.js`, `migrations/`, `seeders/` |
| `src/config/sequelize-cli.js` | Reads `DATABASE_URL` or `DB_*` + SSL |
| `migrations/` | Schema |
| `seeders/20260725170100-demo-data.js` | Demo data |

### 7.2 Production migrate command

On Render Shell (after Web Service exists and env vars are set):

```bash
cd /opt/render/project/src   # Render usually starts you near the service root
# If Root Directory is smrmp-backend, you are already in that folder

export NODE_ENV=production
npm run db:migrate
```

Expected: migrations run and end with “up” / migrated messages (exact wording varies by sequelize-cli version).

### 7.3 Production seed + auth sync (demo)

```bash
export NODE_ENV=production
npm run db:seed
npm run auth:sync
```

**Why `auth:sync`:** Seeder inserts rows into `public.users` but does **not** create Supabase Auth accounts. Without Auth users, `POST /api/auth/login` fails.

### 7.4 Common migration mistakes

| Mistake | Result | Fix |
|---------|--------|-----|
| Start app before migrate | Queries fail / 500s | Run `npm run db:migrate` first |
| `DB_SSL` missing | `connection requires SSL` / similar | Set `DB_SSL=true` |
| Wrong database URL | migrate succeeds on empty wrong DB | Double-check Internal URL |
| Running `db:reset` in prod | Data loss | Never use reset in production |

---

## Part 8 — Configure build / start commands

Use these **exact** values for this repo:

| Setting | Value |
|---------|--------|
| **Runtime** | Node |
| **Root Directory** | `smrmp-backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

**Why no build step?** This is plain CommonJS Node (no TypeScript compile / no Vite build for the API).

**Why `npm install` not `npm ci --omit=dev`?** You need `sequelize-cli` available to migrate from the Shell. It is now a production dependency; either install style works, but keep it simple with `npm install`.

---

## Part 9 — Set up the Render Web Service

### 9.1 Create the service

1. Dashboard → **New +** → **Web Service**.
2. Connect your GitHub account if prompted.
3. Select repository: **`dagmawi77/SMRMP`** (or your fork).
4. Configure:

| Field | Value |
|-------|--------|
| **Name** | `smrmp-api` |
| **Region** | Same as Postgres |
| **Branch** | `main` |
| **Root Directory** | `smrmp-backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance type** | Free / Starter |

5. Do **not** click Deploy yet until environment variables are filled (next part).  
   If the UI forces deploy, it’s OK — the first deploy may fail until env vars + migrate are done; you will redeploy.

### 9.2 Health check

In the service **Settings**:

- **Health Check Path:** `/health`

**Why:** Render pings this path; `/health` is public and does not need a DB query.

### 9.3 Auto-deploy

Leave **Auto-Deploy** = **Yes** if you want every push to `main` to redeploy.

---

## Part 10 — Configure all required environment variables in Render

### 10.1 Where to click

1. Open your Web Service `smrmp-api`.
2. Left sidebar → **Environment**.
3. Add variables one by one (or **Bulk Editor**).
4. Click **Save Changes**.

### 10.2 Recommended production set

```env
NODE_ENV=production

# Link from Render Postgres (Dashboard → your DB → Connections)
DATABASE_URL=<Internal Database URL>
DB_SSL=true

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

TELEBIRR_APP_ID=sandbox_app_id
TELEBIRR_APP_KEY=sandbox_key
TELEBIRR_SHORT_CODE=sandbox_code
TELEBIRR_PUBLIC_KEY=sandbox_public_key
TELEBIRR_BASE_URL=https://sandbox.telebirr.com

FRONTEND_URL=https://YOUR_FRONTEND_ORIGIN
API_BASE_URL=https://smrmp-api.onrender.com
```

### 10.3 Linking DATABASE_URL from the Postgres service

Easier method:

1. Web Service → **Environment**.
2. Click **Add Environment Variable** / **Link** (UI label varies).
3. Select your Postgres instance → choose **`DATABASE_URL`** (Internal).
4. Still add `DB_SSL=true` manually.

### 10.4 Do not set

| Variable | Reason |
|----------|--------|
| `PORT=5000` | Render injects `PORT`; overriding can break routing |
| Local Docker passwords | Wrong host |
| Frontend `VITE_*` keys | Those belong to the frontend project |

### 10.5 Update `API_BASE_URL` after first URL is known

After deploy, Render shows something like:

```text
https://smrmp-api.onrender.com
```

Set:

```env
API_BASE_URL=https://smrmp-api.onrender.com
```

Save → Redeploy (or wait for auto restart).

---

## Part 11 — Deploy the application

### 11.1 Trigger deploy

1. Web Service → **Manual Deploy** → **Deploy latest commit**  
   or push to `main` if auto-deploy is on.
2. Open **Logs**.

### 11.2 Healthy boot logs look like

```text
==> Running build command npm install...
==> Start command npm start...
Database connection established
SMRMP API listening on port 10000
```

(Port number is whatever Render assigned.)

### 11.3 If boot fails: read the exact message

| Log message | Meaning | Fix |
|-------------|---------|-----|
| `Missing required environment variables: ...` | `validateEnv()` failed | Add the listed keys in Environment |
| `password authentication failed` | Bad DB credentials | Recopy Internal URL |
| `connection requires SSL` / TLS errors | SSL not enabled | `DB_SSL=true` |
| `Cannot find module '@supabase/supabase-js'` | Install failed / incomplete | Ensure build is `npm install` and `.npmrc` is present |
| `ENETUNREACH` IPv6 | Wrong host (e.g. direct Supabase DB over IPv6) | Use Render Internal URL or IPv4 pooler |

---

## Part 12 — Run database migrations after deployment

### 12.1 Open Render Shell

1. Web Service page → **Shell** (or **SSH** / one-off shell, depending on plan/UI).
2. Wait until the prompt appears in the service root (`smrmp-backend` if Root Directory is set).

### 12.2 Migrate

```bash
export NODE_ENV=production
npm run db:migrate
```

### 12.3 (Optional) Seed demo data + create Auth users

```bash
npm run db:seed
npm run auth:sync
```

### 12.4 Verify tables exist (optional)

If `psql` is available in the shell:

```bash
# Only if psql client exists in the environment
psql "$DATABASE_URL" -c '\dt'
```

Or use any SQL client with the **External** Database URL from your laptop.

---

## Part 13 — Verify the deployment

Replace `https://smrmp-api.onrender.com` with your real URL.

### 13.1 Health

```bash
curl https://smrmp-api.onrender.com/health
```

Expect `status: healthy`.

### 13.2 Public ticket types (needs migrated + seeded `ticket_types`)

```bash
curl https://smrmp-api.onrender.com/api/tickets/types
```

Expect `success: true` and a `ticket_types` array.

### 13.3 Login (needs seed + auth:sync)

```bash
curl -X POST https://smrmp-api.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@adwa.museum","password":"Demo@2026!"}'
```

Expect `data.token` (Supabase access token) and `data.user.role = "admin"`.

### 13.4 Free-tier cold start

First request after idle may take **30–60+ seconds**. Retry once if you get a gateway timeout.

---

## Part 14 — Test every critical API endpoint

Set:

```bash
export API=https://smrmp-api.onrender.com
export TOKEN='paste-access-token-here'
```

### 14.1 Auth

```bash
# Login
curl -s -X POST "$API/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@adwa.museum","password":"Demo@2026!"}'

# Me
curl -s "$API/api/auth/me" -H "Authorization: Bearer $TOKEN"

# Logout
curl -s -X POST "$API/api/auth/logout" -H "Authorization: Bearer $TOKEN"
```

### 14.2 Tickets

```bash
# Catalog
curl -s "$API/api/tickets/types"

# Purchase (public)
curl -s -X POST "$API/api/tickets/purchase" \
  -H 'Content-Type: application/json' \
  -d '{
    "ticket_type":"adult",
    "visitor_name":"Abebe Kebede",
    "visitor_phone":"+251911000000",
    "quantity":1,
    "payment_method":"telebirr",
    "visit_date":"2026-07-26"
  }'

# Copy qr_ticket_code from response, then:
curl -s "$API/api/tickets/verify/TKT-XXXXXXXX" \
  -H "Authorization: Bearer $TOKEN"

# Staff list
curl -s "$API/api/tickets?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 14.3 Artifacts / exhibitions / conservation / dashboard

```bash
curl -s "$API/api/artifacts" -H "Authorization: Bearer $TOKEN"
curl -s "$API/api/exhibitions" -H "Authorization: Bearer $TOKEN"
curl -s "$API/api/conservation" -H "Authorization: Bearer $TOKEN"
curl -s "$API/api/dashboard/stats" -H "Authorization: Bearer $TOKEN"
curl -s "$API/api/dashboard/charts" -H "Authorization: Bearer $TOKEN"
```

(Exact dashboard paths are those mounted in `dashboardRoutes.js` — if a path 404s, open that file and use the real path.)

### 14.4 AI (curator+)

```bash
curl -s -X POST "$API/api/ai/ask" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is Adwa Victory Memorial Museum?"}'
```

Also available: `/api/ai/describe-artifact`, `/api/ai/search`, `/api/ai/generate-report`.

### 14.5 Method mistakes (very common in Postman)

| Endpoint | Correct method |
|----------|----------------|
| `/api/auth/login` | **POST** |
| `/api/tickets/purchase` | **POST** |
| `/api/tickets/types` | **GET** |
| `/api/tickets/verify/:code` | **GET** + Bearer token |

If you see `Route GET /api/.../purchase not found`, you used GET instead of POST.

---

## Part 15 — Verify Cloudinary, AI, and third-party services

### 15.1 Cloudinary (artifact image upload)

1. Login as curator/admin; copy token.
2. In Postman: `POST {{API}}/api/artifacts`
3. Body → **form-data**:
   - `name` = `Test Artifact`
   - `category` = a valid category used by your validator
   - `location` = `Gallery A`
   - `images` = file (type File), up to 5
4. Authorization: Bearer token

Success: artifact created and image URLs point to `res.cloudinary.com/...`.

Failure modes:

| Symptom | Cause |
|---------|--------|
| Startup missing Cloudinary vars | Env not set |
| Upload 500 | Bad API secret / unsigned restricted |
| Multer errors | Field name must be `images` (see `uploadHandler`) |

### 15.2 OpenAI

Call `/api/ai/ask` with a curator token.

| Symptom | Cause |
|---------|--------|
| 401/403 | Wrong role (needs curator+) or bad token |
| 500 / OpenAI error | Invalid key or billing |
| Startup fails | `OPENAI_API_KEY` blank |

### 15.3 Supabase Auth

| Symptom | Cause |
|---------|--------|
| Invalid email or password | Auth user missing → run `auth:sync` |
| Authenticated but no staff profile | Row missing in `public.users` → run `db:seed` |
| Invalid JWT on protected routes | Expired token → login again |

### 15.4 Telebirr

Purchase always returns sandbox:

```json
"payment_simulation": {
  "status": "completed",
  "sandbox_mode": true,
  "sandbox_label": "DEMO — No real payment processed"
}
```

No real money moves. No webhook route is required for MVP.

---

## Part 16 — Troubleshoot common deployment errors

### 16.1 App crashed on boot — missing env

```text
Failed to start server: Missing required environment variables: SUPABASE_URL, ...
```

**Fix:** Add every listed variable → Save → Manual Deploy.

### 16.2 Database connection failed

```text
password authentication failed
```

**Fix:** Relink Internal `DATABASE_URL`. Reset DB password in Render only if you also update the Web Service env.

### 16.3 SSL required

```text
no pg_hba.conf entry ... no encryption
```

or SSL-related Sequelize errors.

**Fix:** `DB_SSL=true`.

### 16.4 Tables missing

```text
relation "ticket_types" does not exist
```

**Fix:** Shell → `npm run db:migrate` (and seed if needed).

### 16.5 CORS errors in browser

Browser console: `No 'Access-Control-Allow-Origin'`.

**Fix:** Set `FRONTEND_URL` to the exact frontend origin (scheme + host, no path, no trailing slash). Redeploy/restart.

### 16.6 429 Too Many Requests

Rate limits:

- Auth: 10 / 15 minutes
- General API: 200 / minute
- AI: 20 / minute

**Fix:** Wait; don’t hammer login in Postman loops. `trust proxy` is already set so limits should track real clients.

### 16.7 Free instance sleeping

First request slow or 502.

**Fix:** Retry; upgrade plan for demos that need always-on.

### 16.8 Root directory wrong

Build can’t find `package.json` / start fails.

**Fix:** Settings → **Root Directory** = `smrmp-backend` → Save → Redeploy.

### 16.9 Peer dependency install failure

```text
ERESOLVE could not resolve ... multer-storage-cloudinary
```

**Fix:** Ensure `.npmrc` contains `legacy-peer-deps=true` in `smrmp-backend/` (already added).

---

## Part 17 — Update the backend after future code changes

### 17.1 Normal code update (no schema change)

```bash
# on your laptop
cd /path/to/SMRMP
git add -A
git commit -m "Describe your change"
git push origin main
```

If Auto-Deploy is on, Render rebuilds and restarts.

**Verify:**

```bash
curl https://smrmp-api.onrender.com/health
```

### 17.2 Code update that includes a new migration

1. Push code containing the new file under `migrations/`.
2. Wait for deploy to finish.
3. Open **Shell**:

```bash
export NODE_ENV=production
npm run db:migrate
```

4. Smoke-test affected endpoints.

### 17.3 Env var change only

Environment → edit value → **Save Changes** → Manual Deploy (or restart).

---

## Part 18 — Safely redeploy without losing data

### 18.1 Safe operations

| Action | Data safe? |
|--------|------------|
| Manual Deploy / push to `main` | **Yes** — restarts app code only |
| Changing env vars | **Yes** |
| `npm run db:migrate` (forward only) | **Yes** — additive schema changes |
| Linking same Postgres service | **Yes** |

### 18.2 Dangerous operations (will lose data)

| Action | Effect |
|--------|--------|
| Delete the Postgres instance | All museum data gone |
| `npm run db:migrate:undo` | Drops migrated tables |
| `npm run db:reset` | Undo + migrate + seed (wipes) |
| `npm run db:seed:undo` | Removes seeded rows |
| Creating a **new** empty database and pointing `DATABASE_URL` at it | Old data not visible (still in old DB if not deleted) |

### 18.3 Safe redeploy checklist

1. Confirm Web Service still points at the **same** Postgres (`DATABASE_URL` unchanged).
2. Deploy code.
3. Run **only** new migrations if any: `npm run db:migrate`.
4. Do **not** seed again unless you intentionally want duplicate demo rows (seeders may fail or duplicate depending on implementation).
5. Test `/health` + login.

### 18.4 Backup tip (recommended before big changes)

From your laptop using the **External Database URL**:

```bash
pg_dump "EXTERNAL_DATABASE_URL_HERE" > smrmp-backup-$(date +%F).sql
```

Restore only if needed (advanced; don’t run casually on prod).

---

## Quick reference — Render settings for this repo

```text
Service type:        Web Service
Repo:                SMRMP (monorepo)
Root Directory:      smrmp-backend
Build Command:       npm install
Start Command:       npm start
Health Check Path:   /health
Postgres:            separate Render PostgreSQL (same region)
App data DB:         DATABASE_URL + DB_SSL=true
Auth:                Supabase Auth (SUPABASE_URL + SUPABASE_ANON_KEY)
Images:              Cloudinary
AI:                  OpenAI
Payments:            Telebirr sandbox simulation
Post-deploy once:    npm run db:migrate
Demo login setup:    npm run db:seed && npm run auth:sync
Demo logins:         admin@adwa.museum / Demo@2026!
```

---

## Final acceptance checklist

- [ ] Web Service is Live (green)
- [ ] `GET /health` works on the public URL
- [ ] Migrations applied
- [ ] (Demo) seed + `auth:sync` done
- [ ] Login returns a token
- [ ] Ticket purchase returns sandbox payment + `TKT-...` code
- [ ] Protected routes accept `Authorization: Bearer <token>`
- [ ] Artifact image upload reaches Cloudinary
- [ ] AI ask returns a response (with valid OpenAI key)
- [ ] `FRONTEND_URL` matches the real frontend origin
- [ ] You did **not** run `db:reset` on production

You are done when the checklist above passes.
