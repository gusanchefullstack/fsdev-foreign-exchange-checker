import styles from './StaleBanner.module.css'

const DATE = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })

/**
 * Out-of-date notice shown when cached rates are in use (FR-051).
 * Built per spec Assumption "UI not in the design".
 */
export function StaleBanner({ date }: { date: string }) {
  return (
    <p className={styles.banner} role="status">
      Showing saved rates from {DATE.format(new Date(`${date}T00:00:00Z`))}. Live rates are unavailable.
    </p>
  )
}
