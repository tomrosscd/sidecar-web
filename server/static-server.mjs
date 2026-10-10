// Serves the static export in `out/` on Cloud Run. Sign-in is Google's Identity-Aware Proxy in front of
// this service, so there is no auth code here. It only serves files, adds the noindex and security
// headers that Cloudflare's `_headers` file used to add, and answers unknown paths with the 404 page.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

/** Maps a request path to a file under root, or null. Never leaves root. */
export async function resolveFile(root, urlPath) {
  let decoded
  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null
  const clean = normalize(decoded).replace(/^([/\\])+/, '')
  const target = join(root, clean)
  if (target !== root && !target.startsWith(root + sep)) return null
  for (const candidate of [target, join(target, 'index.html'), `${target}.html`]) {
    if (candidate !== root && (await isFile(candidate))) return candidate
  }
  return null
}

export function createStaticServer(root) {
  return createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD', ...HEADERS }).end()
      return
    }
    const { pathname } = new URL(req.url ?? '/', 'http://localhost')
    const file = await resolveFile(root, pathname)
    const status = file ? 200 : 404
    const path = file ?? join(root, '404.html')
    let body
    try {
      body = await readFile(path)
    } catch {
      body = Buffer.from('Not found')
    }
    const immutable = pathname.startsWith('/_next/static/')
    res.writeHead(status, {
      'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      ...HEADERS,
    })
    res.end(req.method === 'HEAD' ? undefined : body)
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(process.cwd(), 'out')
  const port = Number(process.env.PORT) || 8080
  createStaticServer(root).listen(port, '0.0.0.0', () => console.log(`Serving ${root} on ${port}`))
}
