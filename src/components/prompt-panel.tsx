'use client'

import { Button, CollectionPanel, KeyValueList, Stack } from '@convert/product-ui'
import Link from 'next/link'
import { useRef, type ReactElement, type ReactNode, type RefObject } from 'react'
import { withBase } from '@/lib/base-path'
import { copyText } from '@/lib/copy-text'
import type { Prompt } from '@/lib/types'
import styles from './prompt-panel.module.css'
import { PromptBadges } from './prompt-card'
import { PromptEditor } from './prompt-editor'
import { SaveButton } from './save-button'
import { TimeframeControls } from './timeframe-controls'
import { useToast } from './toast-provider'
import { useView } from './view-provider'

/** The details of one prompt, for the side panel: settings, placeholders, editable text and metadata. */
export function PromptPanelContent({ prompt, page = false }: { prompt: Prompt; page?: boolean }) {
  const { prompts, openPrompt, search } = useView()
  const notify = useToast()
  const followUp = prompt.followUp ? prompts.find((p) => p.slug === prompt.followUp) : undefined

  const details: { label: string; value: ReactNode }[] = [
    prompt.level ? { label: 'Level', value: prompt.level } : null,
    prompt.whenToUse ? { label: 'When to use', value: prompt.whenToUse } : null,
    prompt.caveats ? { label: 'Caveats', value: prompt.caveats } : null,
    prompt.useCases?.length
      ? {
          label: 'Use cases',
          value: (
            <ul className={styles.list}>
              {prompt.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          ),
        }
      : null,
    prompt.dataSources?.length
      ? {
          label: 'Data sources',
          value: (
            <ul className={styles.list}>
              {prompt.dataSources.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          ),
        }
      : null,
  ].filter((x) => x !== null)

  // Settings travel with links; search, filters and the open panel do not.
  const params = new URLSearchParams(search)
  for (const k of ['p', 'q', 'cat', 'featured', 'recommended']) params.delete(k)
  const qs = params.toString()
  const carry = qs ? `?${qs}` : ''

  async function copyLink() {
    const url = `${window.location.origin}${withBase(`/prompts/${prompt.slug}/`)}${carry}`
    if (await copyText(url)) notify('Link copied', 'The link keeps your date range and comparison.', 'success')
    else notify('Could not copy the link', undefined, 'error')
  }

  return (
    <Stack gap={20}>
      <div className={styles.badges}>
        <PromptBadges prompt={prompt} />
      </div>
      {prompt.description && <p className={styles.description}>{prompt.description}</p>}
      <section aria-label="Prompt settings" className={styles.section}>
        <h3 className={styles.sectionHeading}>Settings</h3>
        <TimeframeControls />
      </section>
      <section aria-label="Prompt" className={styles.section}>
        <h3 className={styles.sectionHeading}>Prompt</h3>
        <PromptEditor key={prompt.slug} prompt={prompt} />
      </section>
      {details.length > 0 && (
        <section aria-label="About this prompt" className={styles.section}>
          <h3 className={styles.sectionHeading}>About this prompt</h3>
          <KeyValueList items={details} />
        </section>
      )}
      {followUp && (
        <section aria-label="Suggested follow-up" className={styles.section}>
          <h3 className={styles.sectionHeading}>Suggested follow-up</h3>
          {page ? (
            <Link href={`/prompts/${followUp.slug}/${carry}`} className="cui-text-link cui-text-link-inline">
              {followUp.title}
            </Link>
          ) : (
            <Button variant="link" onClick={() => openPrompt(followUp.slug)}>
              {followUp.title}
            </Button>
          )}
        </section>
      )}
      <div className={styles.actions}>
        <SaveButton slug={prompt.slug} title={prompt.title} size="default" />
        <Button variant="secondary" onClick={copyLink}>
          Copy link
        </Button>
        {!page && (
          <Link href={`/prompts/${prompt.slug}/${carry}`} className="cui-button cui-button-quiet">
            Open full page
          </Link>
        )}
      </div>
    </Stack>
  )
}

/** Wraps a collection so the selected prompt opens in a docked side panel (a modal when space is tight). */
export function PromptPanelHost({
  children,
  returnFocusRef,
}: {
  children: ReactNode
  returnFocusRef?: RefObject<HTMLElement | null>
}): ReactElement {
  const { selected, closePrompt } = useView()
  const fallback = useRef<HTMLElement | null>(null)
  return (
    <CollectionPanel
      open={!!selected}
      onOpenChange={(open) => !open && closePrompt()}
      heading={selected?.title ?? 'Prompt'}
      panel={selected ? <PromptPanelContent prompt={selected} /> : null}
      returnFocusRef={returnFocusRef ?? fallback}
    >
      {children}
    </CollectionPanel>
  )
}
