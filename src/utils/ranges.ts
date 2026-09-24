import type { HistoryRange } from '../types'

export const RANGES: HistoryRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y']

const RANGE_NAMES: Record<HistoryRange, string> = {
  '1D': '1 day',
  '1W': '1 week',
  '1M': '1 month',
  '3M': '3 months',
  '1Y': '1 year',
  '5Y': '5 years',
}

/** Spoken name of a range, e.g. "1 month". */
export const rangeName = (r: HistoryRange) => RANGE_NAMES[r]
