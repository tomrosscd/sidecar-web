import { describe, expect, it } from 'vitest'
import { SAVED_KEY, readSaved, toggleSlug, writeSaved } from '@/lib/saved'

const memoryStore = (initial?: string) => {
  let v = initial
  return { getItem: () => v ?? null, setItem: (_k: string, val: string) => void (v = val) }
}
const throwing = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('saved prompts storage', () => {
  it('reads an empty list when storage is missing, throws, or holds junk', () => {
    expect(readSaved(undefined)).toEqual([])
    expect(readSaved(throwing)).toEqual([])
    expect(readSaved(memoryStore('{not json'))).toEqual([])
    expect(readSaved(memoryStore('{"a":1}'))).toEqual([])
  })
  it('keeps only unique strings', () => {
    expect(readSaved(memoryStore(JSON.stringify(['a', 'a', 3, 'b'])))).toEqual(['a', 'b'])
  })
  it('round-trips and reports write failure', () => {
    const s = memoryStore()
    expect(writeSaved(s, ['x'])).toBe(true)
    expect(readSaved(s)).toEqual(['x'])
    expect(writeSaved(throwing, ['x'])).toBe(false)
    expect(writeSaved(undefined, ['x'])).toBe(false)
    expect(SAVED_KEY).toBeTruthy()
  })
  it('toggles', () => {
    expect(toggleSlug(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleSlug(['a', 'b'], 'a')).toEqual(['b'])
  })
})
