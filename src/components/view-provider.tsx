'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { parseLibraryQuery, serialiseLibraryQuery, type LibraryState } from '@/lib/library-query'
import { TIMEFRAME_PRESETS, effectiveComparison, effectiveTimeframe } from '@/lib/timeframe'
import type { Prompt } from '@/lib/types'
import { useQueryString } from '@/lib/use-query-string'

const PRESET_VALUES = TIMEFRAME_PRESETS.map((t) => t.value)

type View = {
  prompts: Prompt[]
  categories: string[]
  /** Everything in the query string: search, filters, timeframe, comparison and the open prompt. */
  state: LibraryState
  patch: (p: Partial<LibraryState>) => void
  /** The values buildPrompt needs. */
  timeframe: string
  comparison: string
  /** The prompt open in the side panel, if any. */
  selected: Prompt | undefined
  openPrompt: (slug: string) => void
  closePrompt: () => void
  /** Filled [placeholder] values, shared by token across prompts for this visit. */
  placeholderValues: Record<string, string>
  setPlaceholder: (token: string, value: string) => void
  /** The query string, to carry the current settings on links. */
  search: string
}

const ViewContext = createContext<View | null>(null)

/** Holds the shared prompt settings: what the URL says, plus placeholder values. */
export function ViewProvider({ prompts, children }: { prompts: Prompt[]; children: ReactNode }) {
  const categories = useMemo(() => [...new Set(prompts.map((p) => p.category))].sort(), [prompts])
  const slugs = useMemo(() => new Set(prompts.map((p) => p.slug)), [prompts])
  const [search, setSearch] = useQueryString()
  const state = useMemo(() => parseLibraryQuery(search, PRESET_VALUES, categories, slugs), [search, categories, slugs])
  const [placeholderValues, setValues] = useState<Record<string, string>>({})

  const patch = useCallback(
    (p: Partial<LibraryState>) => setSearch(serialiseLibraryQuery({ ...state, ...p })),
    [state, setSearch],
  )
  const value = useMemo<View>(
    () => ({
      prompts,
      categories,
      state,
      patch,
      timeframe: effectiveTimeframe(state),
      comparison: effectiveComparison(state),
      selected: prompts.find((p) => p.slug === state.prompt),
      openPrompt: (slug) => patch({ prompt: slug }),
      closePrompt: () => patch({ prompt: '' }),
      placeholderValues,
      setPlaceholder: (token, v) => setValues((cur) => ({ ...cur, [token]: v })),
      search,
    }),
    [prompts, categories, state, patch, placeholderValues, search],
  )
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

export function useView(): View {
  const v = useContext(ViewContext)
  if (!v) throw new Error('useView must be used inside ViewProvider')
  return v
}
