import { useSyncExternalStore } from 'react'

/** Tracks a CSS media query (e.g. the mobile breakpoint or reduced motion). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const MOBILE_QUERY = '(max-width: 767px)'
