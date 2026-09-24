import { useCallback, useEffect } from 'react'
import type { Theme } from '../types'
import { usePersistentState } from './usePersistentState'

/** Dark (default) / light theme, saved in the browser and applied to <html data-theme> (FR-047). */
export function useTheme() {
  const [theme, setTheme] = usePersistentState<Theme>('theme', 'dark', (v) =>
    v === 'dark' || v === 'light' ? v : null,
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [setTheme])
  return { theme, toggle }
}
