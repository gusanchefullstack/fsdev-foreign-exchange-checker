import type { ConversionLogEntry } from '../types'

const HEADER = ['datetime', 'from', 'to', 'send_amount', 'received_amount', 'rate']

const pad = (n: number) => String(n).padStart(2, '0')

/** ISO 8601 local time with offset, e.g. 2026-09-24T12:00:00+02:00. */
function localIso(timestamp: number): string {
  const d = new Date(timestamp)
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const abs = Math.abs(off)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

function cell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Conversion log as CSV (FR-049, contracts/ui-contract.md): newest first, CRLF, no grouping. */
export function toCsv(entries: ConversionLogEntry[]): string {
  const rows = entries.map((e) =>
    [localIso(e.timestamp), e.from, e.to, e.sendAmount.toFixed(2), e.receivedAmount.toFixed(2), e.rate.toFixed(6)]
      .map(cell)
      .join(','),
  )
  return [HEADER.join(','), ...rows].join('\r\n') + '\r\n'
}

export const csvFilename = (d = new Date()) =>
  `fx-conversion-log-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.csv`

/** Triggers a browser download of the log. */
export function downloadCsv(entries: ConversionLogEntry[]) {
  const blob = new Blob([toCsv(entries)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = csvFilename()
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
