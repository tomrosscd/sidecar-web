import { describe, expect, it } from 'vitest'
import { formatDate, formatRange } from '@/lib/format-range'

describe('formatRange', () => {
  it('formats dates without a timezone shift', () => {
    expect(formatDate('2025-01-01')).toBe('1 Jan 2025')
    expect(formatDate('2025-12-31')).toBe('31 Dec 2025')
  })
  it('joins a range with an en dash, and collapses a single day', () => {
    expect(formatRange('2025-01-01', '2025-03-31')).toBe('1 Jan 2025 – 31 Mar 2025')
    expect(formatRange('2025-03-05', '2025-03-05')).toBe('5 Mar 2025')
    expect(formatRange('2025-03-05')).toBe('5 Mar 2025')
  })
  it('returns empty text for bad input', () => {
    expect(formatRange('nope')).toBe('')
    expect(formatDate('2025-13-01')).toBe('')
  })
})
