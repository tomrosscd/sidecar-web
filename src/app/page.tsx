import { PromptLibrary } from '@/components/prompt-library'
import { loadPrompts } from '@/lib/prompts'

export default async function HomePage() {
  const { updated } = await loadPrompts()
  return <PromptLibrary updated={updated} />
}
