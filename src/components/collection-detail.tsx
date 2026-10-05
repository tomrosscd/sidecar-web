'use client'

import { Breadcrumbs, Card, ContentList, PageLayout, Stack } from '@convert/product-ui'
import { withBase } from '@/lib/base-path'
import type { ResolvedCollection } from '@/lib/collections'
import { useTimeframeView } from '@/lib/use-timeframe-view'
import { PromptRow } from './prompt-row'
import { TimeframeControls } from './timeframe-controls'

export function CollectionDetail({ collection }: { collection: ResolvedCollection }) {
  const { state, patch, timeframe, comparison } = useTimeframeView()
  return (
    <PageLayout
      headingOwner="page"
      heading={collection.title}
      description={collection.description}
      context={
        <Breadcrumbs items={[{ label: 'Collections', href: withBase('/collections/') }, { label: collection.title }]} />
      }
      footer={<p role="status">{collection.prompts.length} prompts, in suggested order</p>}
    >
      <Stack gap={24}>
        <Card heading="Timeframe" headingLevel={2} headingSize="collection" density="compact" elevation="flat">
          <TimeframeControls state={state} onChange={patch} />
        </Card>
        <ContentList density="compact">
          {collection.prompts.map((p) => (
            <PromptRow key={p.slug} prompt={p} timeframe={timeframe} comparison={comparison} />
          ))}
        </ContentList>
      </Stack>
    </PageLayout>
  )
}
