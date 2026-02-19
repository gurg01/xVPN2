# xVPN (Expo) — Repository

This repository contains the xVPN Expo project (managed workflow) and a small Node/TypeScript backend used for APIs.

What I changed for a clean initial commit
- Added `.gitignore` to exclude local build artifacts, caches, secrets, and credentials.
- Redacted any embedded credentials from documentation.
- Removed local compiled Python/JS cache files from the workspace.

What I did NOT change
- I did not modify `app.json` or any Expo configuration.
- I did not change runtime or functional application code.

Quick start

1. Install dependencies

```bash
npm install
```

2. Start the backend (dev)

```bash
npm run server:dev
```

3. Start the Expo app

```bash
npm run expo:dev
```

Environment variables
- This project expects a local `.env` file for secrets (not committed). See `STRIPE_INTEGRATION_SETUP.md` and `VPN_CONNECTION_GUIDE.md` for the required keys. DO NOT commit your `.env` or secrets to git.

Notes
- Expo configuration (`app.json`) and dependencies remain unchanged.
- If you'd like, I can also run a quick `npm run lint` and `npm test` next.

— Clean-up performed by assistant
