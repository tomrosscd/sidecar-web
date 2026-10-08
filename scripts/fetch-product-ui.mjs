// Downloads the pinned Product UI release archive into vendor/ before `pnpm install`.
// cd-product-ui is private, so the archive is never committed to this public repo. With GH_TOKEN
// (or GITHUB_TOKEN) set, as in GitHub Actions and Cloudflare builds, it uses the GitHub API and
// needs no `gh` CLI. Without a token it falls back to your own `gh` login.
// To upgrade: change VERSION and SHA256 (from the release's SHA256SUMS), then run
// `pnpm product-ui` and `pnpm install`.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const VERSION = '1.7.0'
const SHA256 = '41301aa1543e84e3e5f2ada558ae4d21b3ec6f1432d1372802f7975d25efaed1'
const REPO = 'tomrosscd/cd-product-ui'

const sha256Of = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')

function ghDownload({ version, repo, file, dir }) {
  try {
    execFileSync('gh', ['release', 'download', `v${version}`, '-R', repo, '-p', file, '-D', dir, '--clobber'], {
      stdio: 'inherit',
    })
  } catch {
    throw new Error(
      `Could not download Product UI ${version}. Set GH_TOKEN to a token that can read ${repo}, or sign in with \`gh auth login\` using an account that can.`,
    )
  }
}

async function apiDownload({ version, repo, file, path, token, fetchFn }) {
  const headers = { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' }
  const fix = `Check GH_TOKEN can read ${repo}.`

  const release = await fetchFn(`https://api.github.com/repos/${repo}/releases/tags/v${version}`, {
    headers: { ...headers, Accept: 'application/vnd.github+json' },
  })
  if (!release.ok) throw new Error(`Could not read the ${repo} v${version} release (HTTP ${release.status}). ${fix}`)
  const asset = (await release.json()).assets?.find((a) => a.name === file)
  if (!asset) throw new Error(`The ${repo} v${version} release has no asset named ${file}.`)

  const download = await fetchFn(asset.url, { headers: { ...headers, Accept: 'application/octet-stream' } })
  if (!download.ok) throw new Error(`Could not download ${file} (HTTP ${download.status}). ${fix}`)
  writeFileSync(path, Buffer.from(await download.arrayBuffer()))
}

/** Puts the pinned archive in dir, verified. Throws with a fix-it message on any failure. */
export async function ensureProductUi({
  version = VERSION,
  sha256 = SHA256,
  repo = REPO,
  dir = join(import.meta.dirname, '..', 'vendor'),
  env = process.env,
  fetchFn = fetch,
  ghFn = ghDownload,
} = {}) {
  const file = `convert-product-ui-${version}.tgz`
  const path = join(dir, file)

  if (existsSync(path) && sha256Of(path) === sha256) return `Product UI ${version} already in vendor/`

  mkdirSync(dir, { recursive: true })
  const token = env.GH_TOKEN || env.GITHUB_TOKEN
  if (token) await apiDownload({ version, repo, file, path, token, fetchFn })
  else ghFn({ version, repo, file, dir })

  if (!existsSync(path) || sha256Of(path) !== sha256) {
    rmSync(path, { force: true })
    throw new Error(`Product UI ${version} checksum mismatch; expected ${sha256}. Archive removed.`)
  }
  return `Product UI ${version} downloaded and verified`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log(await ensureProductUi())
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
