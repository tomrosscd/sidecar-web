import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { ensureProductUi } from '../scripts/fetch-product-ui.mjs'

const BYTES = Buffer.from('pretend this is a tarball')
const SHA = createHash('sha256').update(BYTES).digest('hex')
const FILE = 'convert-product-ui-9.9.9.tgz'

const tmp = () => mkdtempSync(join(tmpdir(), 'product-ui-'))
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const options = (dir: string, extra = {}) => ({ version: '9.9.9', sha256: SHA, repo: 'o/r', dir, ...extra })

/** A fake GitHub: the release lookup, then the asset download. */
function fakeGithub({
  assets = [{ name: FILE, url: 'https://api.github.com/asset/1' }],
  releaseStatus = 200,
  bytes = BYTES,
} = {}) {
  // The second parameter is unused here; it types the recorded calls checked in the tests.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return vi.fn(async (url: string, _init?: { headers: Record<string, string> }) =>
    url.includes('/releases/tags/')
      ? json({ assets }, releaseStatus)
      : new Response(new Uint8Array(bytes), { status: url.endsWith('/missing') ? 404 : 200 }),
  )
}

describe('ensureProductUi', () => {
  it('does nothing when the right archive is already there', async () => {
    const dir = tmp()
    writeFileSync(join(dir, FILE), BYTES)
    const fetchFn = vi.fn()
    await expect(ensureProductUi(options(dir, { fetchFn, env: { GH_TOKEN: 't' } }))).resolves.toMatch(
      /already in vendor/,
    )
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('downloads through the API with the token, and no gh', async () => {
    const dir = tmp()
    const fetchFn = fakeGithub()
    const ghFn = vi.fn()
    await expect(ensureProductUi(options(dir, { fetchFn, ghFn, env: { GH_TOKEN: 'secret' } }))).resolves.toMatch(
      /verified/,
    )
    expect(readFileSync(join(dir, FILE))).toEqual(BYTES)
    expect(ghFn).not.toHaveBeenCalled()
    const [releaseCall, assetCall] = fetchFn.mock.calls as [string, { headers: Record<string, string> }][]
    expect(releaseCall![0]).toBe('https://api.github.com/repos/o/r/releases/tags/v9.9.9')
    expect(releaseCall![1].headers.Authorization).toBe('Bearer secret')
    expect(assetCall![1].headers.Accept).toBe('application/octet-stream')
  })

  it('accepts GITHUB_TOKEN', async () => {
    const dir = tmp()
    await ensureProductUi(options(dir, { fetchFn: fakeGithub(), env: { GITHUB_TOKEN: 'x' } }))
    expect(existsSync(join(dir, FILE))).toBe(true)
  })

  it('replaces an existing archive with the wrong bytes', async () => {
    const dir = tmp()
    writeFileSync(join(dir, FILE), 'old')
    await ensureProductUi(options(dir, { fetchFn: fakeGithub(), env: { GH_TOKEN: 't' } }))
    expect(readFileSync(join(dir, FILE))).toEqual(BYTES)
  })

  it('says how to fix a release it cannot read', async () => {
    const fetchFn = fakeGithub({ releaseStatus: 404 })
    await expect(ensureProductUi(options(tmp(), { fetchFn, env: { GH_TOKEN: 't' } }))).rejects.toThrow(
      /HTTP 404.*Check GH_TOKEN can read o\/r/,
    )
  })

  it('names the missing asset', async () => {
    const fetchFn = fakeGithub({ assets: [{ name: 'other.tgz', url: 'x' }] })
    await expect(ensureProductUi(options(tmp(), { fetchFn, env: { GH_TOKEN: 't' } }))).rejects.toThrow(
      `no asset named ${FILE}`,
    )
  })

  it('says how to fix a failed asset download', async () => {
    const fetchFn = fakeGithub({ assets: [{ name: FILE, url: 'https://api.github.com/asset/missing' }] })
    await expect(ensureProductUi(options(tmp(), { fetchFn, env: { GH_TOKEN: 't' } }))).rejects.toThrow(
      /HTTP 404.*Check GH_TOKEN/,
    )
  })

  it('deletes a download whose checksum is wrong', async () => {
    const dir = tmp()
    const fetchFn = fakeGithub({ bytes: Buffer.from('tampered') })
    await expect(ensureProductUi(options(dir, { fetchFn, env: { GH_TOKEN: 't' } }))).rejects.toThrow(
      `checksum mismatch; expected ${SHA}`,
    )
    expect(existsSync(join(dir, FILE))).toBe(false)
  })

  it('falls back to gh with no token, and still verifies', async () => {
    const dir = tmp()
    const fetchFn = vi.fn()
    const ghFn = vi.fn(({ dir: d, file }) => writeFileSync(join(d, file), BYTES))
    await expect(ensureProductUi(options(dir, { fetchFn, ghFn, env: {} }))).resolves.toMatch(/verified/)
    expect(fetchFn).not.toHaveBeenCalled()
    expect(ghFn).toHaveBeenCalledWith({ version: '9.9.9', repo: 'o/r', file: FILE, dir })
  })

  it('passes on a gh failure message that names GH_TOKEN', async () => {
    const ghFn = vi.fn(() => {
      throw new Error('Could not download Product UI 9.9.9. Set GH_TOKEN to a token that can read o/r')
    })
    await expect(ensureProductUi(options(tmp(), { ghFn, env: {} }))).rejects.toThrow(/Set GH_TOKEN/)
  })
})
