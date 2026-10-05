import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { loadSkills, parseSkill } from '@/lib/skills'

const ok = `---
title: T
category: C
featured: true
useCases:
  - one
  - two
---
Body here
`

describe('parseSkill', () => {
  it('reads front matter, lists, booleans and the body', () => {
    const s = parseSkill(ok, 't')
    expect(s).toMatchObject({
      slug: 't',
      title: 'T',
      category: 'C',
      featured: true,
      recommended: false,
      useCases: ['one', 'two'],
      content: 'Body here',
    })
  })
  it.each([
    ['no front matter', 'just text'],
    ['missing title', '---\ncategory: C\n---\nBody'],
    ['missing category', '---\ntitle: T\n---\nBody'],
    ['empty body', '---\ntitle: T\ncategory: C\n---\n'],
    ['bad version', '---\ntitle: T\ncategory: C\nversion: x\n---\nBody'],
  ])('rejects %s', (_n, src) => expect(() => parseSkill(src, 'x')).toThrow())
})

describe('content/skills', () => {
  it('loads the example skill', () => {
    expect(loadSkills().map((s) => s.slug)).toContain('example-skill')
    expect(readFileSync('content/skills/example-skill.md', 'utf8')).toContain('title:')
  })
})
