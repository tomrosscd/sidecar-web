import { SHOW_SKILLS } from '@/config/site'
import type { ResolvedCollection } from './collections'
import { loadSkills } from './skills'
import type { Prompt } from './types'

export type SearchEntry = {
  id: string
  label: string
  group: 'Pages' | 'Collections' | 'Prompts' | 'Skills'
  href: string
  keywords: string[]
  hint?: string
}

export const PAGE_ENTRIES: SearchEntry[] = [
  { id: 'page-library', label: 'Prompt library', group: 'Pages', href: '/', keywords: ['home', 'prompts'] },
  { id: 'page-collections', label: 'Collections', group: 'Pages', href: '/collections/', keywords: ['packs', 'sets'] },
  ...(SHOW_SKILLS
    ? [{ id: 'page-skills', label: 'Skills', group: 'Pages' as const, href: '/skills/', keywords: ['skills'] }]
    : []),
  { id: 'page-saved', label: 'Saved prompts', group: 'Pages', href: '/saved/', keywords: ['bookmarks', 'favourites'] },
  {
    id: 'page-extension',
    label: 'Sidecar Extension',
    group: 'Pages',
    href: '/extension/',
    keywords: ['chrome', 'install', 'sidekick'],
  },
]

/** Everything the command palette can find. Built on the server from the build-time data. */
export function buildSearchEntries(
  prompts: readonly Prompt[],
  collections: readonly ResolvedCollection[],
): SearchEntry[] {
  return [
    ...PAGE_ENTRIES,
    ...collections.map((c) => ({
      id: `collection-${c.slug}`,
      label: c.title,
      group: 'Collections' as const,
      href: `/collections/${c.slug}/`,
      keywords: [c.description ?? ''],
      hint: `${c.prompts.length} prompts`,
    })),
    ...(SHOW_SKILLS
      ? loadSkills().map((k) => ({
          id: `skill-${k.slug}`,
          label: k.title,
          group: 'Skills' as const,
          href: `/skills/${k.slug}/`,
          keywords: [k.category, k.summary ?? ''],
          hint: k.category,
        }))
      : []),
    ...prompts.map((p) => ({
      id: `prompt-${p.slug}`,
      label: p.title,
      group: 'Prompts' as const,
      href: `/prompts/${p.slug}/`,
      keywords: [p.category, p.description ?? '', p.slug],
      hint: p.category,
    })),
  ]
}
