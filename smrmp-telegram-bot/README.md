# SMRMP Visitor Telegram Bot

Standalone visitor companion for **Adwa Victory Memorial Museum** (SMRMP).  
Runs separately from `smrmp-backend` / `smrmp-frontend` and talks to public visitor APIs.

## Features

| Feature | Commands / UI |
|--------|----------------|
| Bilingual EN / አማርኛ | `/language`, startup picker |
| Hours & visit tips | `/hours` |
| Current exhibitions | `/exhibitions` |
| Ticket prices + buy link | `/tickets` |
| Ticket QR lookup | Tickets → Look up my ticket |
| Artifact QR stories | `/scan`, deep-link `?start=ART-XXXX` |
| AI visitor guide | `/ask` or free-text questions |
| Visit feedback (1–5 + comment) | `/feedback` |

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather) → copy the token.
2. Ensure `smrmp-backend` is running and migrate feedback table:

```bash
cd ../smrmp-backend
npx sequelize-cli db:migrate
npm run dev
```

3. Install and configure the bot:

```bash
cd ../smrmp-telegram-bot
cp .env.example .env
# edit TELEGRAM_BOT_TOKEN and SMRMP_API_URL
npm install
npm run dev
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | yes | From BotFather |
| `SMRMP_API_URL` | yes | e.g. `http://localhost:5000/api` |
| `FRONTEND_URL` | recommended | Ticket + artifact web links |
| `MUSEUM_NAME` | no | Display name |
| `BOT_MODE` | no | `polling` (default) or `webhook` |

## Gallery deep links

Print QR codes that open Telegram with an artifact payload:

```
https://t.me/<YourBotUsername>?start=ART-XXXX
```

Visitors can also paste `ART-XXXX` or `TKT-XXXX` into the chat.

## API dependencies

- `GET /api/visitor/info`
- `GET /api/visitor/exhibitions`
- `GET /api/visitor/tickets/:code`
- `POST /api/visitor/ask`
- `POST /api/visitor/feedback`
- `GET /api/artifacts/qr/:code`
- `GET /api/tickets/types`

## Production note

Use `BOT_MODE=webhook` behind HTTPS for production. Long polling is fine for local development.
