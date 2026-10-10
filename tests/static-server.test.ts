import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createStaticServer, resolveFile } from '../server/static-server.mjs'

const root = mkdtempSync(join(tmpdir(), 'static-'))
mkdirSync(join(root, 'prompts', 'a'), { recursive: true })
mkdirSync(join(root, '_next', 'static'), { recursive: true })
writeFileSync(join(root, 'index.html'), 'home')
writeFileSync(join(root, '404.html'), 'missing page')
writeFileSync(join(root, 'prompts', 'a', 'index.html'), 'prompt a')
writeFileSync(join(root, 'robots.txt'), 'User-agent: *')
writeFileSync(join(root, '_next', 'static', 'x.js'), 'js')
writeFileSync(join(root, '..secret'), 'nope')

let server: ReturnType<typeof createStaticServer>
let base = ''

beforeAll(async () => {
  server = createStaticServer(root)
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})
afterAll(() => new Promise<void>((ok) => server.close(() => ok())))

describe('static server', () => {
  it('serves the home page and folder index pages', async () => {
    expect(await (await fetch(`${base}/`)).text()).toBe('home')
    expect(await (await fetch(`${base}/prompts/a/`)).text()).toBe('prompt a')
    expect(await (await fetch(`${base}/prompts/a`)).text()).toBe('prompt a')
  })

  it('sends noindex and security headers on every response, including 404s', async () => {
    for (const path of ['/', '/nope/']) {
      const res = await fetch(`${base}${path}`)
      expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow, noarchive, nosnippet')
      expect(res.headers.get('x-content-type-options')).toBe('nosniff')
    }
  })

  it('answers unknown paths with 404 and the 404 page', async () => {
    const res = await fetch(`${base}/nope/`)
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('missing page')
  })

  it('caches hashed assets for a year and everything else not at all', async () => {
    expect((await fetch(`${base}/_next/static/x.js`)).headers.get('cache-control')).toContain('immutable')
    expect((await fetch(`${base}/`)).headers.get('cache-control')).toBe('no-cache')
  })

  it('rejects other methods', async () => {
    expect((await fetch(`${base}/`, { method: 'POST' })).status).toBe(405)
  })

  it('never leaves the root', async () => {
    expect(await resolveFile(root, '/../../etc/passwd')).toBeNull()
    expect(await resolveFile(root, '/%2e%2e/%2e%2e/etc/passwd')).toBeNull()
    expect(await resolveFile(root, '/%00')).toBeNull()
    expect(await resolveFile(root, '/%E0%A4%A')).toBeNull()
    expect((await fetch(`${base}/robots.txt`)).status).toBe(200)
  })
})
