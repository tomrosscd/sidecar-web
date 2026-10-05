import { loadPrompts } from './prompts'
import type { Prompt, PromptCollection } from './types'

export type ResolvedCollection = Omit<PromptCollection, 'promptSlugs'> & { prompts: Prompt[] }

/**
 * Collections come from the top-level `collections` array in prompts.json, which the sidecar repo owns and
 * validates. Slugs that no longer exist are dropped, and a collection left empty is hidden.
 */
export function resolveCollections(
  prompts: readonly Prompt[],
  collections: readonly PromptCollection[] | undefined,
): ResolvedCollection[] {
  const bySlug = new Map(prompts.map((p) => [p.slug, p]))
  return (collections ?? [])
    .map(({ promptSlugs, ...rest }) => ({
      ...rest,
      prompts: promptSlugs.flatMap((s) => bySlug.get(s) ?? []),
    }))
    .filter((c) => c.prompts.length > 0)
}

/** Fails the build when prompts.json has no usable collections, since the site links to them. */
export async function loadCollections(): Promise<ResolvedCollection[]> {
  const { prompts, collections } = await loadPrompts()
  const resolved = resolveCollections(prompts, collections)
  if (resolved.length === 0) {
    throw new Error('prompts.json has no usable collections. Add a top-level "collections" array in the sidecar repo.')
  }
  return resolved
}
