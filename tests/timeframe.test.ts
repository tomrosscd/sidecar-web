import { describe, expect, it } from 'vitest'
import { DEFAULT_TIMEFRAME_STATE, effectiveComparison, effectiveTimeframe } from '@/lib/timeframe'

describe('effective values (extension getEffectiveTf / getEffectiveCmp)', () => {
  it('passes presets through', () => {
    expect(effectiveTimeframe(DEFAULT_TIMEFRAME_STATE)).toBe('last 30 days')
    expect(effectiveComparison(DEFAULT_TIMEFRAME_STATE)).toBe('prev')
  })
  it('uses trimmed custom text, with the extension fallbacks when blank', () => {
    const s = { ...DEFAULT_TIMEFRAME_STATE, timeframe: 'custom', comparison: 'custom' }
    expect(effectiveTimeframe(s)).toBe('the selected period')
    expect(effectiveComparison(s)).toBe('none')
    expect(effectiveTimeframe({ ...s, customTimeframe: ' March ' })).toBe('March')
    expect(effectiveComparison({ ...s, customComparison: ' Feb ' })).toBe('Feb')
  })
})
