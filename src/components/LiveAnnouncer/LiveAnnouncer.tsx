import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const AnnounceContext = createContext<(message: string) => void>(() => {})

/** One polite live region for the whole app (FR-043). */
export function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const announce = useCallback((next: string) => {
    // Clear first so repeating the same message is announced again.
    setMessage('')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(next), 50)
  }, [])

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true" data-testid="live-region">
        {message}
      </div>
    </AnnounceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAnnounce = () => useContext(AnnounceContext)
