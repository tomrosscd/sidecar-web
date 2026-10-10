import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { promptsUrl } from '@/lib/prompts'

describe('promptsUrl', () => {
  it('defaults to the Cloudflare address', () => {
    expect(promptsUrl({})).toBe('https://convert-sidecar-prompts.pages.dev/prompts.json')
  })

  it('uses PROMPTS_URL when set, and ignores a blank one', () => {
    expect(promptsUrl({ PROMPTS_URL: 'https://example.test/p.json' })).toBe('https://example.test/p.json')
    expect(promptsUrl({ PROMPTS_URL: '  ' })).toBe('https://convert-sidecar-prompts.pages.dev/prompts.json')
  })
})

describe('noindex files in public/', () => {
  it('disallows everything in robots.txt', () => {
    expect(readFileSync('public/robots.txt', 'utf8')).toBe('User-agent: *\nDisallow: /\n')
  })
})
