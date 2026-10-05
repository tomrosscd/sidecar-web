import type { Prompt } from './types'
import { DEFAULT_TIMEFRAME_STATE, type TimeframeState } from './timeframe'

/** Everything a shared library view needs. It lives in the query string, so a view is a link. */
export type LibraryState = TimeframeState & {
  q: string
  category: string
  featured: boolean
  recommended: boolean
  /** Slug of the prompt open in the side panel, or ''. */
  prompt: string
}

export const DEFAULT_LIBRARY_STATE: LibraryState = {
  ...DEFAULT_TIMEFRAME_STATE,
  q: '',
  category: '',
  featured: false,
  recommended: false,
  prompt: '',
}

const TF_VALUES = new Set(['custom'])
const CMP_VALUES = new Set(['prev', 'yoy', 'none', 'custom'])

/** Reads a view from a query string. Unknown or malformed values fall back to the defaults. */
export function parseLibraryQuery(
  search: string,
  presets: readonly string[],
  categories: readonly string[],
  promptSlugs?: ReadonlySet<string>,
): LibraryState {
  const p = new URLSearchParams(search)
  const d = DEFAULT_LIBRARY_STATE
  const tf = p.get('tf') ?? ''
  const cmp = p.get('cmp') ?? ''
  const cat = p.get('cat') ?? ''
  return {
    q: p.get('q') ?? '',
    prompt: promptSlugs?.has(p.get('p') ?? '') ? (p.get('p') as string) : '',
    category: categories.includes(cat) ? cat : '',
    featured: p.get('featured') === '1',
    recommended: p.get('recommended') === '1',
    timeframe: presets.includes(tf) || TF_VALUES.has(tf) ? tf : d.timeframe,
    comparison: CMP_VALUES.has(cmp) ? cmp : d.comparison,
    customTimeframe: p.get('tfc') ?? '',
    customComparison: p.get('cmpc') ?? '',
  }
}

/** Writes only what differs from the defaults, so the default view has a clean URL. */
export function serialiseLibraryQuery(s: LibraryState): string {
  const d = DEFAULT_LIBRARY_STATE
  const p = new URLSearchParams()
  if (s.q.trim()) p.set('q', s.q)
  if (s.prompt) p.set('p', s.prompt)
  if (s.category) p.set('cat', s.category)
  if (s.featured) p.set('featured', '1')
  if (s.recommended) p.set('recommended', '1')
  if (s.timeframe !== d.timeframe) p.set('tf', s.timeframe)
  if (s.timeframe === 'custom' && s.customTimeframe) p.set('tfc', s.customTimeframe)
  if (s.comparison !== d.comparison) p.set('cmp', s.comparison)
  if (s.comparison === 'custom' && s.customComparison) p.set('cmpc', s.customComparison)
  const out = p.toString()
  return out ? `?${out}` : ''
}

/** Filters prompts by search text (title, description, category, slug), category and the flag filters. */
export function filterPrompts(
  prompts: readonly Prompt[],
  s: Pick<LibraryState, 'q' | 'category' | 'featured' | 'recommended'>,
): Prompt[] {
  const terms = s.q.toLowerCase().split(/\s+/).filter(Boolean)
  return prompts.filter((p) => {
    if (s.category && p.category !== s.category) return false
    if (s.featured && !p.featured) return false
    if (s.recommended && !p.recommended) return false
    if (terms.length === 0) return true
    const hay = `${p.title} ${p.description ?? ''} ${p.category} ${p.slug}`.toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}
