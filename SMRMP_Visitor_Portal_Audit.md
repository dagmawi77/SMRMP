# Visitor Portal Separation — Implementation Audit

**Date:** July 2026  
**Scope:** Frontend + Backend (auth, Module 8, dashboards, RBAC)  
**Status:** Analysis complete — implementation follows this document

---

## 1. Current Implementation Audit

### 1.1 What is already implemented

| Area | Status | Notes |
|------|--------|-------|
| Visitor account registration (`/register` → `POST /auth/register`) | Done | Forces `role=visitor` |
| Shared login (`/login` → `POST /auth/login`) | Done | Returns JWT + role + permissions |
| Session restore (Supabase + Zustand + `/auth/me`) | Done | Persists `smrmp_auth` |
| Public visitor journeys | Done | Tickets, feedback, group booking, artifact QR, membership card by ID |
| Staff Module 8 CRM | Done | `/visitors`, `/memberships`, `/group-bookings`, `/feedback/dashboard` |
| Staff ops dashboard (`/dashboard`) | Done | Gated by `dashboard.read` |
| RBAC catalog + permission guards | Done | Staff permissions for Module 8 |
| Digital membership card (public by membership id) | Done | `/membership/:id/card` |

### 1.2 What is correctly implemented

| Item | Why correct |
|------|-------------|
| Staff CRM pages under PrivateLayout + permissions | Module 8 PRD §5 explicitly labels these **(Staff)** — visitor relations / front-of-house ops |
| Public ticket purchase, feedback form, group booking form | PRD public surfaces |
| Visitor role forced on register | Correct identity model |
| Staff cannot be created via public register | Role forced to visitor |
| Permission-gated Module 8 APIs | Staff CRM must not be open to anonymous users |

### 1.3 What is partially implemented

| Item | Gap |
|------|-----|
| Authenticated visitor journey | Register works; no portal; login lands on tickets |
| Membership for visitors | Staff can issue cards; visitor has no “my membership” home |
| Tickets | Public purchase works; not linked to user account; no “my tickets” |
| Visit history | Exists for staff CRM; not exposed to visitor self |
| Role-based dashboards | Only one staff `/dashboard`; visitor has none |
| `/auth/me` profile | Omits phone/gender/DOB/nationality stored on User |
| `Visitor.user_account_id` | Field exists; never set on register |

### 1.4 What is incorrectly implemented

| Issue | Impact |
|-------|--------|
| `ROLE_REDIRECTS.visitor = '/tickets/buy'` | Ticket page is treated as visitor home — wrong |
| Login page framed as “Staff access” only | Visitors have no clear portal entry |
| Sidebar title “Visitor Portal” when a visitor hits PrivateLayout | Misleading empty staff shell |
| `SetPasswordPage` always navigates to `/dashboard` | Visitors (no `dashboard.read`) bounce away |
| `ChangePasswordPage` uses staff `PrivateLayout` | Visitors see admin shell with empty nav |
| Landing “Explore Visitor Portal” CTA | Marketing only — no portal route |
| No User ↔ CRM Visitor link on register | Portal cannot resolve “my” memberships/visits |
| `visitor` permissions = `[]` | Authenticated visitor cannot call any portal API |
| Dual concepts conflated in UX naming | Staff “Visitors & Members” vs end-user Visitor Portal |

### 1.5 What is missing

| Missing piece | Needed for |
|---------------|------------|
| Dedicated Visitor Layout + nav | Separated visitor UX |
| Visitor Dashboard (`/portal` or `/visitor/dashboard`) | Post-login / post-register home |
| Portal APIs: `/portal/me`, memberships, visits, tickets | Self-service data |
| Auto-login or seamless post-register → portal | PRD visitor journey |
| Role-specific dashboard homes (admin / staff / visitor) | Never send all roles to one page |
| Link `users.id` → `visitors.user_account_id` on register | Identity bridge |
| Visitor portal permissions (narrow, self-scoped) | Authorization without staff CRM access |

---

## 2. Incorrect Visitor / Admin Integrations Found

1. **Visitor post-login destination = Ticket Purchase** (`constants.js` `ROLE_REDIRECTS`) — treats a public commerce page as the authenticated home.
2. **No Visitor Dashboard** — authenticated visitors have nowhere to land that is “theirs.”
3. **Staff shell used for visitor password flows** — `ChangePasswordPage` wrapped in `PrivateLayout`.
4. **Branding collision** — Sidebar `PORTAL_TITLE_MAP.visitor = 'Visitor Portal'` inside the **staff** shell without visitor nav items.
5. **Staff Module 8 is NOT “wrong” as staff CRM** (PRD §5 Staff). It is wrong only if treated as the *visitor product*. It must stay for admin/curator/front-of-house, clearly labeled as staff ops.
6. **No separation of Admin Executive Dashboard vs Visitor Dashboard vs Staff ops** — one `/dashboard` for anyone with `dashboard.read`.

---

## 3. Features to Move from Admin/Staff Shell → Visitor Portal

These are **visitor self-service** concerns (must leave staff CRM as-is for ops):

| Feature | Current location | Target |
|---------|------------------|--------|
| Post-login home | `/tickets` | Visitor Dashboard |
| Profile / account | None (or staff CRM only) | Portal → Profile |
| Membership status + card | Staff memberships / public card URL | Portal → My Membership |
| Ticket purchase entry | Forced landing after login | Portal action → `/tickets` |
| Ticket history | None | Portal → My Tickets |
| Visit history (own) | Staff `/visitors/:id` | Portal → My Visits |
| Group booking (own requests) | Public form only | Portal → My Bookings + link to book |
| Feedback (submit) | Public `/feedback` | Portal quick action → `/feedback` |
| Settings / password | Staff shell change-password | Portal → Account |

**Keep in staff Admin/Staff nav (do not delete):**
- Visitors CRM, check-in, analytics  
- Issue/renew/cancel memberships, verify at gate  
- Group booking management, invoices  
- Feedback moderation dashboard  

Rename staff nav for clarity: **“Visitor Relations”** (staff) vs visitor **“My Portal”**.

---

## 4. Missing Visitor Dashboard Features (PRD-aligned)

| Feature | Priority | Backend today |
|---------|----------|---------------|
| Dashboard home (welcome, membership status, quick actions) | P0 | Partial (compose from new portal APIs) |
| My profile view/edit | P0 | User fields exist; need portal GET/PATCH + CRM link |
| My membership + digital card | P0 | Memberships exist; need “mine” query via `user_account_id` |
| Buy tickets (link, not home) | P0 | Public purchase OK |
| My tickets | P1 | Need optional `purchased_by` / match email-phone |
| My visit history | P1 | VisitLog exists; need scoped API |
| My group bookings | P1 | Match organiser email to user |
| Notifications | P2 | Stub service only — defer |
| Saved artifacts | P2 | Not in Module 8 PRD — defer |
| AI Assistant (visitor Q&A) | P2 | Staff AI exists — optional later |
| Membership self-renewal payment | P2 | Staff renew exists — defer live pay |

---

## 5. Files That Need Modification

### Frontend (modify)
- `src/App.jsx` — portal routes, role layouts
- `src/utils/constants.js` — `ROLE_REDIRECTS`, staff nav rename, visitor nav
- `src/hooks/useAuth.js` — post-login / post-register redirects
- `src/components/layout/PrivateRoute.jsx` — role-aware layout/redirect
- `src/components/layout/Sidebar.jsx` — staff-only; rename section
- `src/pages/auth/LoginPage.jsx` — visitor vs staff entry clarity
- `src/pages/auth/ChangePasswordPage.jsx` — role-aware shell
- `src/pages/auth/SetPasswordPage.jsx` — role-aware redirect
- `src/pages/visitor/VisitorRegistrationPage.jsx` (+ success) — → portal
- `src/pages/landing/components/LandingNav.jsx` / `landingData.js` — portal links
- `src/api/axios.js` — portal public-path handling if needed

### Frontend (create)
- `src/components/layout/VisitorLayout.jsx`
- `src/pages/portal/VisitorDashboardPage.jsx`
- `src/pages/portal/PortalProfilePage.jsx`
- `src/pages/portal/PortalMembershipPage.jsx`
- `src/pages/portal/PortalTicketsPage.jsx`
- `src/pages/portal/PortalVisitsPage.jsx`
- `src/pages/portal/PortalBookingsPage.jsx`
- `src/api/portalApi.js`
- Optional: `src/components/layout/VisitorNav.jsx`

### Backend (modify)
- `src/config/rbacCatalog.js` — add portal self-service permissions for `visitor`
- `src/controllers/authController.js` — link/create CRM Visitor on register; richer `/me`; fix login copy
- `src/services/rbacService.js` — include profile fields in `toPublicUser` (safe subset)
- `src/routes/index.js` — mount `/portal` routes
- Migration for portal permissions + ticket `purchased_by` (optional, additive)

### Backend (create)
- `src/controllers/portalController.js` — me, memberships, visits, tickets, bookings
- `src/routes/portalRoutes.js` — auth + portal permissions, always scoped to `req.user`
- Migration `add-portal-permissions` (+ optional `tickets.purchased_by_user_id`)

### Do NOT remove
- Staff Module 8 controllers/routes/pages  
- Public purchase / feedback / group-booking submit  

---

## 6. Target Architecture (after fix)

```
Public
  /  /register  /login  /tickets  /feedback  /book-group-visit  /artifact/:code

Visitor (role=visitor) → VisitorLayout → /portal/*
  Dashboard | Profile | Membership | Tickets | Visits | Bookings | Account

Staff (curator, conservation, maintenance, researcher)
  → PrivateLayout → role home (/dashboard or /artifacts)
  + Visitor Relations CRM if permissions allow

Admin
  → PrivateLayout → /dashboard (executive)
  + Access control + full CRM
```

**Redirect rules (role-driven, not hardcoded paths in many places):**
- Single map in `ROLE_REDIRECTS` / `getHomePath(user)`
- visitor → `/portal`
- admin/curator/conservation/maintenance → `/dashboard`
- researcher → `/artifacts`

---

## 7. Implementation Order (incremental)

1. Backend: portal permissions + User↔Visitor link + `/api/portal/*`  
2. Frontend: `VisitorLayout` + Dashboard + redirects  
3. Portal pages (profile, membership, tickets, visits, bookings)  
4. Remove visitor from staff-shell password flows; rename staff nav  
5. Landing / login entry points for Visitor Portal  

---

*Audit only until implementation begins in the next step.*
