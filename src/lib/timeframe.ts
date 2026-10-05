export const TIMEFRAME_PRESETS = [
  { value: 'last 7 days', label: 'Last 7 days' },
  { value: 'last 14 days', label: 'Last 14 days' },
  { value: 'last 30 days', label: 'Last 30 days' },
  { value: 'last 60 days', label: 'Last 60 days' },
  { value: 'last 90 days', label: 'Last 90 days' },
  { value: 'last quarter', label: 'Last quarter' },
  { value: 'last 6 months', label: 'Last 6 months' },
  { value: 'last 12 months', label: 'Last 12 months' },
] as const

export const COMPARISON_OPTIONS = [
  { value: 'prev', label: 'Previous period' },
  { value: 'yoy', label: 'Same period last year' },
  { value: 'none', label: 'No comparison' },
] as const

/** Selector values match the extension: a preset, or 'custom' with free text alongside. */
export type TimeframeState = {
  timeframe: string
  comparison: string
  customTimeframe: string
  customComparison: string
}

export const DEFAULT_TIMEFRAME_STATE: TimeframeState = {
  timeframe: 'last 30 days',
  comparison: 'prev',
  customTimeframe: '',
  customComparison: '',
}

/** The timeframe text passed to buildPrompt (extension: getEffectiveTf). */
export function effectiveTimeframe(s: TimeframeState): string {
  return s.timeframe === 'custom' ? s.customTimeframe.trim() || 'the selected period' : s.timeframe
}

/** The comparison value passed to buildPrompt (extension: getEffectiveCmp). */
export function effectiveComparison(s: TimeframeState): string {
  return s.comparison === 'custom' ? s.customComparison.trim() || 'none' : s.comparison
}
