# ZenMind Market Website

React + Vite marketplace browser mounted at `/`.

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_MARKET_API_BASE` to use a non-default API root.

The website uses the backend catalog as its only market data source. If `/api/v1/catalog` is unavailable, the UI shows an error instead of falling back to built-in demo items. Artifact downloads go through the backend resolve/download APIs so the server can serve files from its persistent artifact storage and record download events.

CLI tools and skills must upload an ADP `schema: "0.1"` manifest using the latest hook protocol. The website only collects the `adp.yaml`; the backend validates the manifest, rejects legacy hook syntax, and binds artifact URLs plus SHA-256 values.

## Environment

Vite loads `.env` automatically during development and build.

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_MARKET_API_BASE` | `/api/v1` | API root used by the browser UI. |

## OIDC authentication

The website delegates sign-in to the Market server. Selecting **Sign in** navigates the browser to `${VITE_MARKET_API_BASE}/auth/oidc/login`; after the third-party provider completes authorization, the server redirects back to the market and stores a signed HttpOnly session cookie. The browser restores the signed-in user from `/auth/me` and includes the cookie with catalog, favorite, creator, and admin requests.

Keep the website and API on the same public site origin (the bundled nginx configuration proxies `/api/` to the server). This is required for the session cookie and avoids exposing an OIDC client secret or access token to frontend code. Configure the provider and callback details through the server's `MARKET_OIDC_*` environment variables.

### Local development

`npm run dev` serves the website at `http://127.0.0.1:5173`. Its Vite proxy forwards `/api`, `/npm`, and `/artifacts` to `http://localhost:8088`, so the browser continues to use a single origin.

For local OIDC development, configure the identity provider and the Market server with the same callback URL:

```env
MARKET_PUBLIC_BASE_URL=http://localhost:5173
MARKET_OIDC_REDIRECT_URL=http://localhost:5173/api/v1/auth/oidc/callback
MARKET_OIDC_SUCCESS_REDIRECT=/
```

Register `http://localhost:5173/api/v1/auth/oidc/callback` with the provider exactly. Port `5173` is fixed for `npm run dev`; Vite will fail rather than silently choosing another port and invalidating the registered callback.
# zenmind-market-website
