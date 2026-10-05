'use client'

import { DatePicker, Input, type DateSelection } from '@convert/product-ui'
import { useState } from 'react'
import { formatRange } from '@/lib/format-range'
import styles from './custom-period-field.module.css'

/**
 * A custom period: pick dates on a calendar, or type the wording yourself. Picking fills the text; the
 * text is what the prompt uses, so it can always be edited afterwards (for example "Q1 2025").
 */
export function CustomPeriodField({
  label,
  hint,
  text,
  onTextChange,
}: {
  label: string
  hint: string
  text: string
  onTextChange: (text: string) => void
}) {
  const [dates, setDates] = useState<DateSelection | undefined>()
  return (
    <div className={styles.field}>
      <DatePicker
        mode="range"
        label={`${label}: pick dates`}
        value={dates}
        onValueChange={(next) => {
          setDates(next)
          if (next) onTextChange(formatRange(next.start, next.end))
        }}
      />
      <Input label={label} hint={hint} value={text} onChange={(e) => onTextChange(e.target.value)} autoComplete="off" />
    </div>
  )
}
