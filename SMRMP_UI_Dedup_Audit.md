# UI/UX & Deduplication Audit — SMRMP Frontend

**Date:** July 2026  
**Status:** Audit complete → refactor implemented (July 2026)  
**Scope:** Frontend primary; backend only where FE duplicates imply API misuse

---

## 1. Duplicate Implementation Audit (summary)

| Area | Finding |
|------|---------|
| Pages | Orphan admin user pages; ticket “view” wrongly uses verify page; membership card OK (two entry points, one component) |
| Components | Repeated public shells; repeated portal headers; dual verify UIs; dual visitor registration field sets |
| Routes | `/tickets/buy` alias; missing `/memberships/verify/:code`; `/public/artifacts/:id` → staff artifacts |
| Navigation | Visitor nav has Tickets **and** Buy Tickets; landing Verify Ticket ×3; landing “Visitor Portal” ≠ `/portal` |
| Layouts | 6+ reimplemented dark/parchment shells outside `VisitorLayout` / `PrivateLayout` |
| API/hooks | `userApi` (mock) vs `rbacApi`; portal vs staff APIs are **correctly separate** |
| Dead code | `AdminUsersPage`, `AdminAccessPage` unrouted; `?portal=1` unused |

---

## 2. Duplicated Components

| Component / pattern | Locations | Action |
|---------------------|-----------|--------|
| Public dark header + parchment body | TicketPurchase, FeedbackForm, PublicGroupBooking, MembershipCard, TicketVerification, MembershipVerify | → `PublicSiteShell` |
| Auth site-shell + LandingNav | Login, SetPassword, Register, RegistrationSuccess | → `PublicAuthShell` |
| Portal page header (icon + title) | All `pages/portal/*` | → `PortalPageHeader` |
| Gate verify UI | TicketVerificationPage, MembershipVerifyPage | → shared `GateVerifyLayout` (keep APIs separate) |
| DigitalMembershipCard | Portal, Card page, IssueMembership | Keep single component |
| Visitor profile fields | RegistrationForm, RegisterVisitorModal, PortalProfile | Shared field block (light) |
| DigitalTicket vs portal ticket cards | tickets + portal | Portal uses DigitalTicket for view |

---

## 3. Duplicated Pages

| Page A | Page B | Action |
|--------|--------|--------|
| `AdminUsersPage.jsx` | `UsersPage.jsx` | **Delete** AdminUsersPage |
| `AdminAccessPage.jsx` | `/admin` redirect | **Delete** unused hub |
| Portal “View pass” → TicketVerificationPage | Gate verify | **New** read-only pass view; stop linking to verify |
| MembershipCardPage | PortalMembershipPage | Keep both; share card component |
| TicketVerification vs MembershipVerify | — | Extract shared shell |

---

## 4. Duplicated Routes

| Route | Issue | Action |
|-------|-------|--------|
| `/tickets/buy` → `/tickets` | Redundant | Keep redirect for bookmarks |
| `/tickets/verify/:code` used as “view pass” | Consumes ticket | Add `/portal/tickets/:id` or pass modal; don’t verify |
| `/memberships/verify` (no `:code`) | Param unused | Add `/memberships/verify/:code` |
| `/public/artifacts/:id` → `/artifacts` | Wrong for public | → landing or remove |
| `/register?portal=1` | Query unused | Fix CTA; drop query |

---

## 5. UI Inconsistencies

- Staff: light parchment + sidebar  
- Landing/auth: dark brown `site-shell`  
- Portal: dark gold header + parchment  
- Public visitor ops: yet another dark header variant  
- Buttons: `Button` vs raw gold uppercase vs ad-hoc greens  
- Cards: `Card` vs copy-pasted `rounded-3xl` borders  
- Hardcoded hex vs `smrmp-*` tokens  
- Portal pages missing consistent `PageHeader` / empty/loading patterns  

---

## 6. Refactoring Plan (ordered)

1. Fix critical ticket view vs verify  
2. Clean visitor nav + dashboard quick links + landing nav/CTA  
3. Delete orphan admin pages  
4. Extract `PublicAuthShell`, `PublicSiteShell`, `PortalPageHeader`  
5. Portal route layout (single VisitorLayout) + premium portal UI pass  
6. Shared gate verify shell; membership verify `:code` route  
7. Gate mock/DEMO messaging; fix public artifacts redirect  
8. Verify build  

**Out of scope this pass:** New features, backend redesign, exhibition mock rewrite.

---

## 7. Post-refactor summary

### Files removed
- `smrmp-frontend/src/pages/admin/AdminUsersPage.jsx`
- `smrmp-frontend/src/pages/admin/AdminAccessPage.jsx`

### Components merged / added
- `PublicAuthShell` — login, set-password, register, registration success
- `PublicSiteShell` — tickets, feedback, group booking, gate verify, membership verify/card
- `PortalPageHeader` — all portal list/detail pages
- `VisitorLayout` — single portal chrome via `<Outlet />`
- `PortalTicketPassPage` — read-only pass (does not call verify)

### Routes cleaned
- `/portal/*` nested under one `VisitorLayout`
- `/portal/tickets/pass/:code` for digital pass view
- `/memberships/verify/:code` added
- `/public/artifacts/:id` → `/` (was wrongly staff artifacts)
- Visitor nav: Buy Tickets / Feedback removed (CTAs only)

### Critical fix
- Portal “View pass” no longer hits `/tickets/verify/:code` (which consumes the ticket)

### Remaining recommendations
- Consolidate `userApi.js` mock layer vs `rbacApi` when staff users module is next refactored
- Extract shared `GateVerifyPanel` body from ticket vs membership verify pages
- Share visitor profile field block across register / staff CRM / portal profile
- Code-split large Vite bundle; gate verify behind staff auth if product requires it
