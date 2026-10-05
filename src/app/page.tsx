import { PromptLibrary } from '@/components/prompt-library'
import { loadPrompts } from '@/lib/prompts'

export default async function HomePage() {
  const { prompts, updated } = await loadPrompts()
  return <PromptLibrary prompts={prompts} updated={updated} />
}
