'use client'

import { Breadcrumbs, PageLayout } from '@convert/product-ui'
import { withBase } from '@/lib/base-path'
import type { ResolvedCollection } from '@/lib/collections'
import { PromptPanelHost } from './prompt-panel'
import { WorkflowFlow } from './workflow-flow'

export function CollectionDetail({ collection }: { collection: ResolvedCollection }) {
  return (
    <PromptPanelHost>
      <PageLayout
        headingOwner="page"
        heading={collection.title}
        description={collection.description}
        context={
          <Breadcrumbs
            items={[{ label: 'Collections', href: withBase('/collections/') }, { label: collection.title }]}
          />
        }
      >
        <WorkflowFlow collection={collection} />
      </PageLayout>
    </PromptPanelHost>
  )
}
