import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './relativeTime'

const now = new Date('2026-09-24T12:00:00').getTime()
const ago = (ms: number) => formatRelativeTime(now - ms, now)
const S = 1000
const M = 60 * S
const H = 60 * M

describe('formatRelativeTime (FR-035)', () => {
  it('shows "now" under a minute', () => {
    expect(ago(0)).toBe('now')
    expect(ago(59 * S)).toBe('now')
  })

  it('shows minutes under an hour', () => {
    expect(ago(60 * S)).toBe('1m')
    expect(ago(20 * M)).toBe('20m')
    expect(ago(59 * M)).toBe('59m')
  })

  it('shows hours under a day', () => {
    expect(ago(60 * M)).toBe('1h')
    expect(ago(23 * H)).toBe('23h')
  })

  it('shows day and month from 24 hours on', () => {
    expect(ago(24 * H)).toBe('23 Sep')
    expect(formatRelativeTime(new Date('2026-05-13T09:00:00').getTime(), now)).toBe('13 May')
  })
})
