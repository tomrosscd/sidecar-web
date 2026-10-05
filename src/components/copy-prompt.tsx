'use client'

import { Button, Dialog, Input, Stack } from '@convert/product-ui'
import { useState } from 'react'
import { buildPrompt, fillPlaceholders, hasUnfilledPlaceholders } from '@/lib/build-prompt'
import { copyText } from '@/lib/copy-text'
import type { Prompt } from '@/lib/types'
import styles from './copy-prompt.module.css'
import { useToast } from './toast-provider'

/**
 * Copy button for one prompt. Builds the text exactly as the extension does. When the prompt has
 * [placeholders] it first asks for their values in a dialog.
 */
export function CopyPromptButton({
  prompt,
  timeframe,
  comparison,
  size = 'sm',
  variant = 'secondary',
}: {
  prompt: Prompt
  timeframe: string
  comparison: string
  size?: 'sm' | 'default'
  variant?: 'secondary' | 'primary'
}) {
  const notify = useToast()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [showErrors, setShowErrors] = useState(false)

  const template = buildPrompt(prompt, timeframe, comparison)
  const text = fillPlaceholders(template, values)
  const missing = prompt.placeholders.filter((token) => !values[token]?.trim())

  async function copy(final: string) {
    const ok = await copyText(final)
    if (ok) notify('Copied to clipboard', prompt.title, 'success')
    else
      notify('Could not copy', 'Your browser blocked clipboard access. Open the prompt and copy it by hand.', 'error')
    return ok
  }

  async function onCopyClick() {
    if (prompt.placeholders.length === 0) {
      await copy(template)
      return
    }
    setShowErrors(false)
    setOpen(true)
  }

  async function onConfirm() {
    if (missing.length > 0 || hasUnfilledPlaceholders(text)) {
      setShowErrors(true)
      return
    }
    if (await copy(text)) setOpen(false)
  }

  return (
    <>
      <Button size={size} variant={variant} onClick={onCopyClick} aria-label={`Copy prompt: ${prompt.title}`}>
        Copy
      </Button>
      {prompt.placeholders.length > 0 && (
        <Dialog
          open={open}
          onOpenChange={setOpen}
          heading="Fill in the details"
          description={prompt.title}
          size="lg"
          footer={
            <>
              <Button variant="quiet" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={onConfirm}>
                Copy prompt
              </Button>
            </>
          }
        >
          <Stack gap={16}>
            {prompt.placeholders.map((token) => (
              <Input
                key={token}
                label={token.replace(/^\[|\]$/g, '')}
                value={values[token] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [token]: e.target.value }))}
                error={showErrors && missing.includes(token) ? 'Enter a value to continue.' : undefined}
                required
              />
            ))}
            <div>
              <p className={styles.previewLabel}>Preview</p>
              <pre className={styles.preview}>{text}</pre>
            </div>
          </Stack>
        </Dialog>
      )}
    </>
  )
}
