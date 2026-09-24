# Contract: Frankfurter v2 API (consumed)

Base URL: `https://api.frankfurter.dev`. No key is needed, it's CORS-enabled
(`access-control-allow-origin: *`), and only `GET` is used. Verified live on 2026-09-24.
All calls go through `src/services/frankfurter.ts`. No other module calls `fetch`.

## GET /v2/currencies

Response `200`: an array of

```json
{ "iso_code": "USD", "iso_numeric": "840", "name": "United States Dollar",
  "symbol": "$", "start_date": "1981-01-02", "end_date": "2026-09-24" }
```

Use: intersect `iso_code` with the bundled catalog (research R3).

## GET /v2/rates

| Query | Example | Notes |
|-------|---------|-------|
| `base` | `USD` | Defaults to EUR if omitted. Always send it |
| `quotes` | `EUR,GBP` | Comma-separated. Omit it to get all currencies |
| `from` | `2026-09-14` | With no `from`/`to`, you get the latest single date |
| `to` | `2026-09-24` | Optional. Defaults to today |
| `group` | `week` \| `month` | Downsamples long ranges |

Response `200`: a flat array, ascending by date, of

```json
{ "date": "2026-09-24", "base": "USD", "quote": "EUR", "rate": 0.87638 }
```

Uses:
- **Latest snapshot**: `?base=USD&quotes={catalog}&from={today-10d}`. Group by quote, and the last
  two dates are `latest` and `previous`.
- **History**: `?base={from}&quotes={to}&from={start}[&group=week|month]` (research R5).

## GET /v2/rate/{base}/{quote}

Response `200`: `{ "date": "2026-09-24", "base": "EUR", "quote": "GBP", "rate": 0.85917 }`.
This is not needed by the main flows. It's reserved for checking a single pair in tests.

## Errors

| Status | Body | App behavior |
|--------|------|--------------|
| `404` | `{"status":404,"message":"not found"}` | Treat as unavailable, then use the cache or a friendly message |
| `422` | `{"status":422,"message":"invalid currency: XXX"}` | Treat as unavailable for that pair |
| network/timeout (8 s) | – | Same as unavailable |

The service layer maps every failure to a typed `RatesError` (`'network' | 'not-found' |
'invalid' | 'unknown'`). UI components only receive these codes and show friendly copy
(Constitution IV, FR-052). Raw messages are never rendered.
