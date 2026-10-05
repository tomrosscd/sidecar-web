'use client'

import { Alert, ContentList, EmptyState, PageLayout, Stack } from '@convert/product-ui'
import Link from 'next/link'
import { useMemo } from 'react'
import type { Prompt } from '@/lib/types'
import { useSaved } from '@/lib/use-saved'
import { useTimeframeView } from '@/lib/use-timeframe-view'
import { PromptRow } from './prompt-row'
import { TimeframeControls } from './timeframe-controls'

export function SavedPrompts({ prompts }: { prompts: Prompt[] }) {
  const { saved, available } = useSaved()
  const { state, patch, timeframe, comparison } = useTimeframeView()
  // Slugs that no longer exist in the library are ignored rather than shown.
  const list = useMemo(() => {
    const bySlug = new Map(prompts.map((p) => [p.slug, p]))
    return saved.flatMap((s) => bySlug.get(s) ?? [])
  }, [prompts, saved])

  return (
    <PageLayout
      headingOwner="page"
      heading="Saved prompts"
      description="Prompts you have saved on this device. They are stored in this browser only, so they will not follow you to another browser or computer."
      footer={<p role="status">{list.length} saved</p>}
    >
      <Stack gap={24}>
        {!available && (
          <Alert heading="Saving is not available" tone="warning">
            This browser is blocking storage, so saved prompts will be lost when you close the page.
          </Alert>
        )}
        {list.length === 0 ? (
          <EmptyState
            heading="No saved prompts yet"
            description="Use Save on any prompt and it will appear here."
            action={
              <Link href="/" className="cui-button cui-button-primary cui-button-sm">
                Browse the library
              </Link>
            }
          />
        ) : (
          <>
            <TimeframeControls state={state} onChange={patch} />
            <ContentList density="compact">
              {list.map((p) => (
                <PromptRow key={p.slug} prompt={p} timeframe={timeframe} comparison={comparison} />
              ))}
            </ContentList>
          </>
        )}
      </Stack>
    </PageLayout>
  )
}
