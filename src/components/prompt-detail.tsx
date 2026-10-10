'use client'

import { PageLayout } from '@convert/product-ui'
import { withBase } from '@/lib/base-path'
import type { Prompt } from '@/lib/types'
import { PromptPanelContent } from './prompt-panel'
import { RouterBreadcrumbs } from './router-breadcrumbs'

/** The full-page version of a prompt: the same content as the side panel, at its own shareable address. */
export function PromptDetail({ prompt }: { prompt: Prompt }) {
  return (
    <PageLayout
      headingOwner="page"
      heading={prompt.title}
      context={
        <RouterBreadcrumbs items={[{ label: 'Prompt library', href: withBase('/') }, { label: prompt.title }]} />
      }
      contentWidth="readable"
    >
      <PromptPanelContent prompt={prompt} page />
    </PageLayout>
  )
}
