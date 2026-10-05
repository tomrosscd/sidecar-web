'use client'

import { Input, Select } from '@convert/product-ui'
import { COMPARISON_OPTIONS, TIMEFRAME_PRESETS } from '@/lib/timeframe'
import styles from './timeframe-controls.module.css'
import { useView } from './view-provider'

/**
 * The controls that change the prompt text itself: date range, comparison and their custom wording.
 * Shared by the library, the side panel and collections, all reading the same state.
 */
export function TimeframeControls() {
  const { state, patch } = useView()
  return (
    <div className={styles.row}>
      <div className={styles.field}>
        <Select
          label="Date range"
          value={state.timeframe}
          onChange={(e) => patch({ timeframe: e.target.value })}
          options={[...TIMEFRAME_PRESETS, { value: 'custom', label: 'Custom range…' }]}
        />
      </div>
      <div className={styles.field}>
        <Select
          label="Comparison"
          value={state.comparison}
          onChange={(e) => patch({ comparison: e.target.value })}
          options={[...COMPARISON_OPTIONS, { value: 'custom', label: 'Custom period…' }]}
        />
      </div>
      {state.timeframe === 'custom' && (
        <div className={styles.field}>
          <Input
            label="Custom date range"
            hint="Reads as “the …”. For example Q1 2025 or 1 Jan – 31 Mar 2025."
            value={state.customTimeframe}
            onChange={(e) => patch({ customTimeframe: e.target.value })}
            autoComplete="off"
          />
        </div>
      )}
      {state.comparison === 'custom' && (
        <div className={styles.field}>
          <Input
            label="Custom comparison"
            hint="For example, the week before launch."
            value={state.customComparison}
            onChange={(e) => patch({ customComparison: e.target.value })}
            autoComplete="off"
          />
        </div>
      )}
    </div>
  )
}
