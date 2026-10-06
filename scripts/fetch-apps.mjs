// Copy this file into each Convert app as scripts/fetch-apps.mjs and run it before the build.
//
// It downloads the shared app list and marks from tomrosscd/convert-apps (private) through the
// GitHub API, then writes:
//   src/config/apps.generated.json  the live apps, committed so local builds work offline
//   public/apps/<mark>              the marks those apps use
//
// The token comes from GH_TOKEN (set it to the PRODUCT_UI_TOKEN secret in GitHub Actions or in
// Cloudflare's build settings), or from your own `gh` login locally. Locally it falls back to the
// committed copy if the download fails. In CI (CI or CF_PAGES set) it fails the build instead.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = 'tomrosscd/convert-apps'
const root = join(import.meta.dirname, '..')
const listPath = join(root, 'src', 'config', 'apps.generated.json')
const marksDir = join(root, 'public', 'apps')

const inCi = Boolean(process.env.CI || process.env.CF_PAGES)

function token() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

const auth = token()

async function download(path) {
  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: { Accept: 'application/vnd.github.raw', ...(auth && { Authorization: `Bearer ${auth}` }) },
  })
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

let data
try {
  data = JSON.parse((await download('apps.json')).toString('utf8'))
} catch (error) {
  if (!inCi && existsSync(listPath)) {
    console.warn(`Could not download the app list from ${REPO}; using the committed copy.`)
    process.exit(0)
  }
  console.error(`Could not download the app list from ${REPO}. Check GH_TOKEN can read it. ${error.message}`)
  process.exit(1)
}

if (data.schema !== 1 || !Array.isArray(data.apps)) {
  console.error(`${REPO}/apps.json has an unexpected shape (schema ${data.schema}). Update this script.`)
  process.exit(1)
}

const apps = data.apps
  .filter((app) => app.status === 'live')
  .map(({ id, label, href, description, mark, markTreatment }) => ({
    id,
    label,
    href,
    description,
    markSrc: `/apps/${mark}`,
    markTreatment,
  }))

mkdirSync(marksDir, { recursive: true })
for (const mark of new Set(apps.map((app) => app.markSrc.replace('/apps/', '')))) {
  writeFileSync(join(marksDir, mark), await download(`marks/${mark}`))
}

mkdirSync(join(root, 'src', 'config'), { recursive: true })
writeFileSync(listPath, `${JSON.stringify(apps, null, 2)}\n`)
console.log(`App list updated: ${apps.map((app) => app.id).join(', ')}`)
