import type { ReactNode } from 'react'
import { Logo } from '../Icon/Logo'
import styles from './Header.module.css'

/** Page header: logo, currency count and data source (FR-013). `actions` holds the theme/shortcut buttons. */
export function Header({ currencyCount, actions }: { currencyCount: number | null; actions?: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.right}>
        <p className={styles.meta}>
          {currencyCount !== null && <>{currencyCount} Currencies · </>}EOD · ECB data
        </p>
        {actions}
      </div>
    </header>
  )
}
