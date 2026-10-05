import { describe, expect, it } from 'vitest'
import { withBase } from '@/lib/base-path'

describe('withBase', () => {
  it('prefixes a root-relative path with the base path (empty when unset)', () => {
    expect(withBase('/x/')).toMatch(/\/x\/$/)
  })
})
