import type { PromptsPayload } from './types'

const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0

/**
 * Returns a list of problems with a prompts payload (empty when valid).
 * Applies the Sidecar Extension's isValidPayload() rules to every prompt, plus unique slugs
 * and followUp slugs that point at a real prompt.
 */
export function validatePayload(data: unknown): string[] {
  const errors: string[] = []
  const prompts = (data as { prompts?: unknown } | null)?.prompts
  if (!Array.isArray(prompts)) return ['prompts is not an array']

  const slugs = new Set<string>()
  prompts.forEach((p, i) => {
    const where = `prompts[${i}]${isText(p?.slug) ? ` (${p.slug})` : ''}`
    if (!isText(p?.slug)) errors.push(`${where}: slug must be a non-empty string`)
    if (!isText(p?.title)) errors.push(`${where}: title must be a non-empty string`)
    if (!isText(p?.category)) errors.push(`${where}: category must be a non-empty string`)
    if (!isText(p?.body)) errors.push(`${where}: body must be a non-empty string`)
    if (!Array.isArray(p?.placeholders)) errors.push(`${where}: placeholders must be an array`)
    if (isText(p?.slug)) {
      if (slugs.has(p.slug)) errors.push(`${where}: duplicate slug`)
      slugs.add(p.slug)
    }
  })

  prompts.forEach((p, i) => {
    if (p?.followUp !== undefined && p.followUp !== null && !slugs.has(p.followUp)) {
      errors.push(`prompts[${i}] (${p.slug}): followUp "${p.followUp}" is not a known slug`)
    }
  })

  const collections = (data as { collections?: unknown }).collections
  if (collections !== undefined) {
    if (!Array.isArray(collections)) errors.push('collections must be an array when present')
    else
      collections.forEach((c, i) => {
        if (!isText(c?.slug) || !isText(c?.title) || !Array.isArray(c?.promptSlugs))
          errors.push(`collections[${i}]: needs slug, title and promptSlugs`)
        else
          for (const s of c.promptSlugs)
            if (!slugs.has(s)) errors.push(`collections[${i}] (${c.slug}): unknown prompt slug "${s}"`)
      })
  }
  return errors
}

export function isValidPayload(data: unknown): data is PromptsPayload {
  return validatePayload(data).length === 0
}
