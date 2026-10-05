// Spot check: every live prompt x timeframe x comparison built by the web port and by the extension's own
// prompts.js must be identical. Usage: node --experimental-strip-types scripts/parity-live.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import vm from 'node:vm'
import { buildPrompt } from '../src/lib/build-prompt.ts'

const ext = {}
const src = join(import.meta.dirname, '..', '..', '_ref', 'sidecar', 'prompts.js')
vm.runInNewContext(`${readFileSync(src, 'utf8')}\nthis.buildPrompt = buildPrompt`, ext)

const { prompts } = await (await fetch('https://tomrosscd.github.io/sidecar/prompts.json')).json()
const timeframes = ['last 7 days', 'last 30 days', 'last quarter', 'last 12 months', '1 to 14 March 2026']
const comparisons = ['prev', 'yoy', 'none', 'the week before launch']
let n = 0
let bad = 0
for (const p of prompts)
  for (const tf of timeframes)
    for (const cmp of comparisons) {
      n++
      if (buildPrompt(p, tf, cmp) !== ext.buildPrompt(p, tf, cmp)) {
        bad++
        console.error('MISMATCH', p.slug, tf, cmp)
      }
    }
console.log(`${n} combinations, ${bad} mismatches`)
process.exit(bad ? 1 : 0)
