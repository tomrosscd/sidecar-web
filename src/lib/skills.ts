import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Skill = {
  slug: string
  title: string
  summary?: string
  category: string
  owner?: string
  featured: boolean
  recommended: boolean
  version?: number
  versionLabel?: string
  updated?: string
  useCases: string[]
  changelog?: string
  /** The skill itself, as Markdown. */
  content: string
}

const SKILLS_DIR = join(process.cwd(), 'content', 'skills')

/**
 * Splits a skill file into front matter and body. Supports the small subset the skills use:
 * `key: value` lines, `- item` lists under a key, and true/false. No YAML dependency.
 */
export function parseSkill(source: string, slug: string): Skill {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source)
  if (!match) throw new Error(`Skill "${slug}": missing front matter between --- lines`)
  const meta: Record<string, string | string[]> = {}
  let listKey: string | null = null
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && listKey) {
      ;(meta[listKey] as string[]).push(item[1].trim())
      continue
    }
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!kv) throw new Error(`Skill "${slug}": cannot read front matter line "${line}"`)
    if (kv[2] === '') {
      meta[kv[1]] = []
      listKey = kv[1]
    } else {
      meta[kv[1]] = kv[2].trim()
      listKey = null
    }
  }
  const text = (k: string) => (typeof meta[k] === 'string' && meta[k] ? (meta[k] as string) : undefined)
  const title = text('title')
  const category = text('category')
  if (!title) throw new Error(`Skill "${slug}": title is required`)
  if (!category) throw new Error(`Skill "${slug}": category is required`)
  const version = text('version')
  if (version !== undefined && !/^\d+$/.test(version))
    throw new Error(`Skill "${slug}": version must be a whole number`)
  const content = match[2].trim()
  if (!content) throw new Error(`Skill "${slug}": the skill body is empty`)
  return {
    slug,
    title,
    summary: text('summary'),
    category,
    owner: text('owner'),
    featured: text('featured') === 'true',
    recommended: text('recommended') === 'true',
    version: version === undefined ? undefined : Number(version),
    versionLabel: text('versionLabel'),
    updated: text('updated'),
    useCases: Array.isArray(meta.useCases) ? (meta.useCases as string[]) : [],
    changelog: text('changelog'),
    content,
  }
}

/** Reads every skill in content/skills at build time. A malformed file fails the build. */
export function loadSkills(): Skill[] {
  return readdirSync(SKILLS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseSkill(readFileSync(join(SKILLS_DIR, f), 'utf8'), f.replace(/\.md$/, '')))
    .sort((a, b) => a.title.localeCompare(b.title))
}
