import { describe, expect, it } from 'vitest'
import { csvFilename, toCsv } from './csv'

const entries = [
  { id: 'b', timestamp: Date.UTC(2026, 8, 24, 10, 0), from: 'USD', to: 'EUR', sendAmount: 150000, receivedAmount: 131460, rate: 0.8764 },
  { id: 'a', timestamp: Date.UTC(2026, 8, 23, 9, 30), from: 'GBP', to: 'JPY', sendAmount: 1000.5, receivedAmount: 210976.43, rate: 210.8666667 },
]

describe('CSV export (US10)', () => {
  it('has the contract header, newest-first rows, plain decimals and CRLF line endings', () => {
    const csv = toCsv(entries)
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('datetime,from,to,send_amount,received_amount,rate')
    expect(lines[1]).toMatch(/^2026-09-24T\d\d:\d\d:\d\d[+-]\d\d:\d\d,USD,EUR,150000.00,131460.00,0.876400$/)
    expect(lines[2]).toMatch(/,GBP,JPY,1000.50,210976.43,210.866667$/)
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('quotes values that contain commas or quotes', () => {
    const csv = toCsv([{ ...entries[0]!, from: 'A,B', to: 'C"D' }])
    expect(csv.split('\r\n')[1]).toContain(',"A,B","C""D",')
  })

  it('names the file with the date', () => {
    expect(csvFilename(new Date(2026, 8, 24))).toBe('fx-conversion-log-2026-09-24.csv')
  })
})
