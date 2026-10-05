import type { Metadata } from 'next'
import { SavedPrompts } from '@/components/saved-prompts'
import { loadPrompts } from '@/lib/prompts'

export const metadata: Metadata = { title: 'Saved prompts' }

export default async function SavedPage() {
  const { prompts } = await loadPrompts()
  return <SavedPrompts prompts={prompts} />
}
