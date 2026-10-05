'use client'

import {
  Badge,
  ContentList,
  ContentListItem,
  EmptyState,
  FilterToolbar,
  Grid,
  Input,
  PageLayout,
  Select,
  Button,
  type CollectionFilterSelection,
} from '@convert/product-ui'
import { useCallback, useMemo } from 'react'
import { filterPrompts, parseLibraryQuery, serialiseLibraryQuery, type LibraryState } from '@/lib/library-query'
import { useQueryString } from '@/lib/use-query-string'
import { COMPARISON_OPTIONS, TIMEFRAME_PRESETS, effectiveComparison, effectiveTimeframe } from '@/lib/timeframe'
import type { Prompt } from '@/lib/types'
import { CopyPromptButton } from './copy-prompt'

const PRESET_VALUES = TIMEFRAME_PRESETS.map((t) => t.value)

export function PromptLibrary({ prompts, updated }: { prompts: Prompt[]; updated?: string }) {
  const categories = useMemo(() => [...new Set(prompts.map((p) => p.category))].sort(), [prompts])
  const [search, setSearch] = useQueryString()
  const state = useMemo(() => parseLibraryQuery(search, PRESET_VALUES, categories), [search, categories])
  const patch = useCallback(
    (p: Partial<LibraryState>) => setSearch(serialiseLibraryQuery({ ...state, ...p })),
    [state, setSearch],
  )

  const visible = useMemo(() => filterPrompts(prompts, state), [prompts, state])
  const timeframe = effectiveTimeframe(state)
  const comparison = effectiveComparison(state)

  const pickerValue: CollectionFilterSelection[] = []
  if (state.category) pickerValue.push({ field: 'category', values: [state.category] })
  const flags = [...(state.featured ? ['featured'] : []), ...(state.recommended ? ['recommended'] : [])]
  if (flags.length > 0) pickerValue.push({ field: 'flags', values: flags })

  const onPickerChange = (next: CollectionFilterSelection[]) => {
    const cat = next.find((s) => s.field === 'category')?.values[0] ?? ''
    const fl = next.find((s) => s.field === 'flags')?.values ?? []
    patch({ category: cat, featured: fl.includes('featured'), recommended: fl.includes('recommended') })
  }

  return (
    <PageLayout
      headingOwner="page"
      heading="Prompt library"
      description="Ready-made prompts for Shopify Sidekick. Choose a timeframe, then copy a prompt and paste it into Sidekick."
      toolbar={
        <FilterToolbar
          density="compact"
          searchMode="expanded"
          searchLabel="Search prompts"
          searchPlaceholder="Search prompts…"
          searchValue={state.q}
          onSearchChange={(q) => patch({ q })}
          filterPicker={{
            fields: [
              {
                key: 'category',
                label: 'Category',
                options: categories.map((c) => ({
                  value: c,
                  label: `${c} (${prompts.filter((p) => p.category === c).length})`,
                })),
              },
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
            onValueChange: onPickerChange,
          }}
          onClearAll={() => patch({ q: '', category: '', featured: false, recommended: false })}
          filters={
            <Grid columns={2} gap={16}>
              <Select
                label="Timeframe"
                value={state.timeframe}
                onChange={(e) => patch({ timeframe: e.target.value })}
                options={[...TIMEFRAME_PRESETS, { value: 'custom', label: 'Custom range…' }]}
              />
              <Select
                label="Comparison"
                value={state.comparison}
                onChange={(e) => patch({ comparison: e.target.value })}
                options={[...COMPARISON_OPTIONS, { value: 'custom', label: 'Custom period…' }]}
              />
              {state.timeframe === 'custom' && (
                <Input
                  label="Custom timeframe"
                  hint="Reads as “the …”, for example 1 to 14 March."
                  value={state.customTimeframe}
                  onChange={(e) => patch({ customTimeframe: e.target.value })}
                />
              )}
              {state.comparison === 'custom' && (
                <Input
                  label="Custom comparison"
                  hint="For example, the week before launch."
                  value={state.customComparison}
                  onChange={(e) => patch({ customComparison: e.target.value })}
                />
              )}
            </Grid>
          }
        />
      }
      footer={
        <p role="status">
          {visible.length} of {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
          {updated ? ` · Library updated ${updated}` : ''}
        </p>
      }
    >
      {visible.length === 0 ? (
        <EmptyState
          live
          heading="No prompts match"
          description="Try a different search or clear the filters."
          action={
            <Button
              variant="secondary"
              onClick={() => patch({ q: '', category: '', featured: false, recommended: false })}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <ContentList density="compact">
          {visible.map((p) => (
            <ContentListItem
              key={p.slug}
              title={p.title}
              description={p.description}
              meta={
                <>
                  <Badge>{p.category}</Badge>
                  {p.featured && <Badge tone="accent">Featured</Badge>}
                  {p.recommended && <Badge tone="positive">Recommended</Badge>}
                </>
              }
              actions={<CopyPromptButton prompt={p} timeframe={timeframe} comparison={comparison} />}
            />
          ))}
        </ContentList>
      )}
    </PageLayout>
  )
}
