'use client'

import { Button, Icon, Input, Stack, Textarea } from '@convert/product-ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildPrompt, fillPlaceholders, hasUnfilledPlaceholders } from '@/lib/build-prompt'
import { copyText } from '@/lib/copy-text'
import type { Prompt } from '@/lib/types'
import styles from './prompt-editor.module.css'
import { useToast } from './toast-provider'
import { useView } from './view-provider'

/** True when every [placeholder] has a value, so a prompt can be copied without opening it. */
export function placeholdersFilled(prompt: Prompt, values: Record<string, string>): boolean {
  return prompt.placeholders.every((t) => values[t]?.trim())
}

/**
 * The extension's expanded prompt: a field for each [placeholder], an editable preview of the finished
 * text, a check that nothing is left unfilled, and Copy. The preview resets when the settings or the
 * placeholder values change, as it does in the extension.
 */
export function PromptEditor({ prompt, autoFocus }: { prompt: Prompt; autoFocus?: boolean }) {
  const { timeframe, comparison, placeholderValues, setPlaceholder } = useView()
  const notify = useToast()
  const template = useMemo(() => buildPrompt(prompt, timeframe, comparison), [prompt, timeframe, comparison])
  const built = useMemo(() => fillPlaceholders(template, placeholderValues), [template, placeholderValues])

  // An edit is kept until the built text changes underneath it.
  const [draft, setDraft] = useState<{ base: string; text: string } | null>(null)
  const text = draft && draft.base === built ? draft.text : built
  const edited = draft !== null && draft.base === built && draft.text !== built

  const [checked, setChecked] = useState(false)
  const firstField = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (autoFocus) firstField.current?.querySelector('input')?.focus()
  }, [autoFocus])

  const missing = prompt.placeholders.filter((t) => !placeholderValues[t]?.trim())
  const unfilled = hasUnfilledPlaceholders(text)

  async function copy() {
    if (missing.length > 0 || unfilled) {
      setChecked(true)
      return
    }
    if (await copyText(text)) notify('Copied to clipboard', prompt.title, 'success')
    else
      notify('Could not copy', 'Your browser blocked clipboard access. Select the text and copy it by hand.', 'error')
  }

  return (
    <Stack gap={16}>
      {prompt.placeholders.length > 0 && (
        <div ref={firstField} className={styles.fields}>
          {prompt.placeholders.map((token) => (
            <Input
              key={token}
              label={token.replace(/^\[|\]$/g, '')}
              value={placeholderValues[token] ?? ''}
              onChange={(e) => setPlaceholder(token, e.target.value)}
              error={checked && missing.includes(token) ? 'Fill this in before copying.' : undefined}
              autoComplete="off"
            />
          ))}
        </div>
      )}
      <Textarea
        label="Prompt text"
        hint="You can edit this before copying. Changing the settings above rebuilds it."
        rows={12}
        spellCheck={false}
        value={text}
        onChange={(e) => setDraft({ base: built, text: e.target.value })}
        error={checked && missing.length === 0 && unfilled ? 'There is still a [placeholder] in the text.' : undefined}
      />
      <div className={styles.actions}>
        <Button variant="primary" leadingIcon={<Icon name="copy" />} onClick={copy}>
          Copy prompt
        </Button>
        {edited && (
          <Button variant="quiet" onClick={() => setDraft(null)}>
            Reset text
          </Button>
        )}
      </div>
    </Stack>
  )
}
