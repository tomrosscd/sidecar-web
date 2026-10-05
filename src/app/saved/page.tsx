import type { Metadata } from 'next'
import { SavedPrompts } from '@/components/saved-prompts'

export const metadata: Metadata = { title: 'Saved prompts' }

export default function SavedPage() {
  return <SavedPrompts />
}
