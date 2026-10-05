// Downloads the pinned Product UI release archive into vendor/ before `pnpm install`.
// cd-product-ui is private, so the archive is fetched with the GitHub CLI (your own `gh`
// login locally, the PRODUCT_UI_TOKEN secret in CI) and never committed to this public repo.
// To upgrade: change VERSION and SHA256 (from the release's SHA256SUMS), then run
// `pnpm product-ui` and `pnpm install`.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const VERSION = '1.5.0'
const SHA256 = '1f7109bcae35b9fe96d80d8f7709e95a0b58cbfb169c70d07d472258991ecb63'
const REPO = 'tomrosscd/cd-product-ui'

const dir = join(import.meta.dirname, '..', 'vendor')
const file = `convert-product-ui-${VERSION}.tgz`
const path = join(dir, file)

const digest = () => createHash('sha256').update(readFileSync(path)).digest('hex')

if (existsSync(path) && digest() === SHA256) {
  console.log(`Product UI ${VERSION} already in vendor/`)
  process.exit(0)
}

mkdirSync(dir, { recursive: true })
try {
  execFileSync('gh', ['release', 'download', `v${VERSION}`, '-R', REPO, '-p', file, '-D', dir, '--clobber'], {
    stdio: 'inherit',
  })
} catch {
  console.error(
    `Could not download Product UI ${VERSION}. Sign in with \`gh auth login\` using an account that can read ${REPO}.`,
  )
  process.exit(1)
}

if (digest() !== SHA256) {
  rmSync(path)
  console.error(`Product UI ${VERSION} checksum mismatch; expected ${SHA256}. Archive removed.`)
  process.exit(1)
}
console.log(`Product UI ${VERSION} downloaded and verified`)
