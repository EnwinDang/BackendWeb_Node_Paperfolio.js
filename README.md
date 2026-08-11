# Price Alerts API

A database-driven REST API, built with Node.js and Express, that lets people track
cryptocurrency assets and request an alert when an asset reaches a target price.

This is project 2 for the "Backend Web Opdrachten" course (Node.js retake). It is a
standalone project with its own database — it does not depend on any other project to
run or to be graded. It reuses the theme of a companion Laravel project
("PaperFolio", a paper-trading platform) which has a seeded contact-form suggestion
asking for a price-alerts feature that was never built; this API is that feature, built
for real, with PaperFolio wired up as an optional real HTTP client of it.

## Why this data model

Two entities, related by a foreign key:

- **assets** — public reference data: name, ticker symbol, category, and current price
  for each tracked cryptocurrency.
- **price_alerts** — a personal "notify me" request: which asset, an identifying email,
  a direction (`above`/`below`), and a target price. An alert is inherently tied to a
  person, so every alert endpoint (including reads) is gated behind an API key.

The interesting behavior lives in `PUT /assets/:id`: when a request changes an asset's
`current_price`, the handler re-evaluates every pending alert on that asset and flips
the ones whose condition is now met to triggered, stamping `triggered_at`. This isn't a
bolted-on endpoint just for a demo — it's a side effect of the update endpoint the
assignment already requires, so it's useful to any client that updates a price.

## Getting started

Requirements: Node.js 20+ (tested on Node 24).

```bash
npm install
cp .env.example .env
# edit .env and set API_KEY to any secret string you like
npm run seed   # creates data.sqlite and seeds 6 sample assets (BTC, ETH, BNB, SOL, XRP, ADA)
npm run dev    # starts the server with auto-restart on file changes (or `npm start`)
```

The server listens on `http://localhost:4000` by default (configurable via `PORT` in
`.env`). Visit `http://localhost:4000/` for the full endpoint documentation page.

`npm run seed` uses `INSERT OR IGNORE`, so it's safe to re-run — it won't duplicate or
overwrite existing rows.

## Authentication

A single shared API key, not a full user-account system — an alert's email field is a
free-text identifying value, not a foreign key to a users table. Send the key as a
request header:

```
x-api-key: <the value of API_KEY in your .env>
```

- `/assets`: reads (`GET`) are public; writes (`POST`/`PUT`/`DELETE`) require the key.
- `/alerts`: every operation, including `GET`, requires the key, since alerts contain a
  personal email address.

## Endpoints

See `GET /` (the running server's root page) for the full, authoritative list with
example request/response bodies. Summary:

| Method | Path           | Auth      | Notes |
|--------|----------------|-----------|-------|
| GET    | /assets        | public    | pagination (`limit`/`offset`), search (`name`/`symbol`), sort (`sort=field` / `sort=-field`) |
| GET    | /assets/:id    | public    | |
| POST   | /assets        | API key   | |
| PUT    | /assets/:id    | API key   | price changes trigger alert evaluation, response includes `triggeredAlerts` |
| DELETE | /assets/:id    | API key   | cascades to that asset's alerts |
| GET    | /alerts        | API key   | pagination, search (`email`/`asset_id`/`direction`/`is_triggered`), sort |
| GET    | /alerts/:id    | API key   | |
| POST   | /alerts        | API key   | cross-field validation, see below |
| PUT    | /alerts/:id    | API key   | |
| DELETE | /alerts/:id    | API key   | |

## Validation

Basic: required fields, numeric fields reject non-numbers, `assets.name` rejects digits,
`assets.symbol` must match `^[A-Z]{2,10}$`, `price_alerts.email` must look like an
email, `price_alerts.direction` must be exactly `"above"` or `"below"`.

Advanced (the cross-field business rule): a price alert must make logical sense against
the asset's current price at the moment it's created or updated —

- `direction: "above"` requires `target_price` greater than the asset's current price
  (otherwise the condition is already true and the alert is pointless).
- `direction: "below"` requires `target_price` less than the current price (same
  reasoning, inverted).
- A `target_price` within about 0.5% of the current price is also rejected as not
  meaningfully different from an alert that would fire immediately.

## Project structure

```
db/
  index.js                 opens data.sqlite, creates tables if they don't exist
  seed.js                  seeds 6 sample assets
validation/
  helpers.js                small pure helpers (isNotEmpty, isValidNumber, ...)
  assetValidation.js        validateAsset(data, isUpdate)
  alertValidation.js        validateAlert(data, db, opts) — includes the DB-backed
                             existing-asset check and the cross-field rule
middleware/
  auth.js                   checks the x-api-key header
  errorHandler.js           global Express error handler -> clean JSON errors
routes/
  assets.js
  alerts.js
public/
  index.html                the root documentation page
server.js                   wires everything together
```

## Notes on implementation choices

- **better-sqlite3, no ORM**: synchronous, zero-config, and small enough for two tables
  that an ORM would add indirection without adding clarity.
- **CommonJS** (`require`/`module.exports`), not ESM, to keep the runtime model simple.
- Route handlers don't each wrap their body in `try/catch`: better-sqlite3 is fully
  synchronous, and Express 4 automatically forwards a synchronous throw from a route
  handler to the error-handling middleware in `middleware/errorHandler.js`, which is
  what turns a validation/DB error into a clean JSON 400/500 instead of Express's
  default HTML stack-trace page.
- Sortable columns are validated against an explicit whitelist (`SORTABLE_FIELDS`) in
  each route file before being interpolated into an `ORDER BY` clause, since column
  names can't be parameterized with prepared-statement placeholders.

## Sources

- Express documentation — https://expressjs.com/
- better-sqlite3 documentation — https://github.com/WiseLibs/better-sqlite3
- General REST API and Express routing patterns, understood and adapted, not copied
  wholesale, from prior coursework and the official docs above.

## License

MIT — see `LICENSE`.
