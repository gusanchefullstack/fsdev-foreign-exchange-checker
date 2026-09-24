import type { ReactNode } from 'react'
import styles from './Panel.module.css'

interface PanelProps {
  title: ReactNode
  /** Right side of the header, e.g. "10 favorites". */
  meta?: ReactNode
  children: ReactNode
}

/** Card with a title row, shared by the Compare, Favorites and Log tabs. */
export function Panel({ title, meta, children }: PanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {meta && <div className={styles.meta}>{meta}</div>}
      </div>
      {children}
    </div>
  )
}
