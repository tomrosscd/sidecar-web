import { describe, expect, it } from 'vitest'
import { isValidPayload, validatePayload } from '@/lib/validate-prompts'

const p = (o = {}) => ({ slug: 'a', title: 'A', category: 'C', body: 'b', placeholders: [], ...o })

describe('validatePayload', () => {
  it('accepts a valid payload, with extra and optional fields', () => {
    expect(validatePayload({ prompts: [p({ whenToUse: 'x' }), p({ slug: 'b', followUp: 'a' })] })).toEqual([])
  })
  it.each([null, {}, { prompts: 'no' }])('rejects %j', (d) => expect(isValidPayload(d)).toBe(false))
  it.each(['slug', 'title', 'category', 'body'])('rejects an empty %s', (k) => {
    expect(validatePayload({ prompts: [p({ [k]: '' })] }).length).toBeGreaterThan(0)
  })
  it('rejects missing placeholders array', () => {
    expect(validatePayload({ prompts: [p({ placeholders: undefined })] })).toHaveLength(1)
  })
  it('rejects duplicate slugs and unknown followUp', () => {
    expect(validatePayload({ prompts: [p(), p()] })).toHaveLength(1)
    expect(validatePayload({ prompts: [p({ followUp: 'zzz' })] })[0]).toMatch(/followUp/)
  })
  it('checks collections when present', () => {
    expect(validatePayload({ prompts: [p()], collections: [{ slug: 'c', title: 'C', promptSlugs: ['a'] }] })).toEqual(
      [],
    )
    expect(
      validatePayload({ prompts: [p()], collections: [{ slug: 'c', title: 'C', promptSlugs: ['x'] }] }),
    ).toHaveLength(1)
  })
})
