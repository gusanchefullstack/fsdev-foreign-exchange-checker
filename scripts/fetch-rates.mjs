// Build-time rate bundle (spec FR-054, research R14).
// Fetches the currency list, the latest USD-based rates (10 days) and the default pair's 1M
// history, and writes src/data/bootstrap.json so the first paint never waits on the network.
// If the API can't be reached, the committed file is kept and the build continues.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const API = 'https://api.frankfurter.dev'
const OUT = fileURLToPath(new URL('../src/data/bootstrap.json', import.meta.url))
const CATALOG = fileURLToPath(new URL('../src/data/currencyCatalog.ts', import.meta.url))

const iso = (d) => d.toISOString().slice(0, 10)
const daysAgo = (n) => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return iso(d)
}
const monthsAgo = (n) => {
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() - n)
  return iso(d)
}

// Node 20-compatible grouping (Object.groupBy needs Node 21+).
function groupByQuote(rows) {
  const out = {}
  for (const r of rows) (out[r.quote] ??= []).push(r)
  return out
}

async function getJson(path) {
  const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

try {
  // Catalog codes are the keys of CURRENCY_CATALOG ("AED: { iso2: 'ae' }", ...).
  const codes = [...readFileSync(CATALOG, 'utf8').matchAll(/^\s{2}([A-Z]{3}): \{ iso2/gm)].map((m) => m[1])
  const quotes = codes.filter((c) => c !== 'USD').join(',')
  const [currencies, rows, history] = await Promise.all([
    getJson('/v2/currencies'),
    getJson(`/v2/rates?base=USD&quotes=${quotes}&from=${daysAgo(10)}`),
    getJson(`/v2/rates?base=USD&quotes=EUR&from=${monthsAgo(1)}`),
  ])
  if (!Array.isArray(currencies) || !Array.isArray(rows) || !Array.isArray(history) || rows.length === 0) {
    throw new Error('unexpected response shape')
  }
  const bundle = {
    generatedAt: new Date().toISOString(),
    currencies: currencies
      .filter((c) => codes.includes(c.iso_code))
      .map((c) => ({ iso_code: c.iso_code, name: c.name })),
    // Only the last two publications per currency are needed (latest + previous).
    rows: Object.values(groupByQuote(rows)).flatMap((list) =>
      list
        .sort((x, y) => x.date.localeCompare(y.date))
        .slice(-2)
        .map(({ date, quote, rate }) => ({ date, quote, rate })),
    ),
    history: history.map(({ date, rate }) => ({ date, rate })),
  }
  writeFileSync(OUT, `${JSON.stringify(bundle)}\n`)
  console.log(`[fetch-rates] bundled ${bundle.currencies.length} currencies, ${bundle.rows.length} rates, ${bundle.history.length} history points`)
} catch (err) {
  console.warn(`[fetch-rates] keeping existing bootstrap.json (${err.message})`)
}
