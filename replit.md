# replit.md

## Overview

xVPN is a mobile VPN client application built with Expo (React Native) and an Express backend server. It offers a dark-themed cyberpunk UI for VPN connectivity management, featuring server selection across 50 global locations, live telemetry, connection management, a world map visualization, and various settings like protocol selection, kill switch, auto-connect, biometric lock, DNS leak protection, and ad blocker. The application includes a premium subscription system via Stripe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, utilizing the new architecture and React Compiler.
- **Routing**: File-based routing with `expo-router` v6, supporting typed routes and a tab-based layout.
- **Authentication**: Login/Signup flow with `expo-secure-store` (SecureStore) for persistent sessions. Falls back to AsyncStorage on web.
- **State Management**: VPN connection state managed through React Contexts. Data fetching via `@tanstack/react-query`.
- **UI Design**: Dark cyberpunk/futuristic theme with glass-morphism effects and animated elements.
- **Fonts**: Custom Google Fonts: Space Grotesk and Orbitron.
- **Platform Support**: iOS, Android, and Web.

### Backend (Express / Node.js)

- **Framework**: Express v5 with TypeScript, running via `tsx`.
- **Port**: Express server listens on port 5000 (bound to 0.0.0.0).
- **Dev Proxy**: In development, proxies web browser requests to Expo Metro bundler on port 8081.
- **API Routes**: User auth (register/login/verify), VPN config, Stripe checkout/webhooks.
- **CORS**: Configured to allow Replit domains and localhost.
- **Static Serving**: Serves pre-built Expo web bundle and landing page in production.

### Stripe Integration

- **Plans**: Elite Stealth ($19.99/mo) and Annual Pass ($189/yr).
- **Checkout**: Creates Stripe Checkout Sessions via `/stripe/create-checkout-session`.
- **Webhooks**: Handles subscription events at `/stripe/webhook`.
- **Environment Variables**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### Database (Drizzle ORM + PostgreSQL)

- **ORM**: Drizzle ORM with schema in `shared/schema.ts`.
- **Tables**: `users`, `subscribers`, `payments`.
- **Connection**: `server/db.ts` provides the Drizzle instance using `pg` pool.
- **Schema Push**: `npx drizzle-kit push` to sync schema.

## Development

- **Dev Workflow**: Runs Expo Metro bundler on port 8081 and Express server on port 5000 concurrently.
- **Command**: `bash -c "npx expo start --web --port 8081 & npm run server:dev"`
- **Production Build**: `npm run server:build` (esbuild), then `npm run server:prod`.

## Key Files

- `server/index.ts` - Express server entry point
- `server/routes.ts` - API routes (auth, VPN config)
- `server/stripe-routes.ts` - Stripe payment routes
- `server/db.ts` - Database connection
- `shared/schema.ts` - Drizzle schema definitions
- `app/` - Expo Router pages (tabs layout)
- `components/` - React Native components
- `lib/` - Client-side utilities and contexts

## External Dependencies

- **Database**: PostgreSQL via `DATABASE_URL` env var.
- **Stripe**: Optional, requires `STRIPE_SECRET_KEY`.
- **Expo Modules**: haptics, image, gradients, blur, SVG, location.
