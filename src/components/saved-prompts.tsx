'use client'

import { Alert, EmptyState, Grid, PageLayout, Stack } from '@convert/product-ui'
import Link from 'next/link'
import { useMemo } from 'react'
import { useSaved } from '@/lib/use-saved'
import { PromptCard } from './prompt-card'
import { TimeframeControls } from './timeframe-controls'
import { useView } from './view-provider'

export function SavedPrompts() {
  const { saved, available } = useSaved()
  const { prompts } = useView()
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
            <TimeframeControls />
            <Grid columns={2} minItemWidth={380} gap={16}>
              {list.map((p) => (
                <PromptCard key={p.slug} prompt={p} />
              ))}
            </Grid>
          </>
        )}
      </Stack>
    </PageLayout>
  )
}
