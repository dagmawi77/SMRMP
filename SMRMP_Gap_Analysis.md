# SMRMP Gap Analysis — Proposal vs Current Codebase

**Document type:** Feature gap inventory & safe implementation plan  
**Source:** `SMRMP_Proposal.md` vs `smrmp-backend` + `smrmp-frontend`  
**Date:** July 2026  
**Status:** Analysis only — no implementation in this document

---

## Verdict

The system already covers a solid **hackathon MVP** (auth/RBAC, artifacts + QR/images, conservation logs, dashboard, AI helpers, sandbox ticketing, visitor QR page). A large share of the proposal’s **pilot modules, deep workflows, live integrations, and Phase 2/3 capabilities** are still missing or only partially present (especially exhibitions on the frontend, which are mock-only).

---

## Table of Contents

1. [What Is Already Implemented (Baseline)](#1-what-is-already-implemented-baseline)
2. [Not Implemented / Incomplete — By Proposal Module](#2-not-implemented--incomplete--by-proposal-module)
3. [Frontend vs Backend Gap Matrix](#3-frontend-vs-backend-gap-matrix)
4. [Importance Ranking](#4-importance-ranking)
5. [Safe Implementation Plan](#5-safe-implementation-plan)
6. [Guardrails (Do Not Break Existing System)](#6-guardrails-do-not-break-existing-system)
7. [Suggested First Build Slice](#7-suggested-first-build-slice)

---

## 1. What Is Already Implemented (Baseline)

| Area | Backend | Frontend |
|------|---------|----------|
| Auth + RBAC (roles/permissions) | Yes | Yes |
| Artifact CRUD, images, QR lookup | Yes | Yes |
| Conservation condition logs | Yes | Yes (on artifact detail only) |
| Dashboard stats/charts | Yes | Yes |
| AI describe / search / report / Q&A | Yes | Yes |
| Ticketing + sandbox Telebirr | Yes (simulated) | Yes (with mock fallback) |
| Public QR artifact page | Yes | Yes (incl. audio player) |
| Staff users / roles admin | Yes | Yes (users page has mock fallback) |
| Audit log **writes** | Yes | No viewer UI |
| Exhibitions CRUD + artifact link | Yes (API) | **Mock UI only — not wired** |

### Roles present in the system

`admin`, `curator`, `conservation`, `maintenance`, `researcher`, `visitor`

---

## 2. Not Implemented / Incomplete — By Proposal Module

---

### Module 1 — Artifact Management (Priority) — Partial

#### 1. Full location & movement / custody history

| | |
|---|---|
| **Status** | Only a current `location` field + a UI that updates location. No movement history table, no custody chain. |
| **Importance** | **Critical for pilot.** Proposal’s core problem is “no reliable way to trace an artifact’s current location or full custody history.” Without this, the catalog is a static register, not an operations system. |
| **Missing** | Backend movement/loan events; frontend history timeline that persists; transfer approvals. |
| **Backend** | Not implemented |
| **Frontend** | Thin UI only (updates location; no real history) |

#### 2. Loan records (real workflow)

| | |
|---|---|
| **Status** | Boolean `is_on_loan` only. No loan partners, dates, return tracking, or paperwork trail. |
| **Importance** | **High.** Loans are how museums move high-value items; without workflow, the flag is misleading and audit-weak. |
| **Missing** | Loan entity, status lifecycle, notifications on overdue return. |
| **Backend** | Flag only |
| **Frontend** | Flag only |

#### 3. Provenance history as a first-class record

| | |
|---|---|
| **Status** | Fields like origin/period/description exist; no structured provenance events (ownership/acquisition/transfer chain). |
| **Importance** | **High for heritage credibility.** Needed for research trust and institutional accountability. |
| **Missing** | Provenance events API + UI section on artifact profile. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 4. Audio narration (production-grade)

| | |
|---|---|
| **Status** | Frontend player exists; falls back to simulated progress / browser TTS. No dedicated TTS service or stored audio assets. |
| **Importance** | **Medium for visitor demo; High for visitor product.** Proposal lists audio as part of the QR visitor journey. |
| **Missing** | Audio generation/storage pipeline; language options (EN/Amharic). |
| **Backend** | Not implemented |
| **Frontend** | Player exists; production audio pipeline missing |

#### 5. Duplicate artifact detection (real AI)

| | |
|---|---|
| **Status** | Client-side similarity over loaded catalog — not a backend image/metadata ML service. |
| **Importance** | **Medium.** Helps data quality as the collection grows; less urgent while collection is small. |
| **Missing** | Backend compare endpoint; curator merge/keep decision trail. |
| **Backend** | Not implemented |
| **Frontend** | Client heuristic only |

---

### Module 2 — Exhibition Management (Priority) — Backend yes, frontend not real

#### 7. Wire exhibitions UI to real API

| | |
|---|---|
| **Status** | Backend CRUD + artifact allocation exists. Frontend exhibition module is **100% local mock** (`exhibitionData.js`). |
| **Importance** | **Critical.** Largest “looks done but isn’t” gap. Demo and pilot break if staff create exhibitions that disappear on refresh. |
| **Missing** | `exhibitionApi`, React Query hooks, replace mock state, keep existing tabs working against API. |
| **Backend** | Done |
| **Frontend** | Mock only |

#### 8. Post-exhibition performance analysis (real data)

| | |
|---|---|
| **Status** | Mock analytics charts in exhibition UI. Ticket/visitor data exists separately but is not linked to exhibitions for performance. |
| **Importance** | **High for leadership value** (Module 9 + Module 2). Without attendance/engagement tied to exhibitions, “performance analysis” is cosmetic. |
| **Missing** | Link tickets/visits to exhibition; real charts from DB. |
| **Backend** | Partial / not linked |
| **Frontend** | Mock charts |

#### 9. Historical exhibition archive & calendar (persisted)

| | |
|---|---|
| **Status** | UI concepts exist in mock; not durable. |
| **Importance** | **Medium–High.** Needed once exhibitions are real. |
| **Missing** | Persisted archive views and calendar backed by API. |
| **Backend** | Partial (CRUD exists; archive UX not specialized) |
| **Frontend** | Mock only |

---

### Module 3 — Conservation Management (Priority) — MVP only

#### 10. Restoration project management

| | |
|---|---|
| **Status** | Logs can flag `requires_restoration` and notes. No project entity (phases, budget, assignee, status, completion). |
| **Importance** | **Critical for conservation team.** Proposal treats restoration as managed work, not a checkbox. |
| **Missing** | Restoration projects CRUD; link to artifact + conservation logs; status board UI. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 11. Inspection scheduling & reminders

| | |
|---|---|
| **Status** | `next_inspection_date` stored; no scheduler, reminders, or overdue queue. |
| **Importance** | **Critical.** Missed inspections are exactly the operational failure the proposal calls out. |
| **Missing** | Due/overdue list; notification triggers; calendar view for conservation role. |
| **Backend** | Field only |
| **Frontend** | Not implemented |

#### 12. Damage reporting workflow (with approvals)

| | |
|---|---|
| **Status** | Condition can be logged; no formal damage ticket → review → sign-off trail. |
| **Importance** | **High.** Security & governance require digital approval trails for conservation sign-off. |
| **Missing** | Damage report workflow states; approver role; audit of decisions. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 13. Environmental condition logging

| | |
|---|---|
| **Status** | Not implemented (manual entry planned initially). |
| **Importance** | **High for Phase 2 pilot; Medium for MVP.** Foundation for predictive conservation later. |
| **Missing** | Env log model (temp/humidity/light); artifact/gallery association; charts. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 14. Standalone Conservation workspace (frontend)

| | |
|---|---|
| **Status** | Only embedded on artifact detail. Conservation role has no dedicated module nav experience. |
| **Importance** | **High for role UX.** Conservation staff should not hunt per-artifact pages for daily work. |
| **Missing** | `/conservation` hub: due inspections, open restorations, recent damage reports. |
| **Backend** | Logs API exists |
| **Frontend** | No dedicated module |

#### 15. Predictive Conservation Intelligence (AI)

| | |
|---|---|
| **Status** | Not implemented. |
| **Importance** | **Medium (after data exists).** Useless without history + env data; high value once logs accumulate. |
| **Missing** | Risk-scoring service; human confirm-before-schedule UX. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

---

### Module 4 — Inventory Management (Phase 2) — Not implemented

#### 16. Equipment / ICT / exhibition supplies tracking

| | |
|---|---|
| **Status** | Not started. |
| **Importance** | **Medium–High for operations.** Separates “collection” from “ops resources.” |
| **Missing** | Entire inventory domain (items, stock levels, barcodes, locations). |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 17. Barcode-based stock + procurement records

| | |
|---|---|
| **Status** | Not started. |
| **Importance** | **Medium.** Procurement trail supports accountability and budget decisions. |
| **Missing** | Stock movements, purchase orders, suppliers (keep thin initially). |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

---


### Module 6 — Maintenance Management (Phase 2) — Role only

#### 19. Work orders & preventive maintenance

| | |
|---|---|
| **Status** | `maintenance` role exists with limited ticket/dashboard perms. No work-order entity. |
| **Importance** | **High for facilities reality; Medium for collection MVP.** Proposal lists lighting/climate/security/display cases. |
| **Missing** | Maintenance requests, assignment, SLA/status, preventive schedules, building-system categories. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

---

### Module 7 — Digital Archive Management (Phase 2) — Not implemented

#### 20. Documents, research papers, policies, versioned access

| | |
|---|---|
| **Status** | Not started. |
| **Importance** | **High for researchers & institutional memory.** Distinct from artifact images. |
| **Missing** | Archive assets, folders/tags, version control, permissioned download, researcher UX. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

---

### Module 8 — Visitor & Membership (Phase 3 / partial MVP) — Partial

#### 21. Live payment rails (Telebirr production)

| | |
|---|---|
| **Status** | Sandbox simulator only; Chapa accepted as label, same stub. |
| **Importance** | **Critical before real visitor revenue.** Fine for demo; unsafe for pilot money. |
| **Missing** | Real gateway integration, webhooks, reconciliation, failure/refund paths, daily reconcile reports. |
| **Backend** | Stub / sandbox |
| **Frontend** | Sandbox Telebirr UI |

#### 22. Membership / VIP / school & group bookings

| | |
|---|---|
| **Status** | Ticket types include VIP/group labels; no memberships or group booking workflows. |
| **Importance** | **Medium–High for visitor ops** once ticketing is live. |
| **Missing** | Memberships, school bookings, capacity management. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 23. Visitor feedback collection & analysis

| | |
|---|---|
| **Status** | Not started. |
| **Importance** | **Medium.** Feeds exhibition performance and CX improvements. |
| **Missing** | Feedback forms, aggregation, dashboard widgets. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 24. Donations & event registration payments

| | |
|---|---|
| **Status** | Not started. |
| **Importance** | **Low–Medium** until core ticketing is production-ready. |
| **Missing** | Donation flows, event registration, payment linkage. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

---

### Module 9 — Executive Dashboard (Priority) — Partial

#### 25. Full executive KPIs from live ops

| | |
|---|---|
| **Status** | Artifact counts, exhibitions, conservation alerts, visitor/ticket trends exist at MVP level. |
| **Importance** | **Critical for admin buy-in.** Proposal’s decision-making problem is “no consolidated analytics.” |
| **Missing / thin** | Revenue realism, restoration case backlog, maintenance backlog, inventory status, conservation risk heat, exhibition performance. |
| **Backend** | Partial |
| **Frontend** | Partial |

#### 26. Automated recurring reports (non-chat)

| | |
|---|---|
| **Status** | On-demand AI report drafts only; no scheduled daily/monthly delivery or PDF/export. |
| **Importance** | **High.** “Automates recurring reports instead of compiling by hand” is a stated platform promise. |
| **Missing** | Scheduled jobs; export (PDF/CSV); manager sign-off trail; distribution. |
| **Backend** | AI on-demand only |
| **Frontend** | AI modal only |

---

### Cross-cutting gaps (Security, AI, Platform)

#### 27. Audit log viewer + digital approval trails

| | |
|---|---|
| **Status** | Writes happen; no list/query API or UI. Approval workflows largely absent. |
| **Importance** | **Critical for governance** at a national heritage site. |
| **Missing** | `/audit-logs` API; filtered UI; conservation/report approval records. |
| **Backend** | Write-only |
| **Frontend** | Missing |

#### 28. MFA for admin roles

| | |
|---|---|
| **Status** | Not implemented (password policy / forced change exists). |
| **Importance** | **High for production admin accounts.** |
| **Missing** | Optional/required MFA for admin (and optionally other privileged roles). |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 29. Notifications (email / SMS / in-app)

| | |
|---|---|
| **Status** | Stub service, unused. |
| **Importance** | **Critical for inspections, maintenance, payment receipts, approvals.** Without this, scheduled work silently fails. |
| **Missing** | Delivery channels; in-app notification center; event triggers. |
| **Backend** | Stub only |
| **Frontend** | Missing |

#### 30. Backup / RPO-RTO & data residency policy tooling

| | |
|---|---|
| **Status** | Operational/docs concern more than product feature; not visible in app. |
| **Importance** | **High before production hosting choice.** |
| **Missing** | Documented backup policy, recovery objectives, residency decisions. |
| **Backend** | Ops concern |
| **Frontend** | N/A |

#### 31. Multi-tenant / multi-museum architecture

| | |
|---|---|
| **Status** | Unused `museum_id` on users only. |
| **Importance** | **Low now; Critical for Phase 3.** Do not force into MVP schema changes that break single-museum pilot. |
| **Missing** | Museum entity; scoped queries; onboarding for additional institutions. |
| **Backend** | Field stub |
| **Frontend** | Missing |

#### 32. Mobile app (Flutter) + offline

| | |
|---|---|
| **Status** | Not started (proposal Phase 3). |
| **Importance** | **Medium later** for low-connectivity museum sites. |
| **Missing** | Staff/visitor mobile apps; offline-capable core workflows. |
| **Backend** | N/A / sync APIs later |
| **Frontend** | Not implemented |

#### 33. IoT sensors

| | |
|---|---|
| **Status** | Explicit future phase. |
| **Importance** | **Low until env logging + pilot value proven.** |
| **Missing** | Sensor ingest, alerts, conservation integration. |
| **Backend** | Not implemented |
| **Frontend** | Not implemented |

#### 34. Institutional SSO

| | |
|---|---|
| **Status** | Button present, explicitly unavailable. |
| **Importance** | **Low–Medium** for pilot institutions with IdP. |
| **Missing** | Real SSO/IdP integration. |
| **Backend** | Not implemented |
| **Frontend** | Placeholder only |

#### 35. Researcher read-only archive experience

| | |
|---|---|
| **Status** | Role exists; no dedicated archive product surface. |
| **Importance** | **Medium** once Module 7 exists. |
| **Missing** | Researcher portal for approved archives/docs. |
| **Backend** | Depends on Module 7 |
| **Frontend** | Missing |

#### 36. Human checkpoint / AI labeling consistency

| | |
|---|---|
| **Status** | Partially present (AI draft labels). No formal “approve AI description into official record” workflow with version history. |
| **Importance** | **High** to match proposal’s “AI is assistive, human approves” principle. |
| **Missing** | Approve/reject AI draft; version history; clear AI vs official labeling. |
| **Backend** | Partial |
| **Frontend** | Partial |

---

## 3. Frontend vs Backend Gap Matrix

| Feature | Backend | Frontend | Gap type |
|---------|---------|----------|----------|
| Exhibitions real data | Done | Mock | **Wire FE** |
| Conservation hub / projects / schedules | Missing | Missing | **Both** |
| Movement / custody history | Missing | Thin UI | **Both** |
| Loan workflow | Flag only | Flag only | **Both** |
| Inventory | Missing | Missing | **Both** |
| Maintenance work orders | Missing | Missing | **Both** |
| Staff/volunteer HR | Missing | Missing | **Both** |
| Digital archive | Missing | Missing | **Both** |
| Memberships / feedback | Missing | Missing | **Both** |
| Live payments + webhooks | Stub | Sandbox UI | **Both** |
| Audit log browse | Write-only | Missing | **Both** |
| Notifications | Stub | Missing | **Both** |
| Scheduled/export reports | AI on-demand | AI modal | **Both** |
| Predictive conservation AI | Missing | Missing | **Both** |
| Duplicate AI (server) | Missing | Client heuristic | **Both** |
| Env logging / IoT | Missing | Missing | **Both** (IoT later) |
| Multi-tenant | Field stub | Missing | **Later** |
| Mobile / offline | Missing | Missing | **Later** |

---

## 4. Importance Ranking

### P0 — Must close to match Priority Modules 1–3 + honest MVP/pilot

1. Wire exhibitions frontend → backend  
2. Movement / custody history  
3. Conservation hub + inspection due/overdue + reminders  
4. Restoration project management  
5. Notifications (at least email/in-app for inspection & approvals)  
6. Audit log API + admin viewer  
7. AI description human-approval into official record  

### P1 — Needed for real museum pilot (Months 1–6)

8. Damage report + digital approval trail  
9. Environmental manual logging  
10. Live Telebirr/Chapa + reconciliation  
11. Maintenance work orders  
12. Executive dashboard expansion (revenue, backlog, restoration cases)  
13. Scheduled/export reports with manager sign-off  
14. Loan workflow  
15. MFA for admins  

### P2 — Expand institutional coverage

16. Inventory + barcode/procurement  
17. Digital archive + researcher access  
18. Staff/volunteer scheduling  
19. Memberships, group bookings, feedback  
20. Server-side duplicate detection  
21. Predictive conservation AI  

### P3 — Scale / hardware / national platform

22. Multi-tenant museums  
23. RFID  
24. IoT sensors  
25. Flutter mobile + offline  
26. AR/VR (proposal exploration only)

---

## 5. Safe Implementation Plan

**Principle:** Additive modules, feature flags, no big-bang rewrites. Keep current APIs and UIs working; extend schema carefully; wire mock UIs to real APIs behind the same screens.

---

### Phase 0 — Stabilize current MVP (1–2 weeks)

**Goal:** Make what you already have trustworthy.

- Remove or gate mock fallbacks for tickets/users in production builds (keep for local demo via env flag).
- Fix known mismatches (exhibition status enums / field naming) **behind compatibility mapping**, not by breaking clients.
- Add integration tests for exhibition API ↔ future FE contract.
- Document “AI draft vs official description” rules for curators.
- **Do not** introduce multi-tenant yet.

---

### Phase 1 — Complete Priority Modules 1–3 (4–8 weeks)

**Order that minimizes breakage:**

1. **Exhibitions FE ↔ BE**
   - Add API client only; swap mock store for React Query.
   - Keep same routes/tabs so UX doesn’t change overnight.
   - Feature flag: `VITE_EXHIBITIONS_API=true`.

2. **Artifact movement history**
   - New table `artifact_movements` (+ API).
   - Location update endpoint writes a movement row (backward compatible: still update `artifacts.location`).
   - Replace “location transfer” UI to show real history.

3. **Conservation workspace**
   - New routes/pages; reuse existing conservation log API.
   - Add restoration_projects + inspection reminder job later.
   - Do not remove per-artifact conservation timeline.

4. **Approvals + audit read API**
   - Read-only audit endpoints first (safe).
   - Then add approval fields to conservation/restoration without changing create-log MVP path.

5. **Notifications stub → real channel**
   - Keep interface of `notificationService`; swap implementation.
   - Trigger only on new events (inspection due, restoration status) so existing flows stay intact.

---

### Phase 2 — Pilot hardening (Months 2–4)

- Live payments with webhook route; keep sandbox path via `PAYMENT_MODE=sandbox|live`.
- Maintenance module as **new** permission module (don’t overload tickets).
- Inventory as new module (separate from artifacts — avoid polluting artifact schema).
- Env logging manual entry → feeds dashboard widgets.
- MFA optional for admin.
- Report export + scheduled jobs (cron/worker), separate from AI chat.

---

### Phase 3 — Institutional depth (Months 4–6+)

- Archive, staff/volunteer, memberships/feedback.
- Predictive conservation only after enough logs exist.
- Loan workflow extending movement history (not a separate parallel location system).

---

### Phase 4 — National / hardware (Months 6–18)

- Multi-tenant (`museums` table; scope all queries by `museum_id` with default museum for Adwa).
- Mobile offline, RFID, IoT — only after pilot KPIs prove software value.

---

## 6. Guardrails (Do Not Break Existing System)

| Guardrail | Why |
|-----------|-----|
| Additive migrations only; avoid renaming live columns without aliases | FE/BE already depend on current field names |
| Feature flags for new modules | Roll out per role (e.g. conservation hub) without forcing all users |
| Keep sandbox payments until webhook + reconcile tested | Avoid corrupting ticket status in demo/prod mix |
| Don’t merge inventory into artifacts table | Different lifecycle and permissions |
| Don’t enable multi-tenant filtering until all entities have `museum_id` | Partial tenancy silently breaks queries |
| Preserve AI “draft” labels until approval workflow ships | Matches proposal human-checkpoint promise |
| Wire exhibitions before building new exhibition features | Stops fake-data UX debt from growing |

---

## 7. Suggested First Build Slice

Start with **one vertical slice** that unlocks the most proposal value with least risk:

1. **Exhibitions API wiring (frontend)**  
2. **Artifact movement history (backend + detail UI)**  
3. **Conservation hub + overdue inspections (both)**  

Those three close the biggest Priority Module gaps without touching payments, multi-tenant, or hardware.

---

## Appendix A — Full gap checklist (quick scan)

| # | Feature | Importance | Backend | Frontend |
|---|---------|------------|---------|----------|
| 1 | Location & movement / custody history | Critical | Missing | Thin |
| 2 | Loan workflow | High | Flag only | Flag only |
| 3 | Provenance history | High | Missing | Missing |
| 4 | Production audio narration | Medium→High | Missing | Partial |
| 5 | Duplicate detection (AI/server) | Medium | Missing | Client only |
| 6 | RFID | Low (later) | Missing | Missing |
| 7 | Exhibitions FE ↔ BE wiring | Critical | Done | Mock |
| 8 | Exhibition performance analytics (real) | High | Partial | Mock |
| 9 | Exhibition archive & calendar (persisted) | Medium–High | Partial | Mock |
| 10 | Restoration project management | Critical | Missing | Missing |
| 11 | Inspection scheduling & reminders | Critical | Field only | Missing |
| 12 | Damage reporting + approvals | High | Missing | Missing |
| 13 | Environmental condition logging | High (pilot) | Missing | Missing |
| 14 | Conservation standalone workspace | High | Partial | Missing |
| 15 | Predictive conservation AI | Medium | Missing | Missing |
| 16 | Inventory / equipment tracking | Medium–High | Missing | Missing |
| 17 | Barcode stock + procurement | Medium | Missing | Missing |
| 18 | Staff/volunteer HR ops | Medium | Missing | Missing |
| 19 | Maintenance work orders | High (ops) | Missing | Missing |
| 20 | Digital archive | High | Missing | Missing |
| 21 | Live Telebirr/Chapa payments | Critical (pilot $) | Stub | Sandbox |
| 22 | Memberships / group bookings | Medium–High | Missing | Missing |
| 23 | Visitor feedback | Medium | Missing | Missing |
| 24 | Donations / event payments | Low–Medium | Missing | Missing |
| 25 | Full executive KPIs | Critical | Partial | Partial |
| 26 | Scheduled/export reports | High | Partial | Partial |
| 27 | Audit log viewer + approval trails | Critical | Write-only | Missing |
| 28 | MFA for admins | High | Missing | Missing |
| 29 | Notifications | Critical | Stub | Missing |
| 30 | Backup / residency governance | High (ops) | Ops | N/A |
| 31 | Multi-tenant museums | Later / Critical P3 | Stub | Missing |
| 32 | Mobile + offline | Later | Missing | Missing |
| 33 | IoT sensors | Later | Missing | Missing |
| 34 | Institutional SSO | Low–Medium | Missing | Placeholder |
| 35 | Researcher archive UX | Medium | Missing | Missing |
| 36 | AI human-approval workflow | High | Partial | Partial |

---

## Appendix B — Mapping to proposal roadmap phases

| Proposal phase | Focus | Gap items primarily covered |
|----------------|-------|-----------------------------|
| Phase 1 — Hackathon MVP | Already largely built | Stabilize mocks, wire exhibitions |
| Phase 2 — Single-museum pilot (Months 1–6) | Modules 1–3 harden; inventory; maintenance; staff; live payments; QR rollout | Items 1–5, 7–14, 16–21, 25–29, 36 |
| Phase 3 — Multi-institution (Months 6–18) | Multi-tenant; mobile; RFID; IoT; national network | Items 6, 22–24, 31–35 |

---

**Smart Museum Resource Management Platform — Gap Analysis**  
Reference deployment: Adwa Victory Memorial Museum, Ethiopia  
Related document: `SMRMP_Proposal.md`
