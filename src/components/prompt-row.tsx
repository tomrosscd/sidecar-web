import { Badge, ContentListItem } from '@convert/product-ui'
import Link from 'next/link'
import type { Prompt } from '@/lib/types'
import { CopyPromptButton } from './copy-prompt'

/** One prompt in a list: title linking to its page, badges and a Copy button. */
export function PromptRow({
  prompt,
  timeframe,
  comparison,
}: {
  prompt: Prompt
  timeframe: string
  comparison: string
}) {
  return (
    <ContentListItem
      title={
        <Link href={`/prompts/${prompt.slug}/`} className="cui-text-link cui-text-link-inline">
          {prompt.title}
        </Link>
      }
      description={prompt.description}
      meta={
        <>
          <Badge>{prompt.category}</Badge>
          {prompt.featured && <Badge tone="accent">Featured</Badge>}
          {prompt.recommended && <Badge tone="positive">Recommended</Badge>}
        </>
      }
      actions={<CopyPromptButton prompt={prompt} timeframe={timeframe} comparison={comparison} />}
    />
  )
}
