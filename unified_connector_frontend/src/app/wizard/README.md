# Wizard Page

The `/wizard` route provides a guided connection onboarding experience:

Steps:
1. Select connector (e.g., Jira/Confluence) - fetched from backend `/connectors`
2. Select authentication method - OAuth or API Key
3. Initiate authentication
   - OAuth calls `POST /connections/oauth/initiate` and redirects to authUrl
   - API Key calls `POST /connections/api-key` with apiKey and optional apiBaseUrl
4. Validate connection via `GET /connections/validate?connectorId=...`
5. Redirect to dashboard (root) on success

Environment:
- NEXT_PUBLIC_BACKEND_URL must be set in `.env` to point to the backend service.
