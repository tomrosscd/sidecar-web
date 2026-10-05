'use client'

import {
  Button,
  EmptyState,
  FilterToolbar,
  Grid,
  PageLayout,
  SegmentedControl,
  type CollectionFilterSelection,
} from '@convert/product-ui'
import { SUBMIT_URL } from '@/config/site'
import { filterPrompts } from '@/lib/library-query'
import styles from './prompt-library.module.css'
import { PromptCard } from './prompt-card'
import { PromptPanelHost } from './prompt-panel'
import { TimeframeControls } from './timeframe-controls'
import { useView } from './view-provider'

export function PromptLibrary({ updated }: { updated?: string }) {
  const { prompts, categories, state, patch } = useView()
  const visible = filterPrompts(prompts, state)
  const clear = () => patch({ q: '', category: '', featured: false, recommended: false })

  const flags = [...(state.featured ? ['featured'] : []), ...(state.recommended ? ['recommended'] : [])]
  const pickerValue: CollectionFilterSelection[] = flags.length > 0 ? [{ field: 'flags', values: flags }] : []

  return (
    <PageLayout
      headingOwner="page"
      heading="Prompt library"
      description="Ready-made prompts for Shopify Sidekick. Set the date range once, then copy a prompt and paste it into Sidekick."
      actions={
        <a className="cui-button cui-button-secondary cui-button-sm" href={SUBMIT_URL}>
          Submit a prompt
        </a>
      }
      summary={
        <section aria-labelledby="prompt-settings-heading" className={styles.settings}>
          <div>
            <h2 id="prompt-settings-heading" className={styles.settingsHeading}>
              Prompt settings
            </h2>
            <p className={styles.settingsNote}>
              These change the wording of every prompt, and carry into the details panel.
            </p>
          </div>
          <TimeframeControls />
        </section>
      }
      toolbar={
        <FilterToolbar
          density="compact"
          searchMode="expanded"
          searchLabel="Search prompts"
          searchPlaceholder="Search prompts…"
          searchValue={state.q}
          onSearchChange={(q) => patch({ q })}
          leading={
            <SegmentedControl
              variant="pills"
              label="Category"
              value={state.category || 'all'}
              onValueChange={(v) => patch({ category: v === 'all' ? '' : v })}
              options={[
                { value: 'all', label: `All · ${prompts.length}` },
                ...categories.map((c) => ({
                  value: c,
                  label: `${c} · ${prompts.filter((p) => p.category === c).length}`,
                })),
              ]}
            />
          }
          filterPicker={{
            fields: [
              {
                key: 'flags',
                label: 'Show only',
                multiple: true,
                options: [
                  { value: 'featured', label: 'Featured' },
                  { value: 'recommended', label: 'Recommended' },
                ],
              },
            ],
            value: pickerValue,
            onValueChange: (next) => {
              const fl = next.find((s) => s.field === 'flags')?.values ?? []
              patch({ featured: fl.includes('featured'), recommended: fl.includes('recommended') })
            },
          }}
          onClearAll={clear}
        />
      }
      footer={
        <p role="status">
          {visible.length} of {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
          {updated ? ` · Library updated ${updated}` : ''}
        </p>
      }
    >
      <PromptPanelHost>
        {visible.length === 0 ? (
          <EmptyState
            live
            heading="No prompts match"
            description="Try a different search or clear the filters."
            action={
              <Button variant="secondary" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <Grid columns={2} minItemWidth={380} gap={16}>
            {visible.map((p) => (
              <PromptCard key={p.slug} prompt={p} />
            ))}
          </Grid>
        )}
      </PromptPanelHost>
    </PageLayout>
  )
}
