import { Badge, Card, Grid, PageLayout } from '@convert/product-ui'
import Link from 'next/link'
import type { ResolvedCollection } from '@/lib/collections'

export function CollectionList({ collections }: { collections: ResolvedCollection[] }) {
  return (
    <PageLayout
      headingOwner="page"
      heading="Collections"
      description="Hand-picked sets of prompts for a job, such as a post-launch review or BFCM."
    >
      <Grid columns={3} gap={16} align="stretch">
        {collections.map((c) => (
          <Card
            key={c.slug}
            heading={c.title}
            headingLevel={2}
            headingSize="collection"
            density="compact"
            description={c.description}
            action={<Badge>{`${c.prompts.length} ${c.prompts.length === 1 ? 'prompt' : 'prompts'}`}</Badge>}
            footer={
              <Link href={`/collections/${c.slug}/`} className="cui-text-link cui-text-link-inline">
                View collection
                <span className="cui-sr-only">: {c.title}</span>
              </Link>
            }
          />
        ))}
      </Grid>
    </PageLayout>
  )
}
