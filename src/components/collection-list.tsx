import { Badge, Card, Grid, PageLayout } from '@convert/product-ui'
import Link from 'next/link'
import type { ResolvedCollection } from '@/lib/collections'
import styles from './collection-list.module.css'

export function CollectionList({ collections }: { collections: ResolvedCollection[] }) {
  return (
    <PageLayout
      headingOwner="page"
      heading="Collections"
      description="Hand-picked sets of prompts for a job, laid out as a workflow you can work through in order."
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
            action={<Badge>{`${c.prompts.length} ${c.prompts.length === 1 ? 'step' : 'steps'}`}</Badge>}
            footer={
              <Link href={`/collections/${c.slug}/`} className="cui-text-link cui-text-link-inline">
                Open workflow
                <span className="cui-sr-only">: {c.title}</span>
              </Link>
            }
          >
            <ol className={styles.steps}>
              {c.prompts.slice(0, 4).map((p) => (
                <li key={p.slug}>{p.title}</li>
              ))}
              {c.prompts.length > 4 && <li className={styles.more}>and {c.prompts.length - 4} more</li>}
            </ol>
          </Card>
        ))}
      </Grid>
    </PageLayout>
  )
}
