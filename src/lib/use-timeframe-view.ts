import { useCallback, useMemo } from 'react'
import { parseTimeframeQuery, serialiseTimeframeQuery } from './library-query'
import { TIMEFRAME_PRESETS, effectiveComparison, effectiveTimeframe, type TimeframeState } from './timeframe'
import { useQueryString } from './use-query-string'

const PRESET_VALUES = TIMEFRAME_PRESETS.map((t) => t.value)

/** Timeframe and comparison held in the query string, with the values buildPrompt needs. */
export function useTimeframeView() {
  const [search, setSearch] = useQueryString()
  const state = useMemo(() => parseTimeframeQuery(search, PRESET_VALUES), [search])
  const patch = useCallback(
    (p: Partial<TimeframeState>) => setSearch(serialiseTimeframeQuery({ ...state, ...p })),
    [state, setSearch],
  )
  return { state, patch, timeframe: effectiveTimeframe(state), comparison: effectiveComparison(state), search }
}
