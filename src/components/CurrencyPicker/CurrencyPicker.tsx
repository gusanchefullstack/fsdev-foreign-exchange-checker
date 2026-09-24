import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from 'react'
import type { Currency, CurrencyCode } from '../../types'
import { Flag } from '../Flag/Flag'
import { Icon } from '../Icon/Icon'
import styles from './CurrencyPicker.module.css'

export interface CurrencyPickerHandle {
  /** Opens the popover and focuses its search (used by the "/" shortcut). */
  open: () => void
}

interface CurrencyPickerProps {
  /** Accessible name prefix, e.g. "Send currency". */
  label: string
  value: CurrencyCode
  currencies: Currency[]
  onSelect: (code: CurrencyCode) => void
  ref?: Ref<CurrencyPickerHandle>
}

const matches = (c: Currency, q: string) =>
  c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)

/**
 * Currency button + popover with a search combobox and a grouped listbox (FR-008–FR-012).
 * Focus stays in the search field; arrow keys move the active option (aria-activedescendant).
 */
export function CurrencyPicker({ label, value, currencies, onSelect, ref }: CurrencyPickerProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const popular = useMemo(() => currencies.filter((c) => c.popular), [currencies])
  const others = useMemo(() => currencies.filter((c) => !c.popular), [currencies])
  // Options in visual order; while searching the groups collapse into one filtered list.
  const options = useMemo(
    () => (q ? currencies.filter((c) => matches(c, q)) : [...popular, ...others]),
    [q, currencies, popular, others],
  )
  const selected = currencies.find((c) => c.code === value)
  const optionId = (code: string) => `${id}-opt-${code}`

  function openPicker() {
    setQuery('')
    setActiveIndex(Math.max(0, [...popular, ...others].findIndex((c) => c.code === value)))
    setOpen(true)
  }

  function close(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  function choose(code: CurrencyCode) {
    onSelect(code)
    close(true)
  }

  useImperativeHandle(ref, () => ({ open: openPicker }))

  // Focus the search when opening.
  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent | MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return
    const code = options[activeIndex]?.code
    if (code) document.getElementById(optionId(code))?.scrollIntoView?.({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, open, options])

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const last = options.length - 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i >= last ? 0 : i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? last : i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(last)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = options[activeIndex]
      if (option) choose(option.code)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  function renderOption(c: Currency) {
    const index = options.indexOf(c)
    const isSelected = c.code === value
    // Options are driven from the search combobox via aria-activedescendant, so they
    // don't take focus or need their own key handlers.
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
      <div
        key={c.code}
        id={optionId(c.code)}
        role="option"
        aria-selected={isSelected}
        className={`${styles.option} ${index === activeIndex ? styles.active : ''}`}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => setActiveIndex(index)}
        onClick={() => choose(c.code)}
      >
        <Flag code={c.code} />
        <span className={styles.code}>{c.code}</span>
        <span className={styles.name}>{c.name}</span>
        {isSelected && <Icon name="check" size={12} className={styles.check} />}
      </div>
    )
  }

  function renderGroup(key: string, title: string, list: Currency[]) {
    const headerId = `${id}-${key}`
    return (
      <div role="group" aria-labelledby={headerId} className={styles.group}>
        <div id={headerId} className={styles.groupHeader}>
          <span className={styles.groupTitle}>{title}</span>
          <span aria-hidden="true">{list.length}</span>
          <span className="visually-hidden">, {list.length} currencies</span>
        </div>
        {list.map(renderOption)}
      </div>
    )
  }

  const listboxId = `${id}-listbox`
  const activeCode = options[activeIndex]?.code

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value}${selected ? `, ${selected.name}` : ''}`}
        onClick={() => (open ? close(false) : openPicker())}
      >
        <Flag code={value} />
        <span>{value}</span>
        <Icon name="chevron-down" size={12} />
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.search}>
            <Icon name="search" size={14} className={styles.searchIcon} />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-label="Search currencies"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeCode ? optionId(activeCode) : undefined}
              placeholder="Search currencies..."
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onSearchKeyDown}
            />
          </div>
          <div ref={listRef} id={listboxId} role="listbox" aria-label={`${label} options`} className={styles.list}>
            {q ? (
              options.map(renderOption)
            ) : (
              <>
                {renderGroup('popular', 'Popular', popular)}
                {renderGroup('other', 'Other currencies', others)}
              </>
            )}
          </div>
          {q && options.length === 0 && <p className={styles.noResults}>No currencies found</p>}
        </div>
      )}
    </div>
  )
}
