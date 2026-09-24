import { describe, expect, it } from 'vitest'
import {
  formatAmount,
  formatInputDisplay,
  formatPct,
  formatRate,
  formatShortDate,
  formatSigned,
  parseAmountInput,
} from './format'

describe('formatAmount (FR-007)', () => {
  it('uses 2 decimals with grouping below 100,000', () => {
    expect(formatAmount(853.0234)).toBe('853.02')
    expect(formatAmount(94910)).toBe('94,910.00')
    expect(formatAmount(99_999.99)).toBe('99,999.99')
  })

  it('drops decimals at 100,000 and above', () => {
    expect(formatAmount(100_000)).toBe('100,000')
    expect(formatAmount(157_910.4)).toBe('157,910')
  })
})

describe('formatRate (FR-002)', () => {
  it('uses 4 decimals below 10', () => {
    expect(formatRate(0.853)).toBe('0.8530')
    expect(formatRate(9.9999)).toBe('9.9999')
  })

  it('uses 3 decimals from 10 to under 100', () => {
    expect(formatRate(10)).toBe('10.000')
    expect(formatRate(94.91)).toBe('94.910')
    expect(formatRate(99.999)).toBe('99.999')
  })

  it('uses 2 decimals at 100 and above', () => {
    expect(formatRate(100)).toBe('100.00')
    expect(formatRate(157.9123)).toBe('157.91')
    expect(formatRate(1516.72)).toBe('1,516.72')
  })
})

describe('signed formats', () => {
  it('formats rate differences with sign', () => {
    expect(formatSigned(0.0014)).toBe('+0.0014')
    expect(formatSigned(-0.45)).toBe('−0.4500')
  })

  it('formats percentages with arrow', () => {
    expect(formatPct(0.1612)).toBe('▲ +0.16%')
    expect(formatPct(-0.14)).toBe('▼ −0.14%')
  })
})

describe('parseAmountInput', () => {
  it('returns null for empty input', () => {
    expect(parseAmountInput('')).toEqual({ text: '', value: null })
  })

  it('keeps digits and one decimal point, dropping grouping commas', () => {
    expect(parseAmountInput('1,000')).toEqual({ text: '1000', value: 1000 })
    expect(parseAmountInput('2500.5')).toEqual({ text: '2500.5', value: 2500.5 })
    expect(parseAmountInput('1.2.3')).toEqual({ text: '1.23', value: 1.23 })
  })

  it('rejects letters and minus signs', () => {
    expect(parseAmountInput('-12a3')).toEqual({ text: '123', value: 123 })
  })

  it('caps decimals at 2 and the value at 999,999,999,999', () => {
    expect(parseAmountInput('1.23456').text).toBe('1.23')
    expect(parseAmountInput('99999999999999').value).toBe(999_999_999_999)
  })

  it('strips leading zeros', () => {
    expect(parseAmountInput('007')).toEqual({ text: '7', value: 7 })
    expect(parseAmountInput('0.5')).toEqual({ text: '0.5', value: 0.5 })
  })
})

describe('display helpers', () => {
  it('groups input text while keeping typed decimals', () => {
    expect(formatInputDisplay('1000')).toBe('1,000')
    expect(formatInputDisplay('2500.5')).toBe('2,500.5')
    expect(formatInputDisplay('')).toBe('')
  })

  it('formats API dates', () => {
    expect(formatShortDate('2026-05-14')).toBe('May 14')
  })
})
