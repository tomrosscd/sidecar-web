import { describe, expect, it } from 'vitest'
import { resolveCollections } from '@/lib/collections'
import type { Prompt } from '@/lib/types'

const p = (slug: string): Prompt => ({ slug, title: slug, category: 'C', body: 'b', placeholders: [] })
const prompts = [p('a'), p('b'), p('c')]

describe('resolveCollections', () => {
  const collections = [
    { slug: 'one', title: 'One', promptSlugs: ['c', 'gone', 'a'] },
    { slug: 'empty', title: 'Empty', promptSlugs: ['gone'] },
  ]
  it('keeps order, drops missing prompts and hides empty collections', () => {
    const out = resolveCollections(prompts, collections)
    expect(out.map((c) => c.slug)).toEqual(['one'])
    expect(out[0].prompts.map((x) => x.slug)).toEqual(['c', 'a'])
  })
  it('returns nothing when prompts.json has no collections', () => {
    expect(resolveCollections(prompts, undefined)).toEqual([])
  })
})
