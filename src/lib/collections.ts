import local from '../../data/collections.json'
import { loadPrompts } from './prompts'
import type { Prompt, PromptCollection } from './types'

export type ResolvedCollection = Omit<PromptCollection, 'promptSlugs'> & { prompts: Prompt[] }

/**
 * Collections for the site. Until prompts.json carries a top-level `collections` array, they come from
 * data/collections.json. Slugs that no longer exist are dropped, and a collection left empty is hidden.
 */
export function resolveCollections(
  prompts: readonly Prompt[],
  remote: readonly PromptCollection[] | undefined,
  fallback: readonly PromptCollection[] = local.collections,
): ResolvedCollection[] {
  const bySlug = new Map(prompts.map((p) => [p.slug, p]))
  return (remote && remote.length > 0 ? remote : fallback)
    .map(({ promptSlugs, ...rest }) => ({
      ...rest,
      prompts: promptSlugs.flatMap((s) => bySlug.get(s) ?? []),
    }))
    .filter((c) => c.prompts.length > 0)
}

export async function loadCollections(): Promise<ResolvedCollection[]> {
  const { prompts, collections } = await loadPrompts()
  return resolveCollections(prompts, collections)
}
