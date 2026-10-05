import { buildPromptSegments } from '@/lib/build-prompt'
import styles from './highlighted-text.module.css'

/** A prompt with its substituted timeframe and comparison picked out, as in the extension. */
export function HighlightedText({
  body,
  timeframe,
  comparison,
}: {
  body: string
  timeframe: string
  comparison: string
}) {
  return (
    <>
      {buildPromptSegments({ body }, timeframe, comparison).map((s, i) =>
        s.kind === 'text' ? (
          s.text
        ) : (
          <mark key={i} className={s.kind === 'tf' ? styles.tf : styles.cmp}>
            {s.text}
          </mark>
        ),
      )}
    </>
  )
}
