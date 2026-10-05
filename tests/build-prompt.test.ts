import { describe, expect, it } from 'vitest'
import {
  buildPrompt,
  buildPromptSegments,
  fillPlaceholders,
  getCmpText,
  hasUnfilledPlaceholders,
} from '@/lib/build-prompt'
import fixtures from './fixtures/extension-parity.json'

describe('parity with the Sidecar Extension', () => {
  it('has fixtures', () => expect(fixtures.cases.length).toBeGreaterThan(300))
  it.each(fixtures.cases.map((c, i) => [i, c] as const))('case %i matches buildPrompt and getCmpText', (_i, c) => {
    expect(getCmpText(c.timeframe, c.comparison)).toBe(c.cmpText)
    expect(buildPrompt({ body: c.body }, c.timeframe, c.comparison)).toBe(c.expected)
  })
})

describe('placeholders', () => {
  it('fills every occurrence and skips blanks', () => {
    const t = 'Run [A] then [B] then [A]'
    expect(
      fillPlaceholders(
        t,
        new Map([
          ['[A]', 'x'],
          ['[B]', ''],
        ]),
      ),
    ).toBe('Run x then [B] then x')
  })
  it('detects unfilled tokens', () => {
    expect(hasUnfilledPlaceholders('Run [A]')).toBe(true)
    expect(hasUnfilledPlaceholders('over {{TF}}')).toBe(true)
    expect(hasUnfilledPlaceholders('all done')).toBe(false)
  })
})

describe('buildPromptSegments', () => {
  it('always joins back to exactly what buildPrompt returns', () => {
    for (const c of fixtures.cases) {
      const joined = buildPromptSegments({ body: c.body }, c.timeframe, c.comparison)
        .map((s) => s.text)
        .join('')
      expect(joined).toBe(c.expected)
    }
  })
  it('marks the timeframe and comparison', () => {
    const segs = buildPromptSegments({ body: 'Over {{TF}} vs {{CMP}}.' }, 'last 7 days', 'prev')
    expect(segs.filter((s) => s.kind !== 'text')).toEqual([
      { kind: 'tf', text: 'the last 7 days' },
      { kind: 'cmp', text: 'the previous 7 days' },
    ])
  })
})
