import { describe, expect, it } from 'vitest'
import { buildPrompt, fillPlaceholders, getCmpText, hasUnfilledPlaceholders } from '@/lib/build-prompt'
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
