# Module 8 — Visitor & Member Management  
## API Endpoints for Testing & Frontend Integration

**Base URL:** `{API}` = `http://localhost:5000/api` (or `VITE_API_URL`)  
**Auth header (staff routes):** `Authorization: Bearer <access_token>`  
**Response shape:** `{ success, message, data }` or `{ success: false, message, errors? }`

Existing modules (auth, artifacts, tickets, exhibitions, conservation, dashboard, AI, users, roles) are unchanged. Module 8 routes are additive under `/api`.

---

## Quick setup

```bash
# Backend
cd smrmp-backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed --seed 20260726120000-seed-visitors-members.js
npm run dev

# Frontend
cd smrmp-frontend
npm run dev
```

**Staff login** (existing demo accounts) → then open sidebar **Visitors & Members**.

**Public pages (no login):**
- `/feedback`
- `/book-group-visit`
- `/membership/:id/card`

---

## Permissions (RBAC)

| Permission | Used for |
|---|---|
| `visitors.read` | List/view visitors, visit logs, analytics |
| `visitors.create` | Register visitors |
| `visitors.update` | Edit visitor profiles |
| `visitors.delete` | Soft-delete visitors (admin) |
| `visitors.checkin` | Gate check-in |
| `members.read` | List memberships / expiring |
| `members.create` | Issue membership |
| `members.update` | Renew / update membership |
| `members.manage` | Tiers + cancel + send reminders |
| `members.verify` | Scan membership QR at gate |
| `bookings.read` | List / today / calendar / invoice view |
| `bookings.update` | Confirm / cancel / update booking |
| `bookings.manage` | Complete booking |
| `feedback.read` | Staff feedback list + analytics |
| `feedback.update` | Respond to feedback |
| `feedback.manage` | Publish / unpublish testimonials |

**Role defaults:** admin = all · curator = most Module 8 ops · conservation = read/check-in/verify/feedback.read · maintenance = check-in/verify/bookings.read

---

## 1. Visitors — `/api/visitors`

| Method | Path | Auth | Permission | Purpose |
|---|---|---|---|---|
| GET | `/visitors` | Staff | `visitors.read` | Paginated list (`page`, `limit`, `search`, `visitor_type`) |
| POST | `/visitors` | Staff | `visitors.create` | Register visitor |
| GET | `/visitors/search?q=` | Staff | `visitors.read` | Autocomplete search |
| GET | `/visitors/analytics/summary` | Staff | `visitors.read` | KPI summary |
| GET | `/visitors/analytics/trends` | Staff | `visitors.read` | Visit trends |
| GET | `/visitors/analytics/segments` | Staff | `visitors.read` | Segments |
| GET | `/visitors/analytics/feedback` | Staff | `visitors.read` | Feedback rollup |
| GET | `/visitors/:id` | Staff | `visitors.read` | Profile |
| PUT | `/visitors/:id` | Staff | `visitors.update` | Update profile |
| DELETE | `/visitors/:id` | Staff | `visitors.delete` | Soft delete |
| POST | `/visitors/:id/checkin` | Staff | `visitors.checkin` | Check in (alias: `/check-in`) |
| GET | `/visitors/:id/visits` | Staff | `visitors.read` | Visit history |
| GET | `/visitors/:id/memberships` | Staff | `visitors.read` | Membership history |
| GET | `/visitors/:id/feedback` | Staff | `visitors.read` | Feedback by visitor |
| GET | `/visitors/:id/communications` | Staff | `visitors.read` | Comms log |

### POST `/visitors` body

```json
{
  "first_name": "Abebe",
  "last_name": "Kebede",
  "email": "abebe@example.com",
  "phone": "+251911000000",
  "gender": "male",
  "date_of_birth": "1990-01-15",
  "nationality": "Ethiopian",
  "address": "Addis Ababa",
  "visitor_type": "individual",
  "preferred_language": "en",
  "marketing_opt_in": true,
  "notes": "Walk-in",
  "save_only": false
}
```

`visitor_type`: `individual` | `group` | `student` | `vip` | `member` | `researcher`  
`save_only: true` → create profile without check-in visit log.

### POST `/visitors/:id/checkin` body

```json
{ "entry_method": "staff_assisted", "notes": "Gate counter" }
```

`entry_method`: `qr_ticket` | `membership_card` | `group_booking` | `cash_counter` | `comp` | `staff_assisted`

### FE pages
- `/visitors` → `VisitorsPage`
- `/visitors/:id` → `VisitorDetailPage`
- `/visitors/analytics` → `VisitorAnalyticsPage`  
API client: `src/api/visitorApi.js`

---

## 2. Membership tiers — public + admin

| Method | Path | Auth | Permission | Purpose |
|---|---|---|---|---|
| GET | `/memberships/tiers` | Public | — | Active tiers |
| GET | `/membership-tiers` | Public | — | Alias of above |
| GET | `/memberships/tiers/:id` | Public | — | Tier detail |
| GET | `/membership-tiers/:id` | Public | — | Alias |
| POST | `/memberships/tiers` | Staff | `members.manage` | Create tier |
| PUT | `/memberships/tiers/:id` | Staff | `members.manage` | Update tier |
| DELETE | `/memberships/tiers/:id` | Staff | `members.manage` | Delete tier |

### Example response `data.tiers[]`

```json
{
  "id": "...",
  "name": "Gold",
  "slug": "gold",
  "price_etb": 2500,
  "duration_months": 12,
  "benefits": ["Unlimited free visits", "2 guest passes per visit"],
  "max_guests": 2,
  "discount_percent": 15,
  "is_active": true,
  "display_order": 3
}
```

---

## 3. Memberships — `/api/memberships`

| Method | Path | Auth | Permission | Purpose |
|---|---|---|---|---|
| GET | `/memberships` | Staff | `members.read` | List (`page`, `status`, `tier_id`, `visitor_id`) |
| POST | `/memberships` | Staff | `members.create` | Issue membership + QR |
| GET | `/memberships/expiring?days=30` | Staff | `members.read` | Expiring soon |
| POST | `/memberships/send-reminders` | Staff | `members.manage` | Batch renewal reminders (alias: `/renewal-reminders`) |
| GET | `/memberships/verify/:code` | Staff | `members.verify` | Gate verify QR → logs visit if valid |
| GET | `/memberships/:id` | Staff | `members.read` | Detail |
| PUT | `/memberships/:id` | Staff | `members.update` | Update |
| POST | `/memberships/:id/renew` | Staff | `members.update` | Renew (also `PATCH`) |
| POST | `/memberships/:id/cancel` | Staff | `members.update` | Cancel (also `PATCH` + `members.manage`) |
| GET | `/memberships/:id/card` | **Public** | — | Digital card payload + QR data URL |

### POST `/memberships` body

```json
{
  "visitor_id": "<uuid>",
  "tier_id": "<uuid>",
  "payment_method": "telebirr",
  "payment_reference": "TX-123",
  "start_date": "2026-07-25",
  "auto_renew": false
}
```

`payment_method`: `telebirr` | `chapa` | `cash` | `bank`  
`status`: `pending` | `active` | `expired` | `cancelled`

### FE pages
- `/memberships` → `MembershipsPage`
- `/memberships/issue` → `IssueMembershipPage`
- `/memberships/verify` → `MembershipVerifyPage`
- `/membership/:id/card` → `MembershipCardPage` (public)  
API client: `src/api/membershipApi.js`

---

## 4. Group bookings — `/api/group-bookings`

| Method | Path | Auth | Permission | Purpose |
|---|---|---|---|---|
| POST | `/group-bookings` | **Public** | — | Submit booking request |
| GET | `/group-bookings` | Staff | `bookings.read` | List / filter |
| GET | `/group-bookings/today` | Staff | `bookings.read` | Today’s schedule |
| GET | `/group-bookings/calendar?month=YYYY-MM` | Staff | `bookings.read` | Calendar aggregates |
| GET | `/group-bookings/:id` | Staff | `bookings.read` | Detail |
| PUT | `/group-bookings/:id` | Staff | `bookings.update` | Update |
| POST | `/group-bookings/:id/confirm` | Staff | `bookings.update` | Confirm (also `PATCH`) |
| POST | `/group-bookings/:id/cancel` | Staff | `bookings.update` | Cancel (also `PATCH`) |
| POST | `/group-bookings/:id/complete` | Staff | `bookings.manage` | Complete + visit log (also `PATCH`) |
| GET | `/group-bookings/:id/invoice` | Staff | `bookings.read` | Invoice payload |
| POST | `/group-bookings/:id/invoice` | Staff | `bookings.update` | Generate/refresh invoice |

### POST `/group-bookings` body (canonical)

```json
{
  "group_name": "Lideta Primary School",
  "contact_name": "Tigist Worku",
  "contact_phone": "+251911111111",
  "contact_email": "tigist@school.et",
  "visitor_count": 40,
  "visit_date": "2026-08-15",
  "visit_time": "10:00",
  "group_type": "school",
  "guide_required": true,
  "special_requirements": "Amharic guide"
}
```

**PRD aliases also accepted:** `organiser_name`, `organiser_phone`, `organiser_email`, `organisation_name`, `organisation_type`, `expected_count`, `preferred_time`

**Rules:** `visit_date` ≥ today + 3 days · `visitor_count` ≥ 2  
**Pricing:** 2–9 → 150 ETB/pp · 10–29 → 100 · 30+ → 75 · +500 if guide

`group_type`: `school` | `tourist` | `corporate` | `family` | `other`  
`status`: `pending` | `confirmed` | `completed` | `cancelled`

### FE pages
- `/group-bookings` → `GroupBookingsPage`
- `/group-bookings/:id` → `BookingDetailPage`
- `/book-group-visit` → `PublicGroupBookingPage`  
API client: `src/api/groupBookingApi.js`

---

## 5. Feedback — `/api/feedback`

| Method | Path | Auth | Permission | Purpose |
|---|---|---|---|---|
| POST | `/feedback` | **Public** | — | Submit feedback (+ async AI sentiment) |
| GET | `/feedback/public` | **Public** | — | Published testimonials |
| GET | `/feedback` | Staff | `feedback.read` | Staff list |
| GET | `/feedback/analytics` | Staff | `feedback.read` | Aggregates |
| GET | `/feedback/:id` | Staff | `feedback.read` | Detail |
| PUT | `/feedback/:id` | Staff | `feedback.update` | Update |
| POST | `/feedback/:id/respond` | Staff | `feedback.update` | Staff response (also `PATCH`) |
| POST | `/feedback/:id/publish` | Staff | `feedback.manage` | Publish/unpublish (also `PATCH`) |

### POST `/feedback` body

```json
{
  "rating": 5,
  "category": "overall",
  "comment": "Wonderful visit",
  "highlight": "Adwa gallery",
  "improvement": "More seating",
  "visitor_name": "Guest",
  "visitor_email": "guest@example.com"
}
```

Aliases: `overall_rating` → `rating`; `highlight`/`improvement` merged into `comment` if comment omitted.  
`category`: `exhibition` | `staff` | `facility` | `ticketing` | `overall` | `other`

### POST `/feedback/:id/respond` body

```json
{ "response_text": "Thank you for visiting!" }
```

Alias: `staff_response`

### POST `/feedback/:id/publish` body

```json
{ "is_public": true }
```

Alias: `is_published`. Only ratings ≥ 4 can be published.

### FE pages
- `/feedback` → `FeedbackFormPage` (public)
- `/feedback/dashboard` → `FeedbackDashboardPage`  
API client: `src/api/feedbackApi.js`

---

## 6. Visit logs — `/api/visit-logs`

| Method | Path | Auth | Permission | Purpose |
|---|---|---|---|---|
| GET | `/visit-logs` | Staff | `visitors.read` | List logs |
| POST | `/visit-logs` | Staff | `visitors.checkin` | Manual log |
| GET | `/visit-logs/today` | Staff | `visitors.read` | Today’s entries |
| GET | `/visit-logs/analytics` | Staff | `visitors.read` | Visit analytics |

---

## Suggested curl test order

```bash
API=http://localhost:5000/api

# 1) Public tiers
curl -s "$API/membership-tiers" | jq

# 2) Login (get TOKEN)
curl -s -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@adwa.museum","password":"Demo@2026!"}' | jq

# 3) Register visitor
curl -s -X POST "$API/visitors" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"first_name":"Test","last_name":"Visitor","phone":"+251900000001","save_only":true}' | jq

# 4) Check-in
curl -s -X POST "$API/visitors/$VISITOR_ID/checkin" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"entry_method":"staff_assisted"}' | jq

# 5) Issue membership
curl -s -X POST "$API/memberships" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"visitor_id\":\"$VISITOR_ID\",\"tier_id\":\"$TIER_ID\",\"payment_method\":\"cash\"}" | jq

# 6) Verify membership QR
curl -s "$API/memberships/verify/$QR_CODE" -H "Authorization: Bearer $TOKEN" | jq

# 7) Public group booking
curl -s -X POST "$API/group-bookings" -H 'Content-Type: application/json' \
  -d '{"group_name":"Test School","contact_name":"Teacher","contact_phone":"+251911222333","visitor_count":40,"visit_date":"2026-08-20","guide_required":true}' | jq

# 8) Confirm booking
curl -s -X POST "$API/group-bookings/$BOOKING_ID/confirm" \
  -H "Authorization: Bearer $TOKEN" | jq

# 9) Public feedback
curl -s -X POST "$API/feedback" -H 'Content-Type: application/json' \
  -d '{"rating":5,"highlight":"Great exhibits","improvement":"More guides"}' | jq

# 10) Feedback analytics
curl -s "$API/feedback/analytics" -H "Authorization: Bearer $TOKEN" | jq
```

---

## Frontend route map

| UI route | Page | Permission / access |
|---|---|---|
| `/visitors` | VisitorsPage | `visitors.read` |
| `/visitors/:id` | VisitorDetailPage | `visitors.read` |
| `/visitors/analytics` | VisitorAnalyticsPage | `visitors.read` |
| `/memberships` | MembershipsPage | `members.read` |
| `/memberships/issue` | IssueMembershipPage | `members.create` |
| `/memberships/verify` | MembershipVerifyPage | `members.verify` |
| `/membership/:id/card` | MembershipCardPage | Public |
| `/group-bookings` | GroupBookingsPage | `bookings.read` |
| `/group-bookings/:id` | BookingDetailPage | `bookings.read` |
| `/book-group-visit` | PublicGroupBookingPage | Public |
| `/feedback` | FeedbackFormPage | Public |
| `/feedback/dashboard` | FeedbackDashboardPage | `feedback.read` |

---

## Seed data counts (after Module 8 seeder)

| Entity | Count |
|---|---|
| Membership tiers | 5 |
| Visitors | 12 |
| Memberships | 7 |
| Group bookings | 4 |
| Visit logs | 30 |
| Visitor feedback | 15 |

---

## Notes / non-breaking design

- All Module 8 tables/routes/permissions are **additive** — no changes to ticket purchase, artifact CRUD, or auth flows.
- Legacy telegram `visitor_feedback` table (if present) is renamed to `visitor_feedback_telegram_legacy` so Module 8 can own `visitor_feedback`.
- Public feedback AI sentiment runs fire-and-forget and fails silently if no API key.
- Membership card QR verify auto-creates a visit log when valid.

*SMRMP Module 8 — API Reference · Adwa Victory Memorial Museum*
