import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import type { TabId } from '../../types'
import styles from './Tabs.module.css'

export interface TabItem {
  id: TabId
  label: string
  badge?: number
}

interface TabsProps {
  tabs: TabItem[]
  active: TabId
  onChange: (id: TabId) => void
  /** Renders the panel for the active tab. */
  children: ReactNode
}

const tabDomId = (id: TabId) => `tab-${id}`
const panelDomId = (id: TabId) => `panel-${id}`

/** WAI-ARIA tabs with manual activation: arrows/Home/End move focus, Enter/Space selects. */
export function Tabs({ tabs, active, onChange, children }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    refs.current[next]?.focus()
  }

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label="Rate details" className={styles.tablist}>
        {tabs.map((tab, i) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              id={tabDomId(tab.id)}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-label={tab.badge ? `${tab.label}, ${tab.badge} items` : undefined}
              aria-controls={panelDomId(tab.id)}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className={styles.label}>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={panelDomId(active)}
        aria-labelledby={tabDomId(active)}
        tabIndex={0}
        className={styles.panel}
      >
        {children}
      </div>
    </div>
  )
}
