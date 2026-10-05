'use client'

import { Badge, Breadcrumbs, Button, Card, KeyValueList, PageLayout, Stack } from '@convert/product-ui'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import { copyText } from '@/lib/copy-text'
import { withBase } from '@/lib/base-path'
import type { Prompt } from '@/lib/types'
import { useTimeframeView } from '@/lib/use-timeframe-view'
import { getCmpText } from '@/lib/build-prompt'
import { CopyPromptButton } from './copy-prompt'
import { SaveButton } from './save-button'
import styles from './prompt-detail.module.css'
import { TimeframeControls } from './timeframe-controls'
import { useToast } from './toast-provider'

/** The body with {{TF}}, {{CMP}} and [placeholders] picked out, so people see what will be filled. */
function BodyPreview({ body }: { body: string }) {
  const parts = body.split(/(\{\{TF\}\}|\{\{CMP\}\}|\[[^\]\n]+\])/)
  return (
    <pre className={styles.body}>
      {parts.map((part, i) =>
        /^\{\{(TF|CMP)\}\}$/.test(part) ? (
          <mark key={i} className={styles.token}>
            {part}
          </mark>
        ) : /^\[[^\]\n]+\]$/.test(part) ? (
          <mark key={i} className={styles.placeholder}>
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </pre>
  )
}

export function PromptDetail({ prompt, followUp }: { prompt: Prompt; followUp?: Pick<Prompt, 'slug' | 'title'> }) {
  const { state, patch, timeframe, comparison, search } = useTimeframeView()
  const notify = useToast()
  const hasTokens = /\{\{(TF|CMP)\}\}/.test(prompt.body)
  const cmpText = getCmpText(timeframe, comparison)

  async function copyLink() {
    const url = `${window.location.origin}${withBase(`/prompts/${prompt.slug}/`)}${search}`
    if (await copyText(url)) notify('Link copied', 'The link keeps your timeframe and comparison.', 'success')
    else notify('Could not copy the link', undefined, 'error')
  }

  const details: { label: string; value: ReactNode }[] = [
    prompt.level ? { label: 'Level', value: prompt.level } : null,
    prompt.whenToUse ? { label: 'When to use', value: prompt.whenToUse } : null,
    prompt.caveats ? { label: 'Caveats', value: prompt.caveats } : null,
    prompt.useCases?.length ? { label: 'Use cases', value: <List items={prompt.useCases} /> } : null,
    prompt.dataSources?.length ? { label: 'Data sources', value: <List items={prompt.dataSources} /> } : null,
  ].filter((x) => x !== null)

  return (
    <PageLayout
      headingOwner="page"
      heading={prompt.title}
      description={prompt.description}
      context={<Breadcrumbs items={[{ label: 'Prompt library', href: withBase('/') }, { label: prompt.title }]} />}
      actions={
        <>
          <SaveButton slug={prompt.slug} title={prompt.title} size="default" />
          <Button variant="secondary" onClick={copyLink}>
            Copy link
          </Button>
          <CopyPromptButton
            prompt={prompt}
            timeframe={timeframe}
            comparison={comparison}
            size="default"
            variant="primary"
          />
        </>
      }
    >
      <Stack gap={24}>
        <div className={styles.badges}>
          <Badge>{prompt.category}</Badge>
          {prompt.featured && <Badge tone="accent">Featured</Badge>}
          {prompt.recommended && <Badge tone="positive">Recommended</Badge>}
        </div>

        {hasTokens && (
          <Card heading="Timeframe" headingLevel={2} headingSize="collection" density="compact" elevation="flat">
            <Stack gap={12}>
              <TimeframeControls state={state} onChange={patch} />
              <p className={styles.note}>
                <code>{'{{TF}}'}</code> becomes “the {timeframe}”.{' '}
                {cmpText ? (
                  <>
                    <code>{'{{CMP}}'}</code> becomes “{cmpText}”.
                  </>
                ) : (
                  'The comparison is left out.'
                )}
              </p>
            </Stack>
          </Card>
        )}

        <Card heading="Prompt" headingLevel={2} headingSize="collection" density="compact" elevation="flat">
          <BodyPreview body={prompt.body} />
          {prompt.placeholders.length > 0 && (
            <p className={styles.note}>
              Copy asks for: {prompt.placeholders.map((t) => t.replace(/^\[|\]$/g, '')).join(', ')}.
            </p>
          )}
        </Card>

        {details.length > 0 && (
          <Card
            heading="About this prompt"
            headingLevel={2}
            headingSize="collection"
            density="compact"
            elevation="flat"
          >
            <KeyValueList items={details} />
          </Card>
        )}

        {followUp && (
          <Card heading="Next prompt" headingLevel={2} headingSize="collection" density="compact" elevation="flat">
            <Link href={`/prompts/${followUp.slug}/${search}`} className="cui-text-link cui-text-link-inline">
              {followUp.title}
            </Link>
          </Card>
        )}
      </Stack>
    </PageLayout>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  )
}
