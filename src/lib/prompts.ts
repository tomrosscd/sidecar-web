import { validatePayload } from './validate-prompts'
import type { PromptsPayload } from './types'

const DEFAULT_PROMPTS_URL = 'https://convert-sidecar-prompts.pages.dev/prompts.json'

/** The PROMPTS_URL environment variable overrides the default, so a build can read another copy. */
export function promptsUrl(env: Record<string, string | undefined> = process.env): string {
  return env.PROMPTS_URL?.trim() || DEFAULT_PROMPTS_URL
}

export const PROMPTS_URL = promptsUrl()

let cached: Promise<PromptsPayload> | undefined

/**
 * Fetches and validates the prompt library. Call from server components or generateStaticParams, so it
 * runs at build time. Invalid or unreachable data throws, which fails the build. No local copy exists.
 */
export function loadPrompts(): Promise<PromptsPayload> {
  cached ??= fetchPrompts()
  return cached
}

async function fetchPrompts(): Promise<PromptsPayload> {
  const res = await fetch(PROMPTS_URL)
  if (!res.ok) throw new Error(`Could not fetch ${PROMPTS_URL}: HTTP ${res.status}`)
  const data: unknown = await res.json()
  const errors = validatePayload(data)
  if (errors.length > 0) {
    throw new Error(`Invalid prompts data from ${PROMPTS_URL}:\n- ${errors.join('\n- ')}`)
  }
  return data as PromptsPayload
}
