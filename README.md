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
# zenmind-market-website
