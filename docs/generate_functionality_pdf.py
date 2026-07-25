#!/usr/bin/env python3
"""Generate SMRMP System Functionality & PRD PDF."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    ListFlowable,
    ListItem,
)

OUT = Path(__file__).resolve().parent / "SMRMP_System_Functionality_PRD.pdf"
PAGE = A4
MARGIN = 1.8 * cm

# Brand colors (museum / heritage — deep teal + warm accent)
NAVY = colors.HexColor("#0B3D4A")
TEAL = colors.HexColor("#1A6B7A")
ACCENT = colors.HexColor("#C4A35A")
LIGHT = colors.HexColor("#F4F7F8")
BORDER = colors.HexColor("#D0DCE0")
TEXT = colors.HexColor("#1A2A30")
MUTED = colors.HexColor("#5A6F76")


def styles():
    base = getSampleStyleSheet()
    s = {
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=32,
            textColor=NAVY,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            leading=16,
            textColor=TEAL,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=NAVY,
            spaceBefore=16,
            spaceAfter=8,
            borderPadding=3,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=TEAL,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=NAVY,
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=TEXT,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=TEXT,
            leftIndent=8,
            spaceAfter=2,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=TEXT,
        ),
        "table_head": ParagraphStyle(
            "table_head",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=11,
            textColor=colors.white,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
        "toc": ParagraphStyle(
            "toc",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=16,
            textColor=TEXT,
            leftIndent=10,
        ),
        "note": ParagraphStyle(
            "note",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=11,
            textColor=MUTED,
            spaceAfter=8,
        ),
    }
    return s


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.5)
    canvas.line(MARGIN, PAGE[1] - 1.2 * cm, PAGE[0] - MARGIN, PAGE[1] - 1.2 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, PAGE[1] - 1.0 * cm, "SMRMP — System Functionality & PRD")
    canvas.drawRightString(PAGE[0] - MARGIN, PAGE[1] - 1.0 * cm, "Confidential")
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 1.2 * cm, PAGE[0] - MARGIN, 1.2 * cm)
    canvas.drawCentredString(PAGE[0] / 2, 0.7 * cm, f"Page {doc.page}")
    canvas.restoreState()


def cover_header_footer(canvas, doc):
    canvas.saveState()
    # Top band
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE[1] - 3.2 * cm, PAGE[0], 3.2 * cm, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, PAGE[1] - 3.4 * cm, PAGE[0], 0.2 * cm, fill=1, stroke=0)
    # Bottom band
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE[0], 2.2 * cm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(
        PAGE[0] / 2, 1.0 * cm, "Adwa Victory Memorial Museum  ·  Ethiopia  ·  July 2026"
    )
    canvas.restoreState()


def tbl(data, col_widths, s):
    """Build a styled table; wrap cell text as Paragraphs."""
    head_style = s["table_head"]
    cell_style = s["table_cell"]
    wrapped = []
    for i, row in enumerate(data):
        style = head_style if i == 0 else cell_style
        wrapped.append([Paragraph(str(c), style) for c in row])
    t = Table(wrapped, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


def bullets(items, s):
    return ListFlowable(
        [ListItem(Paragraph(i, s["bullet"]), leftIndent=12, bulletColor=TEAL) for i in items],
        bulletType="bullet",
        start="•",
        leftIndent=15,
        bulletFontSize=8,
    )


def build():
    s = styles()
    story = []

    # ── COVER ──
    story.append(Spacer(1, 4.5 * cm))
    story.append(Paragraph("SMART MUSEUM RESOURCE<br/>MANAGEMENT PLATFORM", s["cover_title"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("SMRMP", s["cover_sub"]))
    story.append(Spacer(1, 0.6 * cm))
    story.append(
        Paragraph(
            "<b>Full System Functionality Document</b><br/>Product Requirements Document (PRD)",
            s["cover_sub"],
        )
    )
    story.append(Spacer(1, 1.2 * cm))
    meta = [
        ["Document Type", "System Functionality & Role-Based PRD"],
        ["Version", "2.0"],
        ["Status", "Active Development Reference"],
        ["Prepared", "July 2026"],
        ["Reference Site", "Adwa Victory Memorial Museum, Ethiopia"],
        ["Backend", "Node.js + Express.js + PostgreSQL"],
        ["Frontend", "React.js + Tailwind CSS"],
        ["AI Layer", "OpenAI API"],
    ]
    meta_tbl = Table(
        [[Paragraph(f"<b>{a}</b>", s["table_cell"]), Paragraph(b, s["table_cell"])] for a, b in meta],
        colWidths=[4.5 * cm, 9 * cm],
    )
    meta_tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.8, TEAL),
                ("INNERGRID", (0, 0), (-1, -1), 0.3, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(meta_tbl)
    story.append(Spacer(1, 1.5 * cm))
    story.append(
        Paragraph(
            "ARTIFACT INTELLIGENCE  ·  CONSERVATION  ·  DIGITAL VISITOR EXPERIENCE  ·  HERITAGE ANALYTICS",
            s["cover_meta"],
        )
    )
    story.append(PageBreak())

    # ── TOC ──
    story.append(Paragraph("1. Table of Contents", s["h1"]))
    toc_items = [
        "1. Table of Contents",
        "2. Executive Summary",
        "3. System Purpose & Scope",
        "4. Technology Architecture",
        "5. User Roles & Access Control (RBAC)",
        "6. Module Functionality (Full Catalog)",
        "7. Key Business Workflows",
        "8. Artificial Intelligence Capabilities",
        "9. Payments, QR & Integrations",
        "10. REST API Reference",
        "11. Security & Data Governance",
        "12. Implementation Roadmap",
        "13. Success Criteria & KPIs",
    ]
    for item in toc_items:
        story.append(Paragraph(item, s["toc"]))
    story.append(PageBreak())

    # ── 2 EXEC SUMMARY ──
    story.append(Paragraph("2. Executive Summary", s["h1"]))
    story.append(
        Paragraph(
            "The <b>Smart Museum Resource Management Platform (SMRMP)</b> is an AI-assisted "
            "operations platform that digitizes museum artifact catalogs, conservation work, "
            "exhibition planning, visitor ticketing, and executive analytics. It is designed for "
            "institutions that still rely on paper ledgers and disconnected spreadsheets, with "
            "<b>Adwa Victory Memorial Museum (Ethiopia)</b> as the reference deployment.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "SMRMP acts as a <b>decision-support and record-of-truth system</b>. AI drafts "
            "descriptions, flags risk, and answers operational questions — but every AI output "
            "is intended for human curator or manager review before it becomes part of the "
            "official record.",
            s["body"],
        )
    )
    story.append(Paragraph("Core value delivered", s["h2"]))
    story.append(
        bullets(
            [
                "Complete digital identity for every artifact (metadata, images, QR code, history).",
                "Structured conservation logs tied to each artifact.",
                "Exhibition planning and artifact allocation.",
                "Digital ticketing with Telebirr / Chapa / cash (sandbox) and gate QR verification.",
                "Role-based staff access (admin, curator, conservation, maintenance, researcher, visitor).",
                "Live dashboards for collection, conservation, and visitor metrics.",
                "AI assistants for description drafting, smart search, reports, and Q&A.",
            ],
            s,
        )
    )

    # ── 3 PURPOSE ──
    story.append(Paragraph("3. System Purpose & Scope", s["h1"]))
    story.append(Paragraph("3.1 Problem addressed", s["h2"]))
    story.append(
        tbl(
            [
                ["Problem Area", "Challenge", "Impact"],
                [
                    "Artifact Management",
                    "Manual registration; incomplete docs; weak location/custody history",
                    "High",
                ],
                [
                    "Operations",
                    "Departmental silos; hand-compiled reports; lost maintenance requests",
                    "Medium",
                ],
                [
                    "Visitor Experience",
                    "Cash-heavy ticketing; limited self-guided digital context",
                    "Medium",
                ],
                [
                    "Decision-Making",
                    "No consolidated analytics; risks found only after damage or loss",
                    "High",
                ],
            ],
            [3.5 * cm, 9.5 * cm, 2 * cm],
            s,
        )
    )
    story.append(Paragraph("3.2 Objectives", s["h2"]))
    story.append(
        tbl(
            [
                ["Objective", "Success Looks Like"],
                [
                    "Digital Transformation",
                    "Paper workflows replaced by centralized, role-based digital records",
                ],
                [
                    "Artifact Preservation",
                    "Every artifact has searchable documentation and auditable condition history",
                ],
                [
                    "Operational Efficiency",
                    "Shared, trackable workflows for inventory, maintenance, and staff coordination",
                ],
                [
                    "Visitor Engagement",
                    "QR exploration and digital ticketing without counter-only dependence",
                ],
                [
                    "Intelligent Decisions",
                    "Live dashboard + AI-drafted reports as starting points for leadership review",
                ],
            ],
            [4 * cm, 11 * cm],
            s,
        )
    )
    story.append(Paragraph("3.3 In scope (implemented MVP)", s["h2"]))
    story.append(
        bullets(
            [
                "Authentication (Supabase Auth + app users table), password flows, forced staff password change",
                "Full RBAC with system & custom roles and permission matrix",
                "Artifact CRUD, Cloudinary images, QR identity, public QR lookup, audio narration UI",
                "Exhibition CRUD",
                "Conservation log CRUD",
                "Ticketing: types, purchase, verify, Telebirr/Chapa/cash sandbox",
                "Dashboard stats & charts",
                "AI: describe artifact, smart search, generate report, ask assistant",
                "Admin: users, roles, permissions",
                "Audit logging support",
            ],
            s,
        )
    )
    story.append(Paragraph("3.4 Out of scope / Phase 2–3", s["h2"]))
    story.append(
        bullets(
            [
                "Inventory / barcode stock management",
                "Staff & volunteer HR (attendance, leave, shifts)",
                "Facility maintenance work orders",
                "Full digital archive with version control",
                "Memberships, school/group bookings",
                "RFID hardware, IoT climate sensors, AR/VR tours",
                "Multi-museum national multi-tenant platform",
                "Remote Desktop Protocol (RDP) — <b>not part of SMRMP</b>; this system is a web museum platform, not remote desktop software",
            ],
            s,
        )
    )
    story.append(
        Paragraph(
            "Note: If “RDP” was intended to mean this Product Requirements Document (PRD), "
            "this PDF is that deliverable — full system functionality in PRD form.",
            s["note"],
        )
    )

    # ── 4 ARCHITECTURE ──
    story.append(Paragraph("4. Technology Architecture", s["h1"]))
    story.append(Paragraph("4.1 High-level layers", s["h2"]))
    story.append(
        Paragraph(
            "Visitors and staff use browsers (and mobile QR). The <b>React SPA</b> talks to a "
            "<b>Node.js / Express REST API</b>, which uses <b>PostgreSQL (Sequelize)</b>, "
            "<b>Supabase Auth</b>, <b>OpenAI</b>, <b>Cloudinary</b>, and <b>Telebirr/Chapa</b> sandboxes.",
            s["body"],
        )
    )
    story.append(
        tbl(
            [
                ["Layer", "Technology"],
                ["Frontend", "React 18, Vite, Tailwind CSS, React Router 6, Axios, TanStack Query, Zustand, Chart.js, html5-qrcode"],
                ["Backend", "Node.js, Express 4, Sequelize ORM, JWT, Multer, Helmet, Morgan, express-rate-limit, express-validator"],
                ["Database", "PostgreSQL (local or Supabase-hosted)"],
                ["Auth", "Supabase Auth + public.users with RBAC (roles / permissions)"],
                ["Media", "Cloudinary (artifact images)"],
                ["AI", "OpenAI API"],
                ["Payments", "Telebirr (sandbox), Chapa, cash (simulated)"],
                ["Identity codes", "QR via qrcode library (artifacts + tickets)"],
            ],
            [3.2 * cm, 11.8 * cm],
            s,
        )
    )
    story.append(Paragraph("4.2 Repository layout", s["h2"]))
    story.append(
        bullets(
            [
                "<b>smrmp-frontend/</b> — Vite React SPA (landing, auth, artifacts, exhibitions, tickets, admin, visitor, dashboard)",
                "<b>smrmp-backend/</b> — Express API, migrations, seeders, tests, services",
                "<b>docs/</b> — RBAC notes and this functionality PDF",
                "<b>README.md</b> — Role-Based PRD (development reference)",
                "<b>SMRMP_Proposal.md</b> — Concept & solution proposal",
            ],
            s,
        )
    )

    # ── 5 RBAC ──
    story.append(Paragraph("5. User Roles & Access Control (RBAC)", s["h1"]))
    story.append(
        Paragraph(
            "Access is permission-based (<font face='Courier'>requirePermission('artifacts.read')</font>), "
            "not hardcoded role lists. Login and <font face='Courier'>/auth/me</font> return "
            "<font face='Courier'>permissions[]</font> for frontend <font face='Courier'>can()</font> checks.",
            s["body"],
        )
    )
    story.append(Paragraph("5.1 System roles", s["h2"]))
    story.append(
        tbl(
            [
                ["Role", "Purpose", "Typical access"],
                ["admin", "Full system access", "All permissions (protected perms cannot be stripped)"],
                ["curator", "Catalog & exhibitions", "Artifacts/exhibitions/conservation write, tickets, dashboard, AI"],
                ["conservation", "Condition & restoration", "Artifacts read, conservation CRUD, tickets verify/list, dashboard"],
                ["maintenance", "Facilities / gate", "Tickets list/verify + dashboard"],
                ["researcher", "Read-only research", "artifacts.read only"],
                ["visitor", "Public account", "No staff permissions; public signup"],
            ],
            [2.8 * cm, 4 * cm, 8.2 * cm],
            s,
        )
    )
    story.append(Paragraph("5.2 Account creation paths", s["h2"]))
    story.append(
        tbl(
            [
                ["Path", "Who", "Resulting role"],
                ["POST /api/auth/register", "Public visitor signup", "Always visitor"],
                ["POST /api/users", "Admin (users.create)", "Staff role + temp password; must_change_password=true"],
            ],
            [4.5 * cm, 4.5 * cm, 6 * cm],
            s,
        )
    )
    story.append(Paragraph("5.3 Permission modules", s["h2"]))
    story.append(
        Paragraph(
            "Permission codes follow <font face='Courier'>module.action</font>: "
            "users.*, roles.*, artifacts.*, exhibitions.*, conservation.*, tickets.*, "
            "dashboard.read, ai.describe / ai.search / ai.report / ai.ask.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Admin UI: <font face='Courier'>/admin/users</font>, "
            "<font face='Courier'>/admin/roles</font>, "
            "<font face='Courier'>/admin/permissions</font>.",
            s["body"],
        )
    )
    story.append(PageBreak())

    # ── 6 MODULES ──
    story.append(Paragraph("6. Module Functionality (Full Catalog)", s["h1"]))

    modules = [
        (
            "6.1 Authentication & session",
            [
                "Register, login, logout, session profile (/me)",
                "Forgot password, change password, update password",
                "Forced password change for staff on first login",
                "Supabase-backed authentication integrated with app RBAC",
            ],
        ),
        (
            "6.2 User & role administration",
            [
                "Create staff accounts and assign roles",
                "Activate / deactivate users",
                "Create custom roles and edit permission matrix",
                "System roles cannot be deleted; admin protected permissions retained",
            ],
        ),
        (
            "6.3 Artifact management (Module 1 — Priority)",
            [
                "CRUD for artifacts: name, category, period, origin, material, description, location, condition",
                "Multi-image upload via Cloudinary",
                "Unique QR digital identity per artifact",
                "Public lookup by QR code (/artifact/:code) without staff login",
                "AI-drafted descriptions for curator review",
                "Duplicate detector UI, condition/location history UI, audio narration player",
                "Visitor flow: Scan QR → Artifact profile → History & provenance → Gallery → Audio",
            ],
        ),
        (
            "6.4 Exhibition management (Module 2 — Priority)",
            [
                "Create, schedule, update, and archive exhibitions",
                "Gallery / space assignment",
                "Artifact allocation to exhibitions",
                "Historical exhibition archive and performance analysis (attendance/engagement — roadmap)",
            ],
        ),
        (
            "6.5 Conservation management (Module 3 — Priority)",
            [
                "Conservation logs tied to artifacts and inspectors",
                "Inspection / condition / restoration history per artifact",
                "Damage reporting workflow",
                "Dashboard surfaces conservation alerts",
                "Environmental sensor feed planned for Phase 2 (manual entry initially)",
            ],
        ),
        (
            "6.6 Ticketing & visitor payments",
            [
                "Public ticket type listing and purchase",
                "Staff CRUD for ticket types",
                "Digital QR tickets after purchase",
                "Gate verification by ticket code (tickets.verify)",
                "Payment methods: Telebirr, Chapa, cash (sandbox / simulated)",
            ],
        ),
        (
            "6.7 Executive dashboard (Module 9 — Priority)",
            [
                "Stats: artifacts, exhibitions, conservation, visitors, revenue indicators",
                "Charts for trends and status snapshots",
                "Permission-gated: dashboard.read",
            ],
        ),
        (
            "6.8 AI assist layer",
            [
                "Describe artifact — draft text from notes/images",
                "Smart search — natural-language catalog queries",
                "Generate report — operational summary drafts",
                "Ask assistant — grounded Q&A over platform data drafts",
                "Rate-limited; outputs labeled for human review",
            ],
        ),
        (
            "6.9 Visitor public experience",
            [
                "Marketing landing site",
                "Visitor registration",
                "Public artifact page via QR",
                "Ticket purchase without staff counter dependence",
            ],
        ),
        (
            "6.10 Audit logging",
            [
                "AuditLog model and middleware support for sensitive changes",
                "Especially important for conservation and location updates",
            ],
        ),
        (
            "6.11 Phase 2–3 modules (proposed)",
            [
                "Module 4 — Inventory (equipment, supplies, barcode stock, procurement)",
                "Module 5 — Staff & volunteer management",
                "Module 6 — Maintenance work orders & building systems",
                "Module 7 — Digital archive (documents, media, versioned policies)",
                "Module 8 — Memberships, group bookings, feedback",
                "IoT climate monitoring; RFID tracking; multi-tenant national network",
            ],
        ),
    ]
    for title, items in modules:
        block = [Paragraph(title, s["h2"]), bullets(items, s), Spacer(1, 4)]
        story.append(KeepTogether(block))

    story.append(PageBreak())

    # ── 7 WORKFLOWS ──
    story.append(Paragraph("7. Key Business Workflows", s["h1"]))
    workflows = [
        (
            "7.1 Catalog an artifact",
            "Staff creates artifact → uploads images → system generates QR → optional AI description → curator reviews → record publishable; public can open via QR.",
        ),
        (
            "7.2 Visitor QR explore",
            "Visitor scans physical QR → /artifact/:code → public profile with gallery, history, and narration.",
        ),
        (
            "7.3 Buy and verify a ticket",
            "Visitor selects ticket type → pays via Telebirr/Chapa/cash (sandbox) → receives digital QR ticket → staff verifies at gate with tickets.verify.",
        ),
        (
            "7.4 Conservation inspection",
            "Conservation staff logs inspection/condition against artifact → history accumulates → dashboard highlights items needing attention.",
        ),
        (
            "7.5 Plan an exhibition",
            "Curator creates exhibition, sets schedule/space, allocates artifacts → team views shared schedule.",
        ),
        (
            "7.6 Admin onboarding staff",
            "Admin creates user with role and temp password → staff logs in → forced password change → permissions drive UI and API access.",
        ),
        (
            "7.7 AI-assisted operations",
            "Staff requests description/search/report/Q&A → AI returns draft grounded in data → human reviews before official use.",
        ),
    ]
    for title, text in workflows:
        story.append(Paragraph(title, s["h2"]))
        story.append(Paragraph(text, s["body"]))

    # ── 8 AI ──
    story.append(Paragraph("8. Artificial Intelligence Capabilities", s["h1"]))
    story.append(
        tbl(
            [
                ["Capability", "What it does", "Human checkpoint"],
                [
                    "AI Artifact Assistant",
                    "Drafts descriptions, summaries, keywords, classification suggestions",
                    "Curator approves before publishing",
                ],
                [
                    "AI Smart Search",
                    'NL search e.g. "Ethiopian artifacts from the Adwa period"',
                    "Ranked suggestions only — no autonomous edits",
                ],
                [
                    "AI Report Generator",
                    "Drafts daily/monthly/executive summaries from live data",
                    "Manager reviews and signs off",
                ],
                [
                    "Predictive Conservation",
                    "Flags elevated risk from condition history (Phase 2)",
                    "Conservation lead confirms schedule",
                ],
                [
                    "Duplicate Detection",
                    "Flags likely duplicate catalog entries",
                    "Curator confirms merge or keep separate",
                ],
                [
                    "AI Museum Assistant",
                    "Answers ops questions grounded in platform data",
                    "Staff verify before acting on answers",
                ],
            ],
            [3.5 * cm, 6.5 * cm, 5 * cm],
            s,
        )
    )
    story.append(
        Paragraph(
            "Constraint: AI quality depends on data completeness. Early outputs should be treated as first drafts "
            "and clearly labeled as AI-generated.",
            s["note"],
        )
    )

    # ── 9 INTEGRATIONS ──
    story.append(Paragraph("9. Payments, QR & Integrations", s["h1"]))
    story.append(
        bullets(
            [
                "<b>Payments:</b> Telebirr, Chapa, and cash simulation for tickets (donations/memberships planned).",
                "<b>QR:</b> Low-cost artifact identity and visitor digital tickets; printed labels near zero hardware cost.",
                "<b>RFID:</b> Phase 2/3 for higher-value inventory verification.",
                "<b>IoT:</b> Temperature, humidity, light, air quality → conservation alerts (future).",
                "<b>Media:</b> Cloudinary for artifact imagery.",
                "<b>Auth:</b> Supabase Auth.",
                "<b>AI providers:</b> OpenAI; regional options (e.g. Addis AI) and TTS for narration may be evaluated later.",
            ],
            s,
        )
    )
    story.append(PageBreak())

    # ── 10 API ──
    story.append(Paragraph("10. REST API Reference", s["h1"]))
    story.append(
        Paragraph(
            "Base path: <font face='Courier'>/api</font>. Authenticated routes require a valid session/token; "
            "permission-guarded routes require the listed permission.",
            s["body"],
        )
    )
    story.append(
        tbl(
            [
                ["Area", "Endpoints (summary)"],
                [
                    "Auth",
                    "POST /auth/register, /login, /logout; GET /auth/me; POST /auth/change-password, /forgot-password, /update-password",
                ],
                [
                    "Artifacts",
                    "GET/POST /artifacts; GET/PUT/DELETE /artifacts/:id; public GET /artifacts/qr/:code",
                ],
                [
                    "Exhibitions",
                    "GET/POST /exhibitions; GET/PUT/DELETE /exhibitions/:id",
                ],
                [
                    "Conservation",
                    "GET/POST /conservation; GET/PUT/DELETE /conservation/:id",
                ],
                [
                    "Dashboard",
                    "GET /dashboard/stats; GET /dashboard/charts",
                ],
                [
                    "Tickets",
                    "CRUD /tickets/types; POST /tickets/purchase; GET /tickets; GET /tickets/:id; PATCH|PUT|DELETE /tickets/:id; GET /tickets/verify/:code",
                ],
                [
                    "AI",
                    "POST /ai/describe-artifact, /ai/search, /ai/generate-report, /ai/ask",
                ],
                [
                    "Users",
                    "GET/POST /users; PATCH /users/:id; PATCH /users/:id/status",
                ],
                [
                    "Roles",
                    "GET /roles; GET /roles/permissions; POST/PATCH/DELETE /roles/:id; PUT /roles/:id/permissions",
                ],
                ["Health", "GET /health"],
            ],
            [3 * cm, 12 * cm],
            s,
        )
    )
    story.append(Paragraph("10.1 Primary frontend routes", s["h2"]))
    story.append(
        Paragraph(
            "<font face='Courier'>/</font>, <font face='Courier'>/login</font>, "
            "<font face='Courier'>/register</font>, <font face='Courier'>/artifact/:code</font>, "
            "<font face='Courier'>/tickets*</font>, <font face='Courier'>/dashboard</font>, "
            "<font face='Courier'>/artifacts*</font>, <font face='Courier'>/exhibitions/*</font>, "
            "<font face='Courier'>/admin/*</font>",
            s["body"],
        )
    )

    # ── 11 SECURITY ──
    story.append(Paragraph("11. Security & Data Governance", s["h1"]))
    story.append(
        bullets(
            [
                "Role-based access control aligned to museum stakeholder roles",
                "Secure authentication with password change policies for staff",
                "Audit logging for sensitive record changes",
                "Helmet, CORS, rate limiting, request validation on the API",
                "Regular backups with defined RPO/RTO (operational policy)",
                "Human approval trails for conservation sign-off and AI-assisted reporting",
                "Data residency and image/metadata ownership policy required before production cloud choice",
            ],
            s,
        )
    )

    # ── 12 ROADMAP ──
    story.append(Paragraph("12. Implementation Roadmap", s["h1"]))
    story.append(
        tbl(
            [
                ["Phase", "Horizon", "Focus"],
                [
                    "Phase 1 — MVP",
                    "Hackathon / Day 1",
                    "Auth, artifacts, AI assist, dashboard, QR visitor page, payment prototype",
                ],
                [
                    "Phase 2 — Pilot",
                    "Months 1–6",
                    "Harden Modules 1–3; inventory/maintenance/staff; live Telebirr; real collection migration",
                ],
                [
                    "Phase 3 — Scale",
                    "Months 6–18",
                    "Multi-tenant, mobile apps, RFID/IoT for funded sites, national heritage network",
                ],
            ],
            [3.5 * cm, 3.5 * cm, 8 * cm],
            s,
        )
    )

    # ── 13 KPIs ──
    story.append(Paragraph("13. Success Criteria & KPIs", s["h1"]))
    story.append(
        bullets(
            [
                "% of collection digitized with complete required metadata and images",
                "Conservation follow-up completion rate (inspections logged on schedule)",
                "Staff adoption: active weekly users by role",
                "Visitor digital ticket share vs counter-only sales",
                "QR scan engagement on public artifact pages",
                "Time to produce monthly operational report (manual vs AI-assisted draft)",
                "Gate verification success rate and ticket fraud incidents",
            ],
            s,
        )
    )
    story.append(Spacer(1, 1 * cm))
    story.append(
        Paragraph(
            "— End of Document —<br/>SMRMP System Functionality & Product Requirements Document v2.0",
            s["cover_meta"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=PAGE,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        title="SMRMP System Functionality & PRD",
        author="SMRMP Project",
    )
    doc.build(story, onFirstPage=cover_header_footer, onLaterPages=header_footer)
    print(f"Wrote: {OUT}")


if __name__ == "__main__":
    build()
