'use client'

import { Badge, Button, Card, Icon } from '@convert/product-ui'
import { useState } from 'react'
import { buildPrompt, fillPlaceholders } from '@/lib/build-prompt'
import { copyText } from '@/lib/copy-text'
import type { Prompt } from '@/lib/types'
import { HighlightedText } from './highlighted-text'
import styles from './prompt-card.module.css'
import { PromptEditor, placeholdersFilled } from './prompt-editor'
import { SaveButton } from './save-button'
import { useToast } from './toast-provider'
import { useView } from './view-provider'

export function PromptBadges({ prompt }: { prompt: Prompt }) {
  return (
    <>
      <Badge>{prompt.category}</Badge>
      {prompt.featured && <Badge tone="accent">Featured</Badge>}
      {prompt.recommended && <Badge tone="positive">Recommended</Badge>}
    </>
  )
}

/**
 * A prompt as a card: a snippet of the finished text, which opens in place to edit and copy, and a
 * Details action that opens the prompt in the side panel.
 */
export function PromptCard({
  prompt,
  headingLevel = 2,
  step,
}: {
  prompt: Prompt
  headingLevel?: 2 | 3
  /** In a workflow: the step number, and a Done toggle. */
  step?: { number: number; done: boolean; onToggleDone: () => void }
}) {
  const { timeframe, comparison, placeholderValues, openPrompt } = useView()
  const notify = useToast()
  const [expanded, setExpanded] = useState(false)
  const [focusFields, setFocusFields] = useState(false)
  const bodyId = `prompt-body-${prompt.slug}`

  async function quickCopy() {
    if (!placeholdersFilled(prompt, placeholderValues)) {
      setExpanded(true)
      setFocusFields(true)
      notify('Fill in the details first', 'This prompt has [placeholders] to complete before it is copied.', 'info')
      return
    }
    const text = fillPlaceholders(buildPrompt(prompt, timeframe, comparison), placeholderValues)
    if (await copyText(text)) notify('Copied to clipboard', prompt.title, 'success')
    else notify('Could not copy', 'Your browser blocked clipboard access.', 'error')
  }

  return (
    <Card
      heading={step ? `${step.number}. ${prompt.title}` : prompt.title}
      headingLevel={headingLevel}
      headingSize="collection"
      density="compact"
      description={prompt.description}
      action={<SaveButton slug={prompt.slug} title={prompt.title} />}
      footer={
        <div className={styles.footer}>
          <Button
            size="sm"
            variant="quiet"
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? 'Hide prompt' : 'Show prompt'}
          </Button>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => openPrompt(prompt.slug)}
            aria-label={`Details: ${prompt.title}`}
          >
            Details
          </Button>
          <span className={styles.spacer} />
          {step && (
            <Button
              size="sm"
              variant={step.done ? 'primary' : 'outline'}
              aria-pressed={step.done}
              onClick={step.onToggleDone}
              aria-label={`${step.done ? 'Mark not done' : 'Mark done'}: ${prompt.title}`}
            >
              {step.done ? 'Done' : 'Mark done'}
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            leadingIcon={<Icon name="copy" />}
            onClick={quickCopy}
            aria-label={`Copy prompt: ${prompt.title}`}
          >
            Copy
          </Button>
        </div>
      }
    >
      <div className={styles.badges}>
        <PromptBadges prompt={prompt} />
      </div>
      <div id={bodyId}>
        {expanded ? (
          <PromptEditor prompt={prompt} autoFocus={focusFields} />
        ) : (
          <p className={styles.snippet}>
            <HighlightedText body={prompt.body} timeframe={timeframe} comparison={comparison} />
          </p>
        )}
      </div>
    </Card>
  )
}
