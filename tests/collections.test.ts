import { describe, expect, it } from 'vitest'
import { resolveCollections } from '@/lib/collections'
import type { Prompt } from '@/lib/types'

const p = (slug: string): Prompt => ({ slug, title: slug, category: 'C', body: 'b', placeholders: [] })
const prompts = [p('a'), p('b'), p('c')]

describe('resolveCollections', () => {
  const local = [
    { slug: 'one', title: 'One', promptSlugs: ['c', 'gone', 'a'] },
    { slug: 'empty', title: 'Empty', promptSlugs: ['gone'] },
  ]
  it('keeps order, drops missing prompts and hides empty collections', () => {
    const out = resolveCollections(prompts, undefined, local)
    expect(out.map((c) => c.slug)).toEqual(['one'])
    expect(out[0].prompts.map((x) => x.slug)).toEqual(['c', 'a'])
  })
  it('prefers collections published in prompts.json', () => {
    const remote = [{ slug: 'r', title: 'R', promptSlugs: ['b'] }]
    expect(resolveCollections(prompts, remote, local).map((c) => c.slug)).toEqual(['r'])
  })
})

describe('data/collections.json', () => {
  it('only names prompts that exist in the live library (checked at build)', async () => {
    const { default: data } = await import('../data/collections.json')
    expect(data.collections.length).toBeGreaterThan(0)
    for (const c of data.collections) expect(new Set(c.promptSlugs).size).toBe(c.promptSlugs.length)
  })
})
