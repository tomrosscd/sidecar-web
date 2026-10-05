// Regenerates tests/fixtures/extension-parity.json by running the Sidecar Extension's own prompts.js.
// Usage: node scripts/generate-parity-fixtures.mjs [path/to/sidecar/prompts.js]
// Defaults to the read-only reference checkout at ../_ref/sidecar. Commit the result.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import vm from 'node:vm'

const src = process.argv[2] ?? join(import.meta.dirname, '..', '..', '_ref', 'sidecar', 'prompts.js')
const ctx = {}
vm.runInNewContext(`${readFileSync(src, 'utf8')}\nthis.buildPrompt = buildPrompt; this.getCmpText = getCmpText`, ctx)

// Bodies cover every {{CMP}} removal branch plus repeated tokens and none at all.
const bodies = [
  'Analyse {{TF}}, compared to {{CMP}}.\n\nSummarise.',
  'Review {{TF}} and compare it to {{CMP}}. Then list wins.',
  'Look at {{TF}} compared to {{CMP}} for [Campaign Name].',
  'Standalone {{CMP}} mention over {{TF}}, again {{TF}}.',
  'Compared TO {{CMP}} case, over {{TF}}',
  'No tokens here.',
  '',
]
const timeframes = [
  'last 7 days',
  'last 14 days',
  'last 30 days',
  'last 60 days',
  'last 90 days',
  'last quarter',
  'last 6 months',
  'last 12 months',
  'the selected period',
  '1 to 14 March 2026',
]
const comparisons = ['prev', 'yoy', 'none', '', null, 'the week before launch']

const cases = []
for (const body of bodies)
  for (const timeframe of timeframes)
    for (const comparison of comparisons)
      cases.push({
        body,
        timeframe,
        comparison,
        cmpText: ctx.getCmpText(timeframe, comparison),
        expected: ctx.buildPrompt({ body }, timeframe, comparison),
      })

const dir = join(import.meta.dirname, '..', 'tests', 'fixtures')
mkdirSync(dir, { recursive: true })
writeFileSync(
  join(dir, 'extension-parity.json'),
  JSON.stringify({ generatedFrom: 'sidecar/prompts.js', cases }, null, 2) + '\n',
)
console.log(`Wrote ${cases.length} cases`)
