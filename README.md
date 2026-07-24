# ZenMind Market Website

React + Vite marketplace browser mounted at `/`.

```bash
cp .env.example .env
npm install
npm run dev
```

The website uses the backend catalog as its only market data source. If `/api/v1/catalog` is unavailable, the UI shows an error instead of falling back to built-in demo items. Artifact downloads go through the backend resolve/download APIs so the server can serve files from its persistent artifact storage and record download events.

CLI tools and skills must upload an ADP `schema: "0.1"` manifest using the latest hook protocol. The website only collects the `adp.yaml`; the backend validates the manifest, rejects legacy hook syntax, and binds artifact URLs plus SHA-256 values.

## Environment

Vite loads `.env` automatically during development and build.

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_MARKET_BRAND` | `zenmind` | Market brand identifier. |
| `VITE_MARKET_API_BASE` | `/api/v1` | API root used by the browser UI. |
| `VITE_BASE_PATH` | `/` | Vite deployment base path. |
| `VITE_DEV_HOST` | `127.0.0.1` | Vite development listen address. |
| `VITE_DEV_PORT` | `5173` | Vite development port. |
| `VITE_DEV_STRICT_PORT` | `true` | Fail instead of selecting another occupied port. |
| `MARKET_API_PROXY_TARGET` | `http://127.0.0.1:8088` | Development target for `/api`. |
| `MARKET_NPM_PROXY_TARGET` | API proxy target | Development target for `/npm`. |
| `MARKET_ARTIFACT_PROXY_TARGET` | API proxy target | Development target for `/artifacts`. |
| `MARKET_DEV_PROXY_TOKEN` | empty | Optional local trusted-proxy token; must match the server. |
| `MARKET_DEV_USER_ID` | empty | Local trusted-proxy user ID. |
| `MARKET_DEV_USER_ROLE` | `creator` | Local role: `creator` or `admin`. |

Variables beginning with `MARKET_` above are read only by the Vite development server. They are deliberately not prefixed with `VITE_`, so the proxy token and local identity are not exposed to browser code.

## OIDC authentication

The website delegates sign-in to the Market server. Selecting **Sign in** navigates the browser to `${VITE_MARKET_API_BASE}/auth/oidc/login`; after the third-party provider completes authorization, the server redirects back to the market and stores a signed HttpOnly session cookie. The browser restores the signed-in user from `/auth/me` and includes the cookie with catalog, favorite, creator, and admin requests.

Keep the website and API on the same public site origin (the bundled nginx configuration proxies `/api/` to the server). This is required for the session cookie and avoids exposing an OIDC client secret or access token to frontend code. Configure the provider and callback details through the server's `MARKET_OIDC_*` environment variables.

### Local development

Copy `.env.example` to `.env`, then `npm run dev` serves the website using `VITE_DEV_HOST` and `VITE_DEV_PORT`. Its Vite proxy forwards `/api`, `/npm`, and `/artifacts` to the configured Market Server targets, so the browser continues to use a single origin.

For local development without OIDC, start the Market Server with the same trusted proxy token:

```bash
MARKET_ADDR=127.0.0.1:8088 \
MARKET_PUBLIC_BASE_URL=http://127.0.0.1:8088 \
MARKET_PROXY_TOKEN=local-dev \
go run ./cmd/market-server
```

When `MARKET_DEV_PROXY_TOKEN` and `MARKET_DEV_USER_ID` are set in the website `.env`, Vite supplies the trusted identity only to proxied API requests. Remove those variables to exercise the real OIDC flow.

For local OIDC development, configure the identity provider and the Market server with the same callback URL:

```env
MARKET_PUBLIC_BASE_URL=http://localhost:5173
MARKET_OIDC_REDIRECT_URL=http://localhost:5173/api/v1/auth/oidc/callback
MARKET_OIDC_SUCCESS_REDIRECT=/
```

Register the configured callback URL with the provider exactly. Keep `VITE_DEV_STRICT_PORT=true` so Vite fails rather than silently choosing another port and invalidating the registered callback.
# zenmind-market-website
