# Unified Connector Frontend (Next.js)

Modern Next.js app for the Unified Connector Framework. It provides:
- Connection onboarding wizard (/wizard)
- Connections dashboard (/dashboard)
- Connection detail explorer (/connections/[id])

The app uses Tailwind CSS styles and communicates directly with the FastAPI backend via public environment variables (NEXT_PUBLIC_*).

## Prerequisites

- Node.js LTS (18+) and npm
- Running backend (FastAPI) for API interactions

## Environment Configuration

Set the backend base URL using a public Next.js variable so it is available on the client:
- NEXT_PUBLIC_API_BASE_URL

For local development, copy .env.example to .env.local and set:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

Ensure the backend enables CORS for your frontend origin (e.g., http://localhost:3000) during local development.

## Install

npm install

## Run (dev)

npm run dev
Open http://localhost:3000

## Build

npm run build
npm run start

Note: This app is configured for static export in next.config.ts. If you deploy behind a static host, all API requests still call the backend via NEXT_PUBLIC_API_BASE_URL.

## API Integration Details

- All API calls are made directly to the backend using NEXT_PUBLIC_API_BASE_URL (no Next.js API routes are used).
- Shared API helpers live in src/lib/api/client.ts:
  - getApiBaseUrl(): reads NEXT_PUBLIC_API_BASE_URL
  - jsonFetch(): attaches JSON headers and credentials
  - parseUnifiedEnvelope(): normalizes UnifiedEnvelope response
  - fetchEnvelope(): convenience wrapper for the above

Key modules:
- src/lib/api/connectors.ts: onboarding/wizard calls (list connectors, initiate OAuth, create API key connections, validate)
- src/lib/api/connections.ts: dashboard actions (list connections, validate, revoke)

Pages:
- /wizard: multi-step creation flow (connector selection -> authentication -> validation)
- /dashboard: fetches and displays connections with status; supports validate/revoke
- /connections/[id]: explore containers, items, comments, and raw payloads

## Troubleshooting

- If pages show network errors:
  - Verify NEXT_PUBLIC_API_BASE_URL is correct and reachable from the browser
  - Confirm backend CORS allows requests from your frontend origin
  - Check browser console for blocked/mixed-content issues (HTTPS/HTTP mismatch)

- If the Wizard does not list any connectors:
  - Backend /connectors should return a JSON payload (UnifiedEnvelope or array). See src/lib/api/client.ts for normalization logic.

- If static export is used:
  - Ensure NEXT_PUBLIC_API_BASE_URL points to a publicly reachable backend URL at runtime.

## License

Internal project documentation for Unified Connector Framework.
