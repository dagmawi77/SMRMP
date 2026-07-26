# SMRMP: Smart Museum Resource Management Platform

![SMRMP Ecosystem](https://img.shields.io/badge/SMRMP-Digital_Heritage-blue.svg)
![Status: Hackathon Prototype](https://img.shields.io/badge/Status-Hackathon_MVP-success.svg)

**SMRMP** is an AI-powered, centralized operating system that transforms heritage institutions from paper-based archives into secure, data-driven, and revenue-generating digital museums. It was built specifically for developing contexts, with the **Adwa Victory Memorial Museum** (Ethiopia) serving as the primary pilot and reference site.

---

## 🎯 The Vision

Museum operations across Ethiopia and the broader African continent often rely on disconnected spreadsheets, paper ledgers, and manual ticketing. SMRMP modernizes this by providing:

1. **Smart Artifact Digitization:** Secure digital tracking via QR codes, eliminating lost history.
2. **AI-Assisted Conservation:** AI helps curators instantly draft condition reports and flags maintenance needs.
3. **Digital Ticketing & Operations:** Native integration with local payment gateways (e.g., Telebirr) to capture lost revenue and digitize the front-of-house.
4. **Interactive Visitor Experience:** Visitors scan artifacts with their phones to unlock deep historical context, audio guides, and interactive media.

---

## 🏗️ System Architecture

The platform operates across three main components:

- **Frontend (`smrmp-frontend`):** React.js + Tailwind CSS. Role-based SPA offering dashboards for Admin/Curators, and a public-facing portal for visitors (ticketing, feedback, artifact scanning).
- **Backend (`smrmp-backend`):** Node.js + Express + PostgreSQL. Handles RBAC, business logic, Telebirr payment integration, and OpenAI API generation.
- **Telegram Bot (`smrmp-telegram-bot`):** A standalone bilingual (EN/Amharic) visitor companion bot that provides museum hours, ticket QR lookup, and AI Q&A.

---

## 📂 Project Documentation Directory

This repository contains extensive architectural and business strategy documentation. If you are a developer, stakeholder, or investor, start here:

- 📄 **[SMRMP_Proposal.md](./SMRMP_Proposal.md):** The core business and concept proposal. Includes the problem statement, B2G business model, and project goals.
- 📄 **[SMRMP_PRD.md](./SMRMP_PRD.md):** The comprehensive **Product Requirements Document (PRD)** detailing the exact system architecture, tech stack, and role-based workflows. *(Formerly README.md)*
- 📄 **[SMRMP_Gap_Analysis.md](./SMRMP_Gap_Analysis.md):** A detailed audit mapping what is currently implemented in the codebase versus what was scoped in the original proposal.
- 📄 **[SMRMP_Module8_API_Endpoints.md](./SMRMP_Module8_API_Endpoints.md):** API specifications for Visitor Relations & Ticketing (Module 8).
- 📄 **[SMRMP_Visitor_Portal_Audit.md](./SMRMP_Visitor_Portal_Audit.md):** An implementation audit focused on the separation between the staff CRM and the visitor portal.
- 📄 **[SMRMP_UI_Dedup_Audit.md](./SMRMP_UI_Dedup_Audit.md):** Codebase audit for UI component deduplication and cleanup.

---

## 🚀 Getting Started (Local Development)

### 1. Backend Setup
```bash
cd smrmp-backend
npm install
cp .env.example .env   # Configure your PostgreSQL credentials and OpenAI key
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all  # Optional: Seed with demo Adwa artifacts
npm run dev
```

### 2. Frontend Setup
```bash
cd smrmp-frontend
npm install
cp .env.example .env   # Configure to point to localhost:5000
npm run dev
```

### 3. Telegram Bot Setup
```bash
cd smrmp-telegram-bot
npm install
cp .env.example .env   # Insert your TELEGRAM_BOT_TOKEN from BotFather
npm run dev
```

---

## 👥 User Roles & Access

The platform uses a strict Role-Based Access Control (RBAC) system:
- **Admin:** Full system configuration and executive dashboard access.
- **Curator:** Can manage artifacts, upload media, and plan exhibitions.
- **Conservation:** Can log artifact condition reports and use the AI drafting tool.
- **Maintenance:** Handled facility and artifact maintenance workflows.
- **Visitor (Public):** Can purchase tickets, leave feedback, and scan QR codes on site.

*For testing, you can use the seed users provided in the `smrmp-backend/seeders` folder.*

---

## 🛡️ License & Ownership
Created for the SMRMP Hackathon & Pilot Deployment. All rights reserved.
