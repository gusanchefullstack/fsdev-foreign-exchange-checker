const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short' })

/** Log times (FR-035): "now" < 1 min, "20m" < 1 h, "3h" < 24 h, then "13 May". */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp)
  if (diff < MINUTE) return 'now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`
  const date = new Date(timestamp)
  return `${date.getDate()} ${MONTH.format(date)}`
}

/** Machine-readable value for <time dateTime>. */
export const formatAbsolute = (timestamp: number) => new Date(timestamp).toISOString()

/** Human-readable full date for tooltips / screen readers. */
export const formatFull = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
