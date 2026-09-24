import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

/** Empty / error message block used by every tab panel. */
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      <p className={styles.text}>{children}</p>
    </div>
  )
}
