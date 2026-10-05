/** A prompt as published in sidecar's prompts.json. Fields after `followUp` are optional and render when present. */
export type Prompt = {
  slug: string
  title: string
  category: string
  description?: string
  body: string
  placeholders: string[]
  featured?: boolean
  recommended?: boolean
  followUp?: string
  whenToUse?: string
  caveats?: string
  useCases?: string[]
  dataSources?: string[]
  level?: string
  visibility?: string
}

export type PromptCollection = {
  slug: string
  title: string
  description?: string
  promptSlugs: string[]
}

export type PromptsPayload = {
  schema?: number
  updated?: string
  count?: number
  prompts: Prompt[]
  collections?: PromptCollection[]
}
