// A parity port of the Sidecar Extension's prompts.js (buildPrompt, getCmpText) and the placeholder
// substitution in panel.js (buildPreviewText). Behaviour must stay identical: copied text has to match
// the extension for the same inputs. Do not tidy the regexes without regenerating the parity fixtures.

const PREVIOUS_PERIOD: Record<string, string> = {
  'last 7 days': 'the previous 7 days',
  'last 14 days': 'the previous 14 days',
  'last 30 days': 'the previous 30 days',
  'last 60 days': 'the previous 60 days',
  'last 90 days': 'the previous 90 days',
  'last quarter': 'the previous quarter',
  'last 6 months': 'the previous 6 months',
  'last 12 months': 'the previous 12 months',
}

/** Wording for {{CMP}}, or null for no comparison. `comparison` is 'prev', 'yoy', 'none' or custom text. */
export function getCmpText(timeframe: string, comparison: string | null | undefined): string | null {
  if (!comparison || comparison === 'none') return null
  if (comparison === 'yoy') return 'the same period last year'
  if (comparison !== 'prev') return comparison
  return PREVIOUS_PERIOD[timeframe] || 'the previous comparable period'
}

/** Fills {{TF}} and {{CMP}} in a prompt body. */
export function buildPrompt(
  prompt: { body?: string },
  timeframe: string,
  comparison: string | null | undefined,
): string {
  const tf = 'the ' + timeframe
  const cmp = getCmpText(timeframe, comparison)
  let t = (prompt.body || '').replace(/\{\{TF\}\}/g, tf)
  if (cmp) {
    t = t.replace(/\{\{CMP\}\}/g, cmp)
  } else {
    t = t
      .replace(/, compared to \{\{CMP\}\}/gi, '')
      .replace(/ and compare it to \{\{CMP\}\}/gi, '')
      .replace(/ compared to \{\{CMP\}\}/gi, '')
      .replace(/\{\{CMP\}\}/g, 'the previous comparable period')
  }
  return t
}

/** Substitutes user-filled [Bracketed] placeholders. Blank values leave the token in place. */
export function fillPlaceholders(
  template: string,
  values: ReadonlyMap<string, string> | Record<string, string>,
): string {
  const entries = values instanceof Map ? [...values] : Object.entries(values)
  let text = template
  for (const [token, val] of entries) if (val) text = text.split(token).join(val)
  return text
}

/** True when text still holds an unfilled [placeholder] or {{token}}, as the extension checks before copying. */
export function hasUnfilledPlaceholders(text: string): boolean {
  return /\[[^\]]+\]/.test(text) || /\{\{[^}]+\}\}/.test(text)
}

export type PromptSegment = { text: string; kind: 'text' | 'tf' | 'cmp' }

// Private-use markers that cannot occur in prompt text.
const TF_OPEN = ''
const TF_CLOSE = ''
const CMP_OPEN = ''
const CMP_CLOSE = ''

/**
 * The same text as buildPrompt, split so the substituted timeframe and comparison can be highlighted
 * (the extension shows them yellow and green). Joining the segments always equals buildPrompt's output.
 * When there is no comparison, the removed or fallback wording is left unhighlighted.
 */
export function buildPromptSegments(
  prompt: { body?: string },
  timeframe: string,
  comparison: string | null | undefined,
): PromptSegment[] {
  const hasCmp = getCmpText(timeframe, comparison) !== null
  let body = (prompt.body || '').replace(/\{\{TF\}\}/g, `${TF_OPEN}{{TF}}${TF_CLOSE}`)
  if (hasCmp) body = body.replace(/\{\{CMP\}\}/g, `${CMP_OPEN}{{CMP}}${CMP_CLOSE}`)
  const marked = buildPrompt({ body }, timeframe, comparison)
  const segments: PromptSegment[] = []
  let kind: PromptSegment['kind'] = 'text'
  let text = ''
  const flush = () => {
    if (text) segments.push({ text, kind })
    text = ''
  }
  for (const ch of marked) {
    if (ch === TF_OPEN || ch === CMP_OPEN) {
      flush()
      kind = ch === TF_OPEN ? 'tf' : 'cmp'
    } else if (ch === TF_CLOSE || ch === CMP_CLOSE) {
      flush()
      kind = 'text'
    } else text += ch
  }
  flush()
  return segments
}
