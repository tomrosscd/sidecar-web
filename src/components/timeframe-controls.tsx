'use client'

import { Grid, Input, Select } from '@convert/product-ui'
import { COMPARISON_OPTIONS, TIMEFRAME_PRESETS, type TimeframeState } from '@/lib/timeframe'

/** The timeframe and comparison builder shared by the library, prompt and collection pages. */
export function TimeframeControls({
  state,
  onChange,
}: {
  state: TimeframeState
  onChange: (patch: Partial<TimeframeState>) => void
}) {
  return (
    <Grid columns={2} gap={16}>
      <Select
        label="Timeframe"
        value={state.timeframe}
        onChange={(e) => onChange({ timeframe: e.target.value })}
        options={[...TIMEFRAME_PRESETS, { value: 'custom', label: 'Custom range…' }]}
      />
      <Select
        label="Comparison"
        value={state.comparison}
        onChange={(e) => onChange({ comparison: e.target.value })}
        options={[...COMPARISON_OPTIONS, { value: 'custom', label: 'Custom period…' }]}
      />
      {state.timeframe === 'custom' && (
        <Input
          label="Custom timeframe"
          hint="Reads as “the …”, for example 1 to 14 March."
          value={state.customTimeframe}
          onChange={(e) => onChange({ customTimeframe: e.target.value })}
        />
      )}
      {state.comparison === 'custom' && (
        <Input
          label="Custom comparison"
          hint="For example, the week before launch."
          value={state.customComparison}
          onChange={(e) => onChange({ customComparison: e.target.value })}
        />
      )}
    </Grid>
  )
}
