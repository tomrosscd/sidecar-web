'use client'

import {
  ContentList,
  EmptyState,
  FilterToolbar,
  PageLayout,
  Button,
  type CollectionFilterSelection,
} from '@convert/product-ui'
import { useCallback, useMemo } from 'react'
import { filterPrompts, parseLibraryQuery, serialiseLibraryQuery, type LibraryState } from '@/lib/library-query'
import { useQueryString } from '@/lib/use-query-string'
import { TIMEFRAME_PRESETS, effectiveComparison, effectiveTimeframe } from '@/lib/timeframe'
import type { Prompt } from '@/lib/types'
import { PromptRow } from './prompt-row'
import { TimeframeControls } from './timeframe-controls'

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
          filters={<TimeframeControls state={state} onChange={patch} />}
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
            <PromptRow key={p.slug} prompt={p} timeframe={timeframe} comparison={comparison} />
          ))}
        </ContentList>
      )}
    </PageLayout>
  )
}
