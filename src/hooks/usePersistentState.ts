import { useCallback, useEffect, useRef, useState } from 'react'

const PREFIX = 'fx:v1:'

/** Reads a stored value; anything missing, corrupt or invalid gives null (FR-039). */
export function readStored<T>(key: string, validate: (raw: unknown) => T | null): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return null
    return validate(JSON.parse(raw))
  } catch {
    return null
  }
}

/** Writes a value; storage errors (private mode, quota) are ignored so the app keeps working. */
export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // In-memory only for this session.
  }
}

/**
 * useState backed by localStorage under `fx:v1:${key}` (contracts/storage.md).
 * `validate` returns the typed value or null for bad data, which falls back to the default.
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  validate: (raw: unknown) => T | null,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readStored(key, validate) ?? defaultValue)
  const first = useRef(true)

  useEffect(() => {
    // Skip the initial render so an untouched default isn't written back.
    if (first.current) {
      first.current = false
      return
    }
    writeStored(key, value)
  }, [key, value])

  const set = useCallback((next: T | ((prev: T) => T)) => setValue(next), [])
  return [value, set]
}

/** Validation helpers shared by the persisted hooks. */
export const isCode = (v: unknown): v is string => typeof v === 'string' && /^[A-Z]{3}$/.test(v)
export const isNonNegative = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0

/** Keeps only the valid items of an array (bad entries are dropped individually). */
export function validList<T>(raw: unknown, isItem: (v: unknown) => v is T): T[] | null {
  if (!Array.isArray(raw)) return null
  return raw.filter(isItem)
}
