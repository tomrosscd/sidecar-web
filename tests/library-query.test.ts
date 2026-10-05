import { describe, expect, it } from 'vitest'
import { DEFAULT_LIBRARY_STATE, filterPrompts, parseLibraryQuery, serialiseLibraryQuery } from '@/lib/library-query'
import { TIMEFRAME_PRESETS } from '@/lib/timeframe'
import type { Prompt } from '@/lib/types'

const presets = TIMEFRAME_PRESETS.map((t) => t.value)
const cats = ['CRO', 'SEO']
const prompt = (o: Partial<Prompt>): Prompt => ({
  slug: 's',
  title: 'T',
  category: 'CRO',
  body: 'b',
  placeholders: [],
  ...o,
})

describe('library query string', () => {
  it('gives the default view an empty query', () => {
    expect(serialiseLibraryQuery(DEFAULT_LIBRARY_STATE)).toBe('')
  })
  it('round-trips a shared view', () => {
    const s = {
      ...DEFAULT_LIBRARY_STATE,
      q: 'checkout flow',
      category: 'CRO',
      featured: true,
      prompt: 'a-prompt',
      timeframe: 'custom',
      customTimeframe: '1 to 14 March',
      comparison: 'custom',
      customComparison: 'the week before launch',
    }
    expect(parseLibraryQuery(serialiseLibraryQuery(s), presets, cats, new Set(['a-prompt']))).toEqual(s)
  })
  it('falls back to defaults for unknown values', () => {
    const s = parseLibraryQuery('?tf=bogus&cmp=nope&cat=Nope&featured=yes', presets, cats)
    expect(s).toEqual(DEFAULT_LIBRARY_STATE)
  })
})

describe('filterPrompts', () => {
  const list = [
    prompt({ slug: 'a', title: 'Checkout audit', featured: true }),
    prompt({ slug: 'b', title: 'Keyword gaps', category: 'SEO', description: 'Find missing terms', recommended: true }),
  ]
  const none = { q: '', category: '', featured: false, recommended: false }
  it('searches title and description, all terms', () => {
    expect(filterPrompts(list, { ...none, q: 'missing terms' }).map((p) => p.slug)).toEqual(['b'])
    expect(filterPrompts(list, { ...none, q: 'checkout keyword' })).toEqual([])
  })
  it('filters by category and flags', () => {
    expect(filterPrompts(list, { ...none, category: 'SEO' })).toHaveLength(1)
    expect(filterPrompts(list, { ...none, featured: true }).map((p) => p.slug)).toEqual(['a'])
    expect(filterPrompts(list, { ...none, featured: true, recommended: true })).toEqual([])
  })
})
